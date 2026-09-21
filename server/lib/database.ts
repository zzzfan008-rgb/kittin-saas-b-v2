import { nanoid } from "nanoid";
import { config } from "../config";
import { hashPassword, validatePassword } from "./password";
import { importSqliteIfNeeded } from "./sqliteImport";
import {
  assertDatabaseVersion,
  databaseInitialization,
  db,
  query,
  queryOne,
  setDatabaseInitialization,
  transaction,
} from "./databaseRuntime";

export { closeDatabaseForTests, db, query, queryOne, transaction } from "./databaseRuntime";

export async function initializeDatabase(): Promise<void> {
  const current = databaseInitialization();
  if (current) return current;
  const initializing = (async () => {
    await assertDatabaseVersion();
    await migrate();
    await bootstrapInitialAdmin();
  })();
  setDatabaseInitialization(initializing);
  return initializing;
}

async function migrate(): Promise<void> {
  const importedRows = await transaction(async (client) => {
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        version INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        applied_at TEXT NOT NULL
      )
    `);
    await client.query("LOCK TABLE schema_migrations IN EXCLUSIVE MODE");
    const appliedRows = await query<{ version: number }>(
      "SELECT version FROM schema_migrations",
      [],
      client,
    );
    const applied = new Set(appliedRows.map((row) => row.version));

    if (!applied.has(1)) {
      await client.query(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      account_id TEXT NOT NULL UNIQUE,
      display_name TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('admin','user')),
      password_hash TEXT NOT NULL,
      must_change_password INTEGER NOT NULL DEFAULT 0,
      active INTEGER NOT NULL DEFAULT 1,
      deleted_at TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS sessions (
      token_hash TEXT PRIMARY KEY,
      user_id TEXT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
      created_at TEXT NOT NULL,
      expires_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS sessions_expiry_idx ON sessions(expires_at);

    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      owner_id TEXT NOT NULL REFERENCES users(id),
      name TEXT NOT NULL,
      flow_json TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      created_at TEXT NOT NULL,
      deleted_at TEXT,
      purge_after TEXT
    );
    CREATE INDEX IF NOT EXISTS projects_owner_idx ON projects(owner_id, updated_at DESC);

    CREATE TABLE IF NOT EXISTS files (
      id TEXT PRIMARY KEY,
      owner_id TEXT REFERENCES users(id),
      source_type TEXT NOT NULL DEFAULT 'upload',
      project_id TEXT,
      node_id TEXT,
      run_id TEXT,
      mime_type TEXT,
      width INTEGER,
      height INTEGER,
      byte_length INTEGER,
      normalized BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TEXT NOT NULL,
      deleted_at TEXT,
      purge_after TEXT
    );
    CREATE INDEX IF NOT EXISTS files_owner_idx ON files(owner_id, created_at DESC);

    CREATE TABLE IF NOT EXISTS assets (
      id TEXT PRIMARY KEY,
      owner_id TEXT REFERENCES users(id),
      scope TEXT NOT NULL CHECK (scope IN ('global','private','shared')),
      name TEXT NOT NULL,
      category TEXT NOT NULL CHECK (category IN ('print','fabric','reference','model')),
      image TEXT NOT NULL,
      source_note TEXT,
      created_at TEXT NOT NULL,
      deleted_at TEXT,
      purge_after TEXT
    );
    CREATE INDEX IF NOT EXISTS assets_scope_owner_idx ON assets(scope, owner_id, created_at DESC);

    CREATE TABLE IF NOT EXISTS project_asset_refs (
      project_id TEXT NOT NULL,
      asset_id TEXT NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
      created_at TEXT NOT NULL,
      PRIMARY KEY (project_id, asset_id)
    );

    CREATE TABLE IF NOT EXISTS generation_runs (
      id TEXT PRIMARY KEY,
      owner_id TEXT NOT NULL REFERENCES users(id),
      project_id TEXT,
      project_name TEXT,
      node_id TEXT NOT NULL,
      node_label TEXT NOT NULL,
      kind TEXT NOT NULL,
      prompt TEXT,
      parameters_json TEXT,
      reference_images_json TEXT,
      model TEXT,
      requested_count INTEGER NOT NULL DEFAULT 1,
      successful_count INTEGER NOT NULL DEFAULT 0,
      provider_requests INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL CHECK (status IN ('queued','running','success','error')),
      error TEXT,
      started_at BIGINT NOT NULL,
      finished_at BIGINT,
      deleted_at TEXT,
      purge_after TEXT
    );
    CREATE INDEX IF NOT EXISTS generation_runs_owner_idx ON generation_runs(owner_id, started_at DESC);

    CREATE TABLE IF NOT EXISTS generation_outputs (
      id TEXT PRIMARY KEY,
      run_id TEXT NOT NULL REFERENCES generation_runs(id) ON DELETE CASCADE,
      image TEXT NOT NULL DEFAULT '',
      prompt TEXT,
      status TEXT NOT NULL CHECK (status IN ('success','error')),
      error TEXT,
      created_at BIGINT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS generation_outputs_run_idx ON generation_outputs(run_id, created_at);

    CREATE TABLE IF NOT EXISTS usage_events (
      id TEXT PRIMARY KEY,
      owner_id TEXT NOT NULL REFERENCES users(id),
      run_id TEXT NOT NULL UNIQUE REFERENCES generation_runs(id) ON DELETE RESTRICT,
      project_id TEXT,
      node_id TEXT NOT NULL,
      model TEXT,
      successful_count INTEGER NOT NULL CHECK (successful_count > 0),
      provider_requests INTEGER NOT NULL DEFAULT 1,
      duration_ms INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      deleted_at TEXT,
      purge_after TEXT
    );
    CREATE INDEX IF NOT EXISTS usage_owner_idx ON usage_events(owner_id, created_at DESC);
      `);
      await client.query(
        "INSERT INTO schema_migrations (version, name, applied_at) VALUES (1, $1, $2)",
        ["initial_schema", new Date().toISOString()],
      );
    }

    // 旧 SQLite 的 project_asset_refs 尚无 project_id 外键，必须先导入，
    // 再由迁移 2 清理其中的孤立引用并建立正式约束。
    const imported = await importSqliteIfNeeded(client);

    if (!applied.has(2)) {
      // 旧版允许 project_id 指向不存在的项目；先清理孤立行，再补正式外键。
      await client.query(`
        DELETE FROM project_asset_refs refs
        WHERE NOT EXISTS (SELECT 1 FROM projects WHERE projects.id = refs.project_id)
           OR NOT EXISTS (SELECT 1 FROM assets WHERE assets.id = refs.asset_id)
      `);
      await client.query(`
        DO $$
        DECLARE
          existing_constraint RECORD;
        BEGIN
          FOR existing_constraint IN
            SELECT constraint_row.conname
            FROM pg_constraint constraint_row
            JOIN pg_attribute column_row
              ON column_row.attrelid = constraint_row.conrelid
             AND column_row.attnum = ANY(constraint_row.conkey)
            WHERE constraint_row.contype = 'f'
              AND constraint_row.conrelid = 'project_asset_refs'::regclass
              AND constraint_row.confrelid = 'projects'::regclass
              AND column_row.attname = 'project_id'
          LOOP
            EXECUTE format(
              'ALTER TABLE project_asset_refs DROP CONSTRAINT %I',
              existing_constraint.conname
            );
          END LOOP;
          ALTER TABLE project_asset_refs
            ADD CONSTRAINT project_asset_refs_project_id_fkey
            FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE;
        END
        $$
      `);
      await client.query(
        "CREATE INDEX IF NOT EXISTS project_asset_refs_asset_idx ON project_asset_refs(asset_id)",
      );
      await client.query(
        "INSERT INTO schema_migrations (version, name, applied_at) VALUES (2, $1, $2)",
        ["project_asset_refs_project_foreign_key", new Date().toISOString()],
      );
    }

    if (!applied.has(3)) {
      await client.query(`
        CREATE TABLE IF NOT EXISTS revoked_sessions (
          token_hash TEXT PRIMARY KEY,
          reason TEXT NOT NULL CHECK (reason IN ('replaced')),
          revoked_at TEXT NOT NULL,
          expires_at TEXT NOT NULL
        );
        CREATE INDEX IF NOT EXISTS revoked_sessions_expiry_idx ON revoked_sessions(expires_at);
      `);
      await client.query(
        "INSERT INTO schema_migrations (version, name, applied_at) VALUES (3, $1, $2)",
        ["revoked_session_reasons", new Date().toISOString()],
      );
    }

    if (!applied.has(4)) {
      await client.query("ALTER TABLE users DROP CONSTRAINT IF EXISTS users_account_id_key");
      await client.query(`
        CREATE UNIQUE INDEX IF NOT EXISTS users_active_account_id_unique
        ON users(account_id) WHERE deleted_at IS NULL
      `);
      await client.query(
        "INSERT INTO schema_migrations (version, name, applied_at) VALUES (4, $1, $2)",
        ["active_account_id_unique", new Date().toISOString()],
      );
    }

    if (!applied.has(5)) {
      await client.query(`
        ALTER TABLE files ADD COLUMN IF NOT EXISTS deleted_at TEXT;
        ALTER TABLE files ADD COLUMN IF NOT EXISTS purge_after TEXT;
        ALTER TABLE generation_runs ADD COLUMN IF NOT EXISTS deleted_at TEXT;
        ALTER TABLE generation_runs ADD COLUMN IF NOT EXISTS purge_after TEXT;
        ALTER TABLE usage_events ADD COLUMN IF NOT EXISTS deleted_at TEXT;
        ALTER TABLE usage_events ADD COLUMN IF NOT EXISTS purge_after TEXT;
        CREATE INDEX IF NOT EXISTS files_purge_idx ON files(purge_after);
        CREATE INDEX IF NOT EXISTS generation_runs_purge_idx ON generation_runs(purge_after);
        CREATE INDEX IF NOT EXISTS usage_events_purge_idx ON usage_events(purge_after);
      `);
      await client.query(
        "INSERT INTO schema_migrations (version, name, applied_at) VALUES (5, $1, $2)",
        ["account_data_retention_tombstones", new Date().toISOString()],
      );
    }

    if (!applied.has(6)) {
      await client.query(`
        ALTER TABLE generation_runs ADD COLUMN IF NOT EXISTS plan_json TEXT;
        ALTER TABLE generation_runs ADD COLUMN IF NOT EXISTS target_step_id TEXT;
        ALTER TABLE generation_runs ADD COLUMN IF NOT EXISTS run_type TEXT NOT NULL DEFAULT 'workflow';
        ALTER TABLE generation_runs ADD COLUMN IF NOT EXISTS updated_at BIGINT;
        ALTER TABLE generation_runs ADD COLUMN IF NOT EXISTS cancel_requested_at BIGINT;
        UPDATE generation_runs SET updated_at = COALESCE(updated_at, finished_at, started_at);
        ALTER TABLE generation_runs DROP CONSTRAINT IF EXISTS generation_runs_status_check;
        ALTER TABLE generation_runs ADD CONSTRAINT generation_runs_status_check CHECK (status IN (
          'queued','running','retry_wait','cancel_requested','cancelled',
          'succeeded','failed','outcome_unknown','success','error'
        ));
        ALTER TABLE generation_runs DROP CONSTRAINT IF EXISTS generation_runs_run_type_check;
        ALTER TABLE generation_runs ADD CONSTRAINT generation_runs_run_type_check
          CHECK (run_type IN ('workflow','direct'));

        CREATE TABLE IF NOT EXISTS generation_run_steps (
          id TEXT PRIMARY KEY,
          run_id TEXT NOT NULL REFERENCES generation_runs(id) ON DELETE CASCADE,
          step_index INTEGER NOT NULL,
          node_id TEXT NOT NULL,
          kind TEXT NOT NULL,
          step_json TEXT NOT NULL,
          status TEXT NOT NULL CHECK (status IN (
            'queued','running','retry_wait','cancel_requested','cancelled',
            'succeeded','failed','outcome_unknown'
          )),
          model TEXT,
          output_images_json TEXT NOT NULL DEFAULT '[]',
          prompts_json TEXT NOT NULL DEFAULT '[]',
          failures_json TEXT NOT NULL DEFAULT '[]',
          provider_requests INTEGER NOT NULL DEFAULT 0,
          error TEXT,
          started_at BIGINT,
          finished_at BIGINT,
          UNIQUE (run_id, step_index),
          UNIQUE (run_id, node_id)
        );
        CREATE INDEX IF NOT EXISTS generation_run_steps_run_idx
          ON generation_run_steps(run_id, step_index);

        CREATE TABLE IF NOT EXISTS generation_jobs (
          id TEXT PRIMARY KEY,
          run_id TEXT NOT NULL REFERENCES generation_runs(id) ON DELETE CASCADE,
          step_id TEXT NOT NULL UNIQUE REFERENCES generation_run_steps(id) ON DELETE CASCADE,
          idempotency_key TEXT NOT NULL UNIQUE,
          status TEXT NOT NULL CHECK (status IN (
            'queued','running','retry_wait','cancel_requested','cancelled',
            'succeeded','failed','outcome_unknown'
          )),
          retry_count INTEGER NOT NULL DEFAULT 0 CHECK (retry_count BETWEEN 0 AND 2),
          available_at BIGINT NOT NULL,
          worker_id TEXT,
          lease_expires_at BIGINT,
          attempt_started_at BIGINT,
          last_error TEXT,
          created_at BIGINT NOT NULL,
          updated_at BIGINT NOT NULL
        );
        CREATE INDEX IF NOT EXISTS generation_jobs_claim_idx
          ON generation_jobs(status, available_at, lease_expires_at);
        CREATE INDEX IF NOT EXISTS generation_jobs_run_idx ON generation_jobs(run_id);

        CREATE TABLE IF NOT EXISTS generation_run_events (
          run_id TEXT NOT NULL REFERENCES generation_runs(id) ON DELETE CASCADE,
          seq INTEGER NOT NULL,
          payload_json TEXT NOT NULL,
          created_at BIGINT NOT NULL,
          PRIMARY KEY (run_id, seq)
        );
        CREATE INDEX IF NOT EXISTS generation_run_events_created_idx
          ON generation_run_events(run_id, created_at);
      `);
      await client.query(
        "INSERT INTO schema_migrations (version, name, applied_at) VALUES (6, $1, $2)",
        ["durable_generation_queue", new Date().toISOString()],
      );
    }

    if (!applied.has(7)) {
      await client.query(`
        ALTER TABLE generation_run_steps
          ADD COLUMN IF NOT EXISTS provider_output_sizes_json TEXT NOT NULL DEFAULT '[]';
        ALTER TABLE generation_outputs
          ADD COLUMN IF NOT EXISTS provider_output_size TEXT;
      `);
      await client.query(
        "INSERT INTO schema_migrations (version, name, applied_at) VALUES (7, $1, $2)",
        ["provider_output_size_metadata", new Date().toISOString()],
      );
    }

    if (!applied.has(8)) {
      await client.query(`
        ALTER TABLE files ADD COLUMN IF NOT EXISTS mime_type TEXT;
        ALTER TABLE files ADD COLUMN IF NOT EXISTS width INTEGER;
        ALTER TABLE files ADD COLUMN IF NOT EXISTS height INTEGER;
        ALTER TABLE files ADD COLUMN IF NOT EXISTS byte_length INTEGER;
        ALTER TABLE files ADD COLUMN IF NOT EXISTS normalized BOOLEAN NOT NULL DEFAULT FALSE;
        ALTER TABLE files DROP CONSTRAINT IF EXISTS files_normalized_metadata_check;
        ALTER TABLE files ADD CONSTRAINT files_normalized_metadata_check CHECK (
          normalized = FALSE OR (
            mime_type IN ('image/png', 'image/jpeg') AND
            width > 0 AND height > 0 AND byte_length > 0
          )
        );
      `);
      await client.query(
        "INSERT INTO schema_migrations (version, name, applied_at) VALUES (8, $1, $2)",
        ["normalized_upload_metadata", new Date().toISOString()],
      );
    }

    if (!applied.has(9)) {
      await client.query(`
        ALTER TABLE generation_runs
          ADD COLUMN IF NOT EXISTS next_event_seq INTEGER NOT NULL DEFAULT 0;
        UPDATE generation_runs run
        SET next_event_seq = events.max_seq
        FROM (
          SELECT run_id, MAX(seq)::int AS max_seq
          FROM generation_run_events
          GROUP BY run_id
        ) events
        WHERE run.id = events.run_id
          AND run.next_event_seq < events.max_seq;

        ALTER TABLE generation_jobs ADD COLUMN IF NOT EXISTS run_started_at BIGINT;
        ALTER TABLE generation_jobs ADD COLUMN IF NOT EXISTS step_index INTEGER;
        UPDATE generation_jobs job
        SET run_started_at = run.started_at,
            step_index = step.step_index
        FROM generation_runs run, generation_run_steps step
        WHERE job.run_id = run.id
          AND job.step_id = step.id
          AND (job.run_started_at IS NULL OR job.step_index IS NULL);
        ALTER TABLE generation_jobs ALTER COLUMN run_started_at SET NOT NULL;
        ALTER TABLE generation_jobs ALTER COLUMN step_index SET NOT NULL;

        ALTER TABLE generation_jobs
          DROP CONSTRAINT IF EXISTS generation_jobs_retry_count_check;
        ALTER TABLE generation_jobs
          ADD CONSTRAINT generation_jobs_retry_count_check
          CHECK (retry_count BETWEEN 0 AND 3);

        CREATE INDEX IF NOT EXISTS generation_jobs_status_available_idx
          ON generation_jobs(status, available_at);
        CREATE INDEX IF NOT EXISTS generation_jobs_ready_order_idx
          ON generation_jobs(available_at, run_started_at, step_index, id)
          WHERE status IN ('queued','retry_wait');
        CREATE INDEX IF NOT EXISTS generation_jobs_prerequisite_idx
          ON generation_jobs(run_id, step_index, status);
      `);
      await client.query(
        "INSERT INTO schema_migrations (version, name, applied_at) VALUES (9, $1, $2)",
        ["generation_queue_concurrency_hardening", new Date().toISOString()],
      );
    }

    if (!applied.has(10)) {
      await client.query(`
        ALTER TABLE generation_runs
          ADD COLUMN IF NOT EXISTS client_request_id TEXT;
        ALTER TABLE generation_runs
          ADD COLUMN IF NOT EXISTS request_fingerprint TEXT;
        ALTER TABLE generation_runs
          DROP CONSTRAINT IF EXISTS generation_runs_client_request_pair_check;
        ALTER TABLE generation_runs
          ADD CONSTRAINT generation_runs_client_request_pair_check CHECK (
            (client_request_id IS NULL AND request_fingerprint IS NULL) OR
            (client_request_id IS NOT NULL AND request_fingerprint IS NOT NULL)
          );
        CREATE UNIQUE INDEX IF NOT EXISTS generation_runs_owner_client_request_unique
          ON generation_runs(owner_id, client_request_id)
          WHERE client_request_id IS NOT NULL;
      `);
      await client.query(
        "INSERT INTO schema_migrations (version, name, applied_at) VALUES (10, $1, $2)",
        ["generation_run_request_idempotency", new Date().toISOString()],
      );
    }

    if (!applied.has(11)) {
      await client.query(`
        CREATE TABLE IF NOT EXISTS user_tutorial_receipts (
          user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          tutorial_key TEXT NOT NULL,
          tutorial_version TEXT NOT NULL,
          outcome TEXT NOT NULL CHECK (outcome IN ('dismissed','completed')),
          acknowledged_at TEXT NOT NULL,
          PRIMARY KEY (user_id, tutorial_key, tutorial_version)
        );
      `);
      await client.query(
        "INSERT INTO schema_migrations (version, name, applied_at) VALUES (11, $1, $2)",
        ["versioned_tutorial_receipts", new Date().toISOString()],
      );
    }

    if (!applied.has(12)) {
      await client.query(`
        ALTER TABLE projects
          ADD COLUMN IF NOT EXISTS lifecycle TEXT NOT NULL DEFAULT 'saved';
        ALTER TABLE projects
          ADD COLUMN IF NOT EXISTS draft_revision INTEGER NOT NULL DEFAULT 0;

        UPDATE projects SET lifecycle = 'saved' WHERE lifecycle IS NULL;
        UPDATE projects SET draft_revision = 0 WHERE draft_revision IS NULL;

        ALTER TABLE projects ALTER COLUMN lifecycle SET DEFAULT 'saved';
        ALTER TABLE projects ALTER COLUMN lifecycle SET NOT NULL;
        ALTER TABLE projects ALTER COLUMN draft_revision SET DEFAULT 0;
        ALTER TABLE projects ALTER COLUMN draft_revision SET NOT NULL;

        ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_lifecycle_check;
        ALTER TABLE projects
          ADD CONSTRAINT projects_lifecycle_check
          CHECK (lifecycle IN ('initial_draft','saved'));
        ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_draft_revision_check;
        ALTER TABLE projects
          ADD CONSTRAINT projects_draft_revision_check
          CHECK (draft_revision >= 0);

        DROP INDEX IF EXISTS projects_active_initial_draft_owner_unique;
        CREATE UNIQUE INDEX projects_active_initial_draft_owner_unique
          ON projects(owner_id)
          WHERE lifecycle = 'initial_draft' AND deleted_at IS NULL;
      `);
      await client.query(
        "INSERT INTO schema_migrations (version, name, applied_at) VALUES (12, $1, $2)",
        ["initial_draft_project_lifecycle", new Date().toISOString()],
      );
    }

    if (!applied.has(13)) {
      await client.query(`
        ALTER TABLE generation_runs
          ADD COLUMN IF NOT EXISTS reference_inputs_json TEXT NOT NULL DEFAULT '[]';
        ALTER TABLE generation_run_steps
          ADD COLUMN IF NOT EXISTS reference_inputs_json TEXT NOT NULL DEFAULT '[]';
        ALTER TABLE generation_run_steps
          ADD COLUMN IF NOT EXISTS provider_images_json TEXT NOT NULL DEFAULT '[]';
        ALTER TABLE generation_outputs
          ADD COLUMN IF NOT EXISTS provider_image TEXT;
      `);
      await client.query(
        "INSERT INTO schema_migrations (version, name, applied_at) VALUES (13, $1, $2)",
        ["reference_role_and_provider_original_evidence", new Date().toISOString()],
      );
    }

    if (!applied.has(14)) {
      await client.query(`
        ALTER TABLE generation_runs
          ADD COLUMN IF NOT EXISTS retry_policy TEXT NOT NULL DEFAULT 'standard';
        ALTER TABLE generation_runs
          ADD COLUMN IF NOT EXISTS evaluation_case_id TEXT;
        ALTER TABLE generation_runs
          ADD COLUMN IF NOT EXISTS evaluation_authorization_id TEXT;
        ALTER TABLE generation_runs
          ADD COLUMN IF NOT EXISTS billing_reconciliation_status TEXT NOT NULL DEFAULT 'not-required';

        ALTER TABLE generation_runs DROP CONSTRAINT IF EXISTS generation_runs_run_type_check;
        ALTER TABLE generation_runs ADD CONSTRAINT generation_runs_run_type_check
          CHECK (run_type IN ('workflow','direct','evaluation'));
        ALTER TABLE generation_runs DROP CONSTRAINT IF EXISTS generation_runs_retry_policy_check;
        ALTER TABLE generation_runs ADD CONSTRAINT generation_runs_retry_policy_check
          CHECK (retry_policy IN ('standard','no-retry'));
        ALTER TABLE generation_runs DROP CONSTRAINT IF EXISTS generation_runs_evaluation_policy_check;
        ALTER TABLE generation_runs ADD CONSTRAINT generation_runs_evaluation_policy_check CHECK (
          (
            run_type = 'evaluation'
            AND retry_policy = 'no-retry'
            AND evaluation_case_id IS NOT NULL
            AND evaluation_authorization_id IS NOT NULL
          ) OR (
            run_type <> 'evaluation'
            AND retry_policy = 'standard'
            AND evaluation_case_id IS NULL
            AND evaluation_authorization_id IS NULL
          )
        );
        ALTER TABLE generation_runs DROP CONSTRAINT IF EXISTS generation_runs_billing_reconciliation_check;
        ALTER TABLE generation_runs ADD CONSTRAINT generation_runs_billing_reconciliation_check
          CHECK (billing_reconciliation_status IN (
            'not-required','pending','confirmed-not-billed','confirmed-billed'
          ));
        CREATE UNIQUE INDEX IF NOT EXISTS generation_runs_owner_evaluation_case_unique
          ON generation_runs(owner_id, evaluation_case_id)
          WHERE evaluation_case_id IS NOT NULL;
      `);
      await client.query(
        "INSERT INTO schema_migrations (version, name, applied_at) VALUES (14, $1, $2)",
        ["evaluation_run_no_retry_policy", new Date().toISOString()],
      );
    }

    if (!applied.has(15)) {
      await client.query(`
        CREATE TABLE IF NOT EXISTS evaluation_run_authorizations (
          authorization_id TEXT PRIMARY KEY
            CHECK (authorization_id ~ '^[A-Za-z0-9_-]{1,128}$'),
          owner_id TEXT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
          created_by_admin_id TEXT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
          scope_type TEXT NOT NULL CHECK (scope_type IN ('prompt-variant','evaluation-unit')),
          model_id TEXT NOT NULL,
          prompt_variant_id TEXT,
          evaluation_unit_key TEXT,
          max_provider_requests INTEGER NOT NULL CHECK (
            max_provider_requests >= 1 AND max_provider_requests <= 8
          ),
          budget_limit_minor BIGINT NOT NULL CHECK (budget_limit_minor > 0),
          budget_currency TEXT NOT NULL CHECK (budget_currency ~ '^[A-Z]{3}$'),
          reason TEXT NOT NULL CHECK (char_length(reason) BETWEEN 1 AND 500),
          expires_at BIGINT NOT NULL,
          status TEXT NOT NULL DEFAULT 'active'
            CHECK (status IN ('active','consumed','revoked','expired')),
          bound_case_id TEXT,
          bound_run_id TEXT REFERENCES generation_runs(id) ON DELETE RESTRICT,
          reserved_provider_requests INTEGER NOT NULL DEFAULT 0,
          used_provider_requests INTEGER NOT NULL DEFAULT 0,
          reserved_budget_minor BIGINT NOT NULL DEFAULT 0,
          created_at BIGINT NOT NULL,
          consumed_at BIGINT,
          CONSTRAINT evaluation_authorization_scope_check CHECK (
            (
              scope_type = 'prompt-variant'
              AND prompt_variant_id IS NOT NULL
              AND evaluation_unit_key IS NULL
            ) OR (
              scope_type = 'evaluation-unit'
              AND prompt_variant_id IS NULL
              AND evaluation_unit_key ~ '^sha256:[a-f0-9]{64}$'
            )
          ),
          CONSTRAINT evaluation_authorization_expiry_check CHECK (expires_at > created_at),
          CONSTRAINT evaluation_authorization_usage_check CHECK (
            reserved_provider_requests >= 0
            AND reserved_provider_requests <= max_provider_requests
            AND used_provider_requests >= 0
            AND used_provider_requests <= reserved_provider_requests
            AND reserved_budget_minor >= 0
            AND reserved_budget_minor <= budget_limit_minor
          ),
          CONSTRAINT evaluation_authorization_state_check CHECK (
            (
              status = 'consumed'
              AND bound_case_id IS NOT NULL
              AND bound_run_id IS NOT NULL
              AND reserved_provider_requests > 0
              AND reserved_budget_minor = budget_limit_minor
              AND consumed_at IS NOT NULL
            ) OR (
              status <> 'consumed'
              AND bound_case_id IS NULL
              AND bound_run_id IS NULL
              AND reserved_provider_requests = 0
              AND used_provider_requests = 0
              AND reserved_budget_minor = 0
              AND consumed_at IS NULL
            )
          )
        );
        CREATE UNIQUE INDEX IF NOT EXISTS evaluation_authorizations_owner_case_unique
          ON evaluation_run_authorizations(owner_id, bound_case_id)
          WHERE bound_case_id IS NOT NULL;
        CREATE UNIQUE INDEX IF NOT EXISTS evaluation_authorizations_bound_run_unique
          ON evaluation_run_authorizations(bound_run_id)
          WHERE bound_run_id IS NOT NULL;
        CREATE INDEX IF NOT EXISTS evaluation_authorizations_active_expiry_idx
          ON evaluation_run_authorizations(expires_at)
          WHERE status = 'active';
      `);
      await client.query(
        "INSERT INTO schema_migrations (version, name, applied_at) VALUES (15, $1, $2)",
        ["evaluation_run_authorization_ledger", new Date().toISOString()],
      );
    }

    // Evaluation evidence is deliberately a separate schema layer.
    if (!applied.has(16)) {
      await client.query(`
        CREATE TABLE IF NOT EXISTS evaluation_case_evidence (
          id TEXT PRIMARY KEY,
          run_id TEXT NOT NULL UNIQUE REFERENCES generation_runs(id) ON DELETE CASCADE,
          owner_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          case_id TEXT NOT NULL,
          sample_id TEXT NOT NULL,
          authorization_id TEXT NOT NULL,
          code_sha TEXT NOT NULL CHECK (code_sha ~ '^([a-f0-9]{40}|[a-f0-9]{64})$'),
          code_sha_source TEXT NOT NULL CHECK (code_sha_source IN ('git-head','build-identity')),
          code_dirty BOOLEAN NOT NULL DEFAULT FALSE,
          model_id TEXT NOT NULL,
          resolved_model_id TEXT,
          node_kind TEXT NOT NULL,
          operation_mode TEXT NOT NULL CHECK (operation_mode IN ('generate','edit','mask-edit')),
          task_family_id TEXT NOT NULL,
          prompt_variant_id TEXT NOT NULL,
          prompt_version TEXT NOT NULL,
          prompt_sha256 TEXT NOT NULL CHECK (prompt_sha256 ~ '^[a-f0-9]{64}$'),
          evaluation_version TEXT NOT NULL,
          contract_hash TEXT NOT NULL CHECK (contract_hash ~ '^sha256:[a-f0-9]{64}$'),
          parameter_profile_id TEXT NOT NULL,
          parameter_profile_version TEXT NOT NULL,
          postprocess_version TEXT NOT NULL,
          input_normalization_version TEXT NOT NULL,
          golden_set_version TEXT NOT NULL,
          scoring_rubric_version TEXT NOT NULL,
          native_parameters_json TEXT NOT NULL,
          reference_inputs_json TEXT NOT NULL,
          requested_image_count INTEGER NOT NULL CHECK (requested_image_count > 0),
          request_snapshot_sha256 TEXT NOT NULL CHECK (request_snapshot_sha256 ~ '^[a-f0-9]{64}$'),
          outcome TEXT NOT NULL CHECK (outcome IN (
            'queued','running','succeeded','failed','outcome_unknown','cancelled'
          )),
          provider_request_count INTEGER NOT NULL DEFAULT 0 CHECK (provider_request_count >= 0),
          latency_ms INTEGER CHECK (latency_ms IS NULL OR latency_ms >= 0),
          error_category TEXT,
          error_message TEXT,
          billing_reconciliation_status TEXT NOT NULL DEFAULT 'not-required' CHECK (
            billing_reconciliation_status IN (
              'not-required','pending','confirmed-not-billed','confirmed-billed'
            )
          ),
          billing_reconciled_by TEXT,
          billing_reconciliation_note TEXT,
          billing_reconciled_at TEXT,
          manual_scores_json TEXT,
          baseline_scores_json TEXT,
          task_passed BOOLEAN,
          valid_for_scoring BOOLEAN,
          reviewer_id TEXT,
          review_note TEXT,
          reviewed_at TEXT,
          started_at BIGINT NOT NULL,
          finished_at BIGINT,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL,
          UNIQUE (owner_id, case_id),
          CONSTRAINT evaluation_case_billing_review_check CHECK (
            billing_reconciliation_status NOT IN ('confirmed-not-billed','confirmed-billed')
            OR (billing_reconciled_by IS NOT NULL AND billing_reconciled_at IS NOT NULL)
          ),
          CONSTRAINT evaluation_case_manual_review_check CHECK (
            (manual_scores_json IS NULL AND reviewer_id IS NULL AND reviewed_at IS NULL)
            OR
            (manual_scores_json IS NOT NULL AND reviewer_id IS NOT NULL
              AND reviewed_at IS NOT NULL AND task_passed IS NOT NULL)
          )
        );
        CREATE INDEX IF NOT EXISTS evaluation_case_evidence_model_idx
          ON evaluation_case_evidence(model_id, prompt_variant_id, outcome);
        CREATE INDEX IF NOT EXISTS evaluation_case_evidence_billing_idx
          ON evaluation_case_evidence(billing_reconciliation_status, updated_at);

        CREATE TABLE IF NOT EXISTS evaluation_provider_request_evidence (
          id TEXT PRIMARY KEY,
          case_evidence_id TEXT NOT NULL REFERENCES evaluation_case_evidence(id) ON DELETE CASCADE,
          run_id TEXT NOT NULL REFERENCES generation_runs(id) ON DELETE CASCADE,
          request_index INTEGER NOT NULL CHECK (request_index > 0),
          request_snapshot_sha256 TEXT NOT NULL CHECK (request_snapshot_sha256 ~ '^[a-f0-9]{64}$'),
          prompt_sha256 TEXT NOT NULL CHECK (prompt_sha256 ~ '^[a-f0-9]{64}$'),
          native_parameters_json TEXT NOT NULL,
          business_parameters_json TEXT NOT NULL,
          reference_inputs_json TEXT NOT NULL,
          outcome TEXT NOT NULL CHECK (outcome IN ('started','succeeded','failed','outcome_unknown')),
          provider_model TEXT,
          provider_output_sizes_json TEXT NOT NULL DEFAULT '[]',
          output_count INTEGER NOT NULL DEFAULT 0 CHECK (output_count >= 0),
          error_category TEXT,
          error_message TEXT,
          started_at BIGINT NOT NULL,
          finished_at BIGINT,
          latency_ms INTEGER CHECK (latency_ms IS NULL OR latency_ms >= 0),
          UNIQUE (case_evidence_id, request_index)
        );
        CREATE INDEX IF NOT EXISTS evaluation_provider_request_run_idx
          ON evaluation_provider_request_evidence(run_id, request_index);

        CREATE TABLE IF NOT EXISTS evaluation_image_evidence (
          id TEXT PRIMARY KEY,
          case_evidence_id TEXT NOT NULL REFERENCES evaluation_case_evidence(id) ON DELETE CASCADE,
          run_id TEXT NOT NULL REFERENCES generation_runs(id) ON DELETE CASCADE,
          output_index INTEGER NOT NULL CHECK (output_index >= 0),
          layer TEXT NOT NULL CHECK (layer IN ('provider-original','postprocessed')),
          source_evidence_id TEXT REFERENCES evaluation_image_evidence(id) ON DELETE RESTRICT,
          storage_ref TEXT NOT NULL,
          artifact_sha256 TEXT NOT NULL CHECK (artifact_sha256 ~ '^[a-f0-9]{64}$'),
          mime_type TEXT NOT NULL CHECK (mime_type IN ('image/png','image/jpeg','image/webp')),
          width INTEGER NOT NULL CHECK (width > 0),
          height INTEGER NOT NULL CHECK (height > 0),
          byte_length INTEGER NOT NULL CHECK (byte_length > 0),
          pipeline_version TEXT,
          captured_at BIGINT NOT NULL,
          UNIQUE (case_evidence_id, layer, output_index),
          CONSTRAINT evaluation_image_layer_link_check CHECK (
            (layer = 'provider-original' AND source_evidence_id IS NULL AND pipeline_version IS NULL)
            OR
            (layer = 'postprocessed' AND source_evidence_id IS NOT NULL AND pipeline_version IS NOT NULL)
          )
        );
        CREATE INDEX IF NOT EXISTS evaluation_image_evidence_source_idx
          ON evaluation_image_evidence(source_evidence_id);
      `);
      await client.query(
        "INSERT INTO schema_migrations (version, name, applied_at) VALUES (16, $1, $2)",
        ["evaluation_case_evidence_ledger", new Date().toISOString()],
      );
    }

    // Harden the paid-evaluation budget and evidence ledgers before any real
    // Provider call is permitted. Earlier local prototypes never had a
    // reviewed per-request price, so migrating a populated authorization
    // ledger would manufacture financial meaning. Fail closed and require a
    // manual review instead of guessing a price for an existing grant.
    if (!applied.has(17)) {
      await client.query(`
        DO $$
        BEGIN
          IF EXISTS (SELECT 1 FROM evaluation_run_authorizations)
            OR EXISTS (SELECT 1 FROM evaluation_case_evidence)
            OR EXISTS (SELECT 1 FROM evaluation_provider_request_evidence)
            OR EXISTS (SELECT 1 FROM evaluation_image_evidence) THEN
            RAISE EXCEPTION
              'migration 17 requires empty evaluation ledgers; review legacy grants and evidence first';
          END IF;
        END
        $$;

        ALTER TABLE evaluation_run_authorizations
          ADD COLUMN price_minor_per_provider_request BIGINT NOT NULL
            CHECK (price_minor_per_provider_request > 0),
          ADD COLUMN used_budget_minor BIGINT NOT NULL DEFAULT 0;

        ALTER TABLE evaluation_run_authorizations
          DROP CONSTRAINT evaluation_authorization_usage_check,
          DROP CONSTRAINT evaluation_authorization_state_check;
        ALTER TABLE evaluation_run_authorizations
          ADD CONSTRAINT evaluation_authorization_usage_check CHECK (
            reserved_provider_requests >= 0
            AND reserved_provider_requests <= max_provider_requests
            AND used_provider_requests >= 0
            AND used_provider_requests <= reserved_provider_requests
            AND reserved_budget_minor >= 0
            AND reserved_budget_minor <= budget_limit_minor
            AND used_budget_minor >= 0
            AND used_budget_minor <= reserved_budget_minor
            AND used_budget_minor = used_provider_requests * price_minor_per_provider_request
          ),
          ADD CONSTRAINT evaluation_authorization_state_check CHECK (
            (
              status = 'consumed'
              AND bound_case_id IS NOT NULL
              AND bound_run_id IS NOT NULL
              AND reserved_provider_requests > 0
              AND reserved_budget_minor = reserved_provider_requests * price_minor_per_provider_request
              AND consumed_at IS NOT NULL
            ) OR (
              status <> 'consumed'
              AND bound_case_id IS NULL
              AND bound_run_id IS NULL
              AND reserved_provider_requests = 0
              AND used_provider_requests = 0
              AND reserved_budget_minor = 0
              AND used_budget_minor = 0
              AND consumed_at IS NULL
            )
          );

        ALTER TABLE evaluation_case_evidence
          ADD COLUMN preset_id TEXT NOT NULL,
          ADD COLUMN evaluation_unit_key TEXT NOT NULL
            CHECK (evaluation_unit_key ~ '^sha256:[a-f0-9]{64}$'),
          ADD COLUMN resolved_prompt TEXT NOT NULL,
          ADD COLUMN snapshot_json TEXT NOT NULL,
          ADD COLUMN error_events_json TEXT NOT NULL DEFAULT '[]',
          ADD COLUMN billing_reference TEXT,
          ADD COLUMN hard_blockers_json TEXT NOT NULL DEFAULT '[]',
          ADD COLUMN evidence_record_sha256 TEXT
            CHECK (evidence_record_sha256 IS NULL OR evidence_record_sha256 ~ '^[a-f0-9]{64}$'),
          ADD COLUMN finalized_at BIGINT;
        ALTER TABLE evaluation_case_evidence
          ADD CONSTRAINT evaluation_case_requested_count_check
            CHECK (requested_image_count BETWEEN 1 AND 8),
          ADD CONSTRAINT evaluation_case_authorization_fk
            FOREIGN KEY (authorization_id)
            REFERENCES evaluation_run_authorizations(authorization_id) ON DELETE RESTRICT,
          ADD CONSTRAINT evaluation_case_id_run_unique UNIQUE (id, run_id);

        ALTER TABLE evaluation_provider_request_evidence
          ADD COLUMN reserved_cost_minor BIGINT NOT NULL CHECK (reserved_cost_minor > 0),
          ADD COLUMN budget_currency TEXT NOT NULL CHECK (budget_currency ~ '^[A-Z]{3}$'),
          ADD COLUMN actual_cost_minor BIGINT CHECK (actual_cost_minor IS NULL OR actual_cost_minor >= 0),
          ADD COLUMN billing_reconciliation_status TEXT NOT NULL DEFAULT 'pending' CHECK (
            billing_reconciliation_status IN (
              'pending','confirmed-not-billed','confirmed-billed'
            )
          ),
          ADD COLUMN billing_reference TEXT;
        ALTER TABLE evaluation_provider_request_evidence
          DROP CONSTRAINT evaluation_provider_request_evidence_case_evidence_id_fkey,
          DROP CONSTRAINT evaluation_provider_request_evidence_run_id_fkey;
        ALTER TABLE evaluation_provider_request_evidence
          ADD CONSTRAINT evaluation_provider_request_case_run_fk
            FOREIGN KEY (case_evidence_id, run_id)
            REFERENCES evaluation_case_evidence(id, run_id) ON DELETE RESTRICT,
          ADD CONSTRAINT evaluation_provider_request_id_case_run_unique
            UNIQUE (id, case_evidence_id, run_id);

        ALTER TABLE evaluation_image_evidence
          ADD COLUMN provider_request_evidence_id TEXT;
        ALTER TABLE evaluation_image_evidence
          DROP CONSTRAINT evaluation_image_evidence_case_evidence_id_fkey,
          DROP CONSTRAINT evaluation_image_evidence_run_id_fkey,
          DROP CONSTRAINT evaluation_image_layer_link_check;
        ALTER TABLE evaluation_image_evidence
          ADD CONSTRAINT evaluation_image_case_run_fk
            FOREIGN KEY (case_evidence_id, run_id)
            REFERENCES evaluation_case_evidence(id, run_id) ON DELETE RESTRICT,
          ADD CONSTRAINT evaluation_image_provider_request_fk
            FOREIGN KEY (provider_request_evidence_id, case_evidence_id, run_id)
            REFERENCES evaluation_provider_request_evidence(id, case_evidence_id, run_id) ON DELETE RESTRICT,
          ADD CONSTRAINT evaluation_image_layer_link_check CHECK (
            (
              layer = 'provider-original'
              AND source_evidence_id IS NULL
              AND pipeline_version IS NULL
              AND provider_request_evidence_id IS NOT NULL
            ) OR (
              layer = 'postprocessed'
              AND source_evidence_id IS NOT NULL
              AND pipeline_version IS NOT NULL
              AND provider_request_evidence_id IS NULL
            )
          );

        CREATE OR REPLACE FUNCTION enforce_evaluation_case_authorization_binding()
        RETURNS trigger LANGUAGE plpgsql AS $$
        BEGIN
          PERFORM 1 FROM evaluation_run_authorizations grant_row
          WHERE grant_row.authorization_id = NEW.authorization_id
            AND grant_row.owner_id = NEW.owner_id
            AND grant_row.status = 'consumed'
            AND grant_row.bound_case_id = NEW.case_id
            AND grant_row.bound_run_id = NEW.run_id;
          IF NOT FOUND THEN
            RAISE EXCEPTION 'evaluation evidence is not bound to its consumed authorization';
          END IF;
          RETURN NEW;
        END
        $$;
        CREATE TRIGGER evaluation_case_authorization_binding_trigger
          BEFORE INSERT ON evaluation_case_evidence
          FOR EACH ROW EXECUTE FUNCTION enforce_evaluation_case_authorization_binding();

        CREATE OR REPLACE FUNCTION enforce_evaluation_image_source_binding()
        RETURNS trigger LANGUAGE plpgsql AS $$
        BEGIN
          IF NEW.layer = 'postprocessed' THEN
            PERFORM 1 FROM evaluation_image_evidence source
            WHERE source.id = NEW.source_evidence_id
              AND source.case_evidence_id = NEW.case_evidence_id
              AND source.run_id = NEW.run_id
              AND source.output_index = NEW.output_index
              AND source.layer = 'provider-original';
            IF NOT FOUND THEN
              RAISE EXCEPTION 'postprocessed evidence source must be the same case/run/output provider original';
            END IF;
          END IF;
          RETURN NEW;
        END
        $$;
        CREATE TRIGGER evaluation_image_source_binding_trigger
          BEFORE INSERT OR UPDATE ON evaluation_image_evidence
          FOR EACH ROW EXECUTE FUNCTION enforce_evaluation_image_source_binding();

        CREATE TABLE evaluation_billing_reconciliation_events (
          id TEXT PRIMARY KEY,
          case_evidence_id TEXT NOT NULL REFERENCES evaluation_case_evidence(id) ON DELETE RESTRICT,
          provider_request_evidence_id TEXT REFERENCES evaluation_provider_request_evidence(id) ON DELETE RESTRICT,
          status TEXT NOT NULL CHECK (status IN ('confirmed-not-billed','confirmed-billed')),
          actual_cost_minor BIGINT CHECK (actual_cost_minor IS NULL OR actual_cost_minor >= 0),
          currency TEXT NOT NULL CHECK (currency ~ '^[A-Z]{3}$'),
          billing_reference TEXT NOT NULL,
          note TEXT,
          reconciled_by TEXT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
          previous_event_sha256 TEXT CHECK (
            previous_event_sha256 IS NULL OR previous_event_sha256 ~ '^[a-f0-9]{64}$'
          ),
          event_sha256 TEXT NOT NULL UNIQUE CHECK (event_sha256 ~ '^[a-f0-9]{64}$'),
          created_at TEXT NOT NULL
        );
        CREATE INDEX evaluation_billing_events_case_idx
          ON evaluation_billing_reconciliation_events(case_evidence_id, created_at);

        CREATE TABLE evaluation_manual_assessment_events (
          id TEXT PRIMARY KEY,
          case_evidence_id TEXT NOT NULL REFERENCES evaluation_case_evidence(id) ON DELETE RESTRICT,
          output_index INTEGER NOT NULL CHECK (output_index >= 0),
          scores_json TEXT NOT NULL,
          baseline_scores_json TEXT,
          task_passed BOOLEAN NOT NULL,
          valid_for_scoring BOOLEAN NOT NULL,
          hard_blockers_json TEXT NOT NULL DEFAULT '[]',
          review_note TEXT,
          reviewer_id TEXT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
          previous_event_sha256 TEXT CHECK (
            previous_event_sha256 IS NULL OR previous_event_sha256 ~ '^[a-f0-9]{64}$'
          ),
          event_sha256 TEXT NOT NULL UNIQUE CHECK (event_sha256 ~ '^[a-f0-9]{64}$'),
          created_at TEXT NOT NULL
        );
        CREATE INDEX evaluation_manual_events_case_idx
          ON evaluation_manual_assessment_events(case_evidence_id, output_index, created_at);

        CREATE OR REPLACE FUNCTION reject_evaluation_evidence_event_mutation()
        RETURNS trigger LANGUAGE plpgsql AS $$
        BEGIN
          RAISE EXCEPTION 'evaluation evidence events are append-only';
        END
        $$;
        CREATE TRIGGER evaluation_billing_events_immutable_trigger
          BEFORE UPDATE OR DELETE ON evaluation_billing_reconciliation_events
          FOR EACH ROW EXECUTE FUNCTION reject_evaluation_evidence_event_mutation();
        CREATE TRIGGER evaluation_manual_events_immutable_trigger
          BEFORE UPDATE OR DELETE ON evaluation_manual_assessment_events
          FOR EACH ROW EXECUTE FUNCTION reject_evaluation_evidence_event_mutation();
      `);
      await client.query(
        "INSERT INTO schema_migrations (version, name, applied_at) VALUES (17, $1, $2)",
        ["evaluation_budget_and_evidence_integrity", new Date().toISOString()],
      );
    }

    // Runtime environment variables no longer constitute code identity. A
    // Git-backed process records the observed HEAD, while a packaged process
    // must match the immutable build identity baked into the image. Never
    // relabel legacy deployment-env evidence: it needs explicit review.
    if (!applied.has(18)) {
      await client.query(`
        DO $$
        BEGIN
          IF EXISTS (
            SELECT 1 FROM evaluation_case_evidence
            WHERE code_sha_source = 'deployment-env'
          ) THEN
            RAISE EXCEPTION
              'migration 18 requires review of legacy deployment-env evaluation evidence';
          END IF;
        END
        $$;

        ALTER TABLE evaluation_case_evidence
          DROP CONSTRAINT IF EXISTS evaluation_case_evidence_code_sha_source_check;
        ALTER TABLE evaluation_case_evidence
          ADD CONSTRAINT evaluation_case_evidence_code_sha_source_check
          CHECK (code_sha_source IN ('git-head','build-identity'));
      `);
      await client.query(
        "INSERT INTO schema_migrations (version, name, applied_at) VALUES (18, $1, $2)",
        ["evaluation_code_identity_binding", new Date().toISOString()],
      );
    }

    // A paid evaluation is a finite campaign, never an operator-selected set
    // of cases. Existing ledgers cannot be safely inferred into exact sealed
    // slots, so refuse the migration if any historical evidence exists.
    if (!applied.has(19)) {
      await client.query(`
        DO $$
        BEGIN
          IF EXISTS (SELECT 1 FROM evaluation_run_authorizations)
            OR EXISTS (SELECT 1 FROM evaluation_case_evidence)
            OR EXISTS (SELECT 1 FROM evaluation_provider_request_evidence)
            OR EXISTS (SELECT 1 FROM evaluation_image_evidence)
            OR EXISTS (SELECT 1 FROM evaluation_billing_reconciliation_events)
            OR EXISTS (SELECT 1 FROM evaluation_manual_assessment_events) THEN
            RAISE EXCEPTION
              'migration 19 requires empty evaluation ledgers; legacy paid evidence must be reviewed before campaign sealing';
          END IF;
        END
        $$;

        CREATE TABLE evaluation_campaigns (
          campaign_id TEXT PRIMARY KEY
            CHECK (campaign_id ~ '^[A-Za-z0-9_-]{1,128}$'),
          owner_id TEXT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
          created_by_admin_id TEXT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
          stage TEXT NOT NULL CHECK (stage IN (
            'provider-probe','internal-experiment','formal-validation'
          )),
          model_id TEXT NOT NULL,
          evaluation_unit_key TEXT NOT NULL
            CHECK (evaluation_unit_key ~ '^sha256:[a-f0-9]{64}$'),
          code_sha TEXT NOT NULL
            CHECK (code_sha ~ '^([a-f0-9]{40}|[a-f0-9]{64})$'),
          max_provider_requests INTEGER NOT NULL CHECK (
            max_provider_requests >= 1 AND max_provider_requests <= 4096
          ),
          budget_limit_minor BIGINT NOT NULL CHECK (budget_limit_minor > 0),
          budget_currency TEXT NOT NULL CHECK (budget_currency ~ '^[A-Z]{3}$'),
          reserved_provider_requests INTEGER NOT NULL DEFAULT 0 CHECK (
            reserved_provider_requests >= 0
          ),
          reserved_budget_minor BIGINT NOT NULL DEFAULT 0 CHECK (
            reserved_budget_minor >= 0
          ),
          status TEXT NOT NULL DEFAULT 'ready'
            CHECK (status IN ('ready','stopped','closed')),
          manifest_sha256 TEXT NOT NULL UNIQUE CHECK (manifest_sha256 ~ '^[a-f0-9]{64}$'),
          closure_sha256 TEXT UNIQUE CHECK (
            closure_sha256 IS NULL OR closure_sha256 ~ '^[a-f0-9]{64}$'
          ),
          created_at BIGINT NOT NULL,
          closed_at BIGINT,
          CONSTRAINT evaluation_campaign_reservation_check CHECK (
            reserved_provider_requests <= max_provider_requests
            AND reserved_budget_minor <= budget_limit_minor
          ),
          CONSTRAINT evaluation_campaign_closure_state_check CHECK (
            (status = 'closed' AND closure_sha256 IS NOT NULL AND closed_at IS NOT NULL)
            OR (status IN ('ready','stopped') AND closure_sha256 IS NULL AND closed_at IS NULL)
          )
        );

        CREATE TABLE evaluation_campaign_slots (
          slot_id TEXT PRIMARY KEY
            CHECK (slot_id ~ '^[A-Za-z0-9_-]{1,128}$'),
          campaign_id TEXT NOT NULL REFERENCES evaluation_campaigns(campaign_id) ON DELETE RESTRICT,
          case_id TEXT NOT NULL CHECK (case_id ~ '^[A-Za-z0-9_-]{1,128}$'),
          sample_id TEXT NOT NULL CHECK (sample_id ~ '^[A-Za-z0-9_.:-]{1,128}$'),
          resolved_prompt_sha256 TEXT NOT NULL CHECK (resolved_prompt_sha256 ~ '^[a-f0-9]{64}$'),
          native_parameters_sha256 TEXT NOT NULL CHECK (native_parameters_sha256 ~ '^[a-f0-9]{64}$'),
          reference_inputs_sha256 TEXT NOT NULL CHECK (reference_inputs_sha256 ~ '^[a-f0-9]{64}$'),
          requested_image_count INTEGER NOT NULL CHECK (
            requested_image_count >= 1 AND requested_image_count <= 8
          ),
          max_provider_requests INTEGER NOT NULL CHECK (
            max_provider_requests >= 1 AND max_provider_requests <= 8
          ),
          price_minor_per_provider_request BIGINT NOT NULL CHECK (
            price_minor_per_provider_request > 0
          ),
          budget_limit_minor BIGINT NOT NULL CHECK (budget_limit_minor > 0),
          authorization_id TEXT,
          run_id TEXT REFERENCES generation_runs(id) ON DELETE RESTRICT,
          reserved_provider_requests INTEGER NOT NULL DEFAULT 0 CHECK (
            reserved_provider_requests >= 0
          ),
          reserved_budget_minor BIGINT NOT NULL DEFAULT 0 CHECK (
            reserved_budget_minor >= 0
          ),
          status TEXT NOT NULL DEFAULT 'ready' CHECK (status IN (
            'ready','running','succeeded','failed','outcome_unknown','cancelled'
          )),
          created_at BIGINT NOT NULL,
          CONSTRAINT evaluation_campaign_slot_case_unique UNIQUE (campaign_id, case_id),
          CONSTRAINT evaluation_campaign_slot_sample_unique UNIQUE (campaign_id, sample_id),
          CONSTRAINT evaluation_campaign_slot_pair_unique UNIQUE (campaign_id, slot_id),
          CONSTRAINT evaluation_campaign_slot_reservation_check CHECK (
            reserved_provider_requests <= max_provider_requests
            AND reserved_budget_minor <= budget_limit_minor
          ),
          CONSTRAINT evaluation_campaign_slot_binding_check CHECK (
            (authorization_id IS NULL AND run_id IS NULL AND status = 'ready')
            OR (authorization_id IS NOT NULL AND run_id IS NOT NULL)
          )
        );
        CREATE INDEX evaluation_campaign_slots_campaign_status_idx
          ON evaluation_campaign_slots(campaign_id, status, slot_id);

        ALTER TABLE evaluation_run_authorizations
          ADD COLUMN campaign_id TEXT NOT NULL,
          ADD COLUMN slot_id TEXT NOT NULL;
        ALTER TABLE evaluation_run_authorizations
          ADD CONSTRAINT evaluation_authorization_campaign_fk
            FOREIGN KEY (campaign_id) REFERENCES evaluation_campaigns(campaign_id) ON DELETE RESTRICT,
          ADD CONSTRAINT evaluation_authorization_campaign_slot_fk
            FOREIGN KEY (campaign_id, slot_id)
            REFERENCES evaluation_campaign_slots(campaign_id, slot_id) ON DELETE RESTRICT,
          ADD CONSTRAINT evaluation_authorization_campaign_slot_unique
            UNIQUE (campaign_id, slot_id);

        ALTER TABLE generation_runs
          ADD COLUMN evaluation_campaign_id TEXT,
          ADD COLUMN evaluation_slot_id TEXT;
        ALTER TABLE generation_runs DROP CONSTRAINT IF EXISTS generation_runs_evaluation_policy_check;
        ALTER TABLE generation_runs ADD CONSTRAINT generation_runs_evaluation_policy_check CHECK (
          (
            run_type = 'evaluation'
            AND retry_policy = 'no-retry'
            AND evaluation_case_id IS NOT NULL
            AND evaluation_authorization_id IS NOT NULL
            AND evaluation_campaign_id IS NOT NULL
            AND evaluation_slot_id IS NOT NULL
          ) OR (
            run_type <> 'evaluation'
            AND retry_policy = 'standard'
            AND evaluation_case_id IS NULL
            AND evaluation_authorization_id IS NULL
            AND evaluation_campaign_id IS NULL
            AND evaluation_slot_id IS NULL
          )
        );
        ALTER TABLE generation_runs
          ADD CONSTRAINT generation_runs_evaluation_campaign_fk
            FOREIGN KEY (evaluation_campaign_id)
            REFERENCES evaluation_campaigns(campaign_id) ON DELETE RESTRICT,
          ADD CONSTRAINT generation_runs_evaluation_campaign_slot_fk
            FOREIGN KEY (evaluation_campaign_id, evaluation_slot_id)
            REFERENCES evaluation_campaign_slots(campaign_id, slot_id) ON DELETE RESTRICT;
        CREATE UNIQUE INDEX generation_runs_evaluation_campaign_slot_unique
          ON generation_runs(evaluation_campaign_id, evaluation_slot_id)
          WHERE evaluation_campaign_id IS NOT NULL;

        ALTER TABLE evaluation_case_evidence
          ADD COLUMN campaign_id TEXT NOT NULL,
          ADD COLUMN slot_id TEXT NOT NULL;
        ALTER TABLE evaluation_case_evidence
          ADD CONSTRAINT evaluation_case_campaign_fk
            FOREIGN KEY (campaign_id) REFERENCES evaluation_campaigns(campaign_id) ON DELETE RESTRICT,
          ADD CONSTRAINT evaluation_case_campaign_slot_fk
            FOREIGN KEY (campaign_id, slot_id)
            REFERENCES evaluation_campaign_slots(campaign_id, slot_id) ON DELETE RESTRICT,
          ADD CONSTRAINT evaluation_case_campaign_slot_run_unique
            UNIQUE (campaign_id, slot_id, run_id);

        CREATE OR REPLACE FUNCTION enforce_evaluation_case_authorization_binding()
        RETURNS trigger LANGUAGE plpgsql AS $$
        BEGIN
          PERFORM 1
          FROM evaluation_run_authorizations grant_row
          JOIN evaluation_campaign_slots slot
            ON slot.campaign_id = grant_row.campaign_id
            AND slot.slot_id = grant_row.slot_id
          WHERE grant_row.authorization_id = NEW.authorization_id
            AND grant_row.owner_id = NEW.owner_id
            AND grant_row.status = 'consumed'
            AND grant_row.bound_case_id = NEW.case_id
            AND grant_row.bound_run_id = NEW.run_id
            AND grant_row.campaign_id = NEW.campaign_id
            AND grant_row.slot_id = NEW.slot_id
            AND slot.authorization_id = NEW.authorization_id
            AND slot.run_id = NEW.run_id
            AND slot.case_id = NEW.case_id
            AND slot.sample_id = NEW.sample_id;
          IF NOT FOUND THEN
            RAISE EXCEPTION 'evaluation evidence is not bound to its consumed authorization and sealed campaign slot';
          END IF;
          RETURN NEW;
        END
        $$;

        CREATE OR REPLACE FUNCTION reject_evaluation_campaign_mutation()
        RETURNS trigger LANGUAGE plpgsql AS $$
        BEGIN
          IF (to_jsonb(NEW) - ARRAY[
            'status','reserved_provider_requests','reserved_budget_minor','closure_sha256','closed_at'
          ]) IS DISTINCT FROM (to_jsonb(OLD) - ARRAY[
            'status','reserved_provider_requests','reserved_budget_minor','closure_sha256','closed_at'
          ]) THEN
            RAISE EXCEPTION 'evaluation campaign manifest is immutable';
          END IF;
          IF OLD.status = 'closed' THEN
            RAISE EXCEPTION 'closed evaluation campaign is immutable';
          END IF;
          IF OLD.status = 'stopped' AND NEW.status <> 'stopped' THEN
            RAISE EXCEPTION 'stopped evaluation campaign cannot be reopened';
          END IF;
          IF NEW.reserved_provider_requests < OLD.reserved_provider_requests
            OR NEW.reserved_budget_minor < OLD.reserved_budget_minor THEN
            RAISE EXCEPTION 'evaluation campaign reservations are append-only';
          END IF;
          RETURN NEW;
        END
        $$;
        CREATE OR REPLACE FUNCTION reject_evaluation_campaign_slot_mutation()
        RETURNS trigger LANGUAGE plpgsql AS $$
        BEGIN
          IF (to_jsonb(NEW) - ARRAY[
            'authorization_id','run_id','reserved_provider_requests','reserved_budget_minor','status'
          ]) IS DISTINCT FROM (to_jsonb(OLD) - ARRAY[
            'authorization_id','run_id','reserved_provider_requests','reserved_budget_minor','status'
          ]) THEN
            RAISE EXCEPTION 'evaluation campaign slot manifest is immutable';
          END IF;
          IF OLD.authorization_id IS NOT NULL AND NEW.authorization_id IS DISTINCT FROM OLD.authorization_id THEN
            RAISE EXCEPTION 'evaluation campaign slot authorization binding is immutable';
          END IF;
          IF OLD.run_id IS NOT NULL AND NEW.run_id IS DISTINCT FROM OLD.run_id THEN
            RAISE EXCEPTION 'evaluation campaign slot run binding is immutable';
          END IF;
          IF OLD.status IN ('succeeded','failed','outcome_unknown','cancelled') AND NEW.status <> OLD.status THEN
            RAISE EXCEPTION 'finalized evaluation campaign slot cannot be reopened';
          END IF;
          IF NEW.reserved_provider_requests < OLD.reserved_provider_requests
            OR NEW.reserved_budget_minor < OLD.reserved_budget_minor THEN
            RAISE EXCEPTION 'evaluation campaign slot reservations are append-only';
          END IF;
          RETURN NEW;
        END
        $$;
        CREATE OR REPLACE FUNCTION reject_evaluation_campaign_delete()
        RETURNS trigger LANGUAGE plpgsql AS $$
        BEGIN
          RAISE EXCEPTION 'evaluation campaigns and slots are append-only';
        END
        $$;
        CREATE TRIGGER evaluation_campaign_immutable_trigger
          BEFORE UPDATE ON evaluation_campaigns
          FOR EACH ROW EXECUTE FUNCTION reject_evaluation_campaign_mutation();
        CREATE TRIGGER evaluation_campaign_slot_immutable_trigger
          BEFORE UPDATE ON evaluation_campaign_slots
          FOR EACH ROW EXECUTE FUNCTION reject_evaluation_campaign_slot_mutation();
        CREATE TRIGGER evaluation_campaign_delete_trigger
          BEFORE DELETE ON evaluation_campaigns
          FOR EACH ROW EXECUTE FUNCTION reject_evaluation_campaign_delete();
        CREATE TRIGGER evaluation_campaign_slot_delete_trigger
          BEFORE DELETE ON evaluation_campaign_slots
          FOR EACH ROW EXECUTE FUNCTION reject_evaluation_campaign_delete();
      `);
      await client.query(
        "INSERT INTO schema_migrations (version, name, applied_at) VALUES (19, $1, $2)",
        ["immutable_evaluation_campaign_ledger", new Date().toISOString()],
      );
    }

    // APIYI returns x-request-id for support reconciliation. Keep this optional
    // for historical/manual evidence while constraining all newly persisted IDs.
    if (!applied.has(20)) {
      await client.query(`
        ALTER TABLE evaluation_provider_request_evidence
          ADD COLUMN IF NOT EXISTS provider_request_id TEXT;
        ALTER TABLE evaluation_provider_request_evidence
          DROP CONSTRAINT IF EXISTS evaluation_provider_request_evidence_provider_request_id_check;
        ALTER TABLE evaluation_provider_request_evidence
          ADD CONSTRAINT evaluation_provider_request_evidence_provider_request_id_check
          CHECK (
            provider_request_id IS NULL
            OR provider_request_id ~ '^[A-Za-z0-9][A-Za-z0-9._:-]{0,255}$'
          );
      `);
      await client.query(
        "INSERT INTO schema_migrations (version, name, applied_at) VALUES (20, $1, $2)",
        ["provider_request_id_evidence", new Date().toISOString()],
      );
    }

    // 视频链路（P2-e）：video 节点的产物引用与 Seedance 任务 ID 审计证据。
    if (!applied.has(21)) {
      await client.query(`
        ALTER TABLE generation_run_steps
          ADD COLUMN IF NOT EXISTS output_videos_json TEXT NOT NULL DEFAULT '[]';
        ALTER TABLE generation_run_steps
          ADD COLUMN IF NOT EXISTS provider_task_id TEXT;
      `);
      await client.query(
        "INSERT INTO schema_migrations (version, name, applied_at) VALUES (21, $1, $2)",
        ["video_step_output_metadata", new Date().toISOString()],
      );
    }

    // 数字模特库（R-86）：assets.category 枚举扩容，新增 'model'。
    // 枚举扩容对既有数据无损，无需回填。
    if (!applied.has(22)) {
      await client.query(`
        ALTER TABLE assets DROP CONSTRAINT IF EXISTS assets_category_check;
        ALTER TABLE assets ADD CONSTRAINT assets_category_check
          CHECK (category IN ('print','fabric','reference','model'));
      `);
      await client.query(
        "INSERT INTO schema_migrations (version, name, applied_at) VALUES (22, $1, $2)",
        ["asset_model_category", new Date().toISOString()],
      );
    }

    return imported;
  });
  if (importedRows !== undefined) {
    console.log(
      `[garment-canvas] imported ${importedRows} rows from SQLite into PostgreSQL`,
    );
  }
}

async function bootstrapInitialAdmin(): Promise<void> {
  const row = await queryOne<{ count: number }>("SELECT COUNT(*)::int AS count FROM users");
  if ((row?.count ?? 0) > 0) return;
  const accountId = config.initialAdminAccountId();
  const password = config.initialAdminPassword();
  if (!accountId || !password) return;
  const passwordError = validatePassword(password);
  if (passwordError) throw new Error(`INITIAL_ADMIN_PASSWORD 不符合要求：${passwordError}`);
  const now = new Date().toISOString();
  await db().query(`
    INSERT INTO users (id, account_id, display_name, role, password_hash, must_change_password, active, created_at, updated_at)
    VALUES ($1, $2, $3, 'admin', $4, 1, 1, $5, $5)
    ON CONFLICT (account_id) WHERE deleted_at IS NULL DO NOTHING
  `, [nanoid(12), accountId, "管理员", hashPassword(password), now]);
}

export async function hasUsers(): Promise<boolean> {
  const row = await queryOne<{ ok: boolean }>("SELECT EXISTS(SELECT 1 FROM users) AS ok");
  return row?.ok === true;
}

export async function databaseReady(): Promise<boolean> {
  try {
    await assertDatabaseVersion();
    return true;
  } catch {
    return false;
  }
}
