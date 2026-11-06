#!/usr/bin/env bash
# 重置管理员密码（交互式，密码不出现在命令行历史里）。
# 用法：./scripts/local/reset-admin-password.sh [账号，默认 admin]
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
NODE="/Users/kittin/.nvm/versions/node/v24.20.0/bin/node"
PSQL="/Library/PostgreSQL/18/bin/psql"
ACCOUNT="${1:-admin}"

PGBIN_DIR="$(dirname "$PSQL")"
export PATH="$PGBIN_DIR:$PATH"
export PGPASSWORD="$(sed -n 's/^POSTGRES_PASSWORD=//p' "$ROOT/.env")"
PGHOST_="$(sed -n 's/^PGHOST=//p' "$ROOT/.env")"
PGPORT_="$(sed -n 's/^PGPORT=//p' "$ROOT/.env")"
PGDB="$(sed -n 's/^PGDATABASE=//p' "$ROOT/.env")"
PGUSER_="$(sed -n 's/^PGUSER=//p' "$ROOT/.env")"

# 数据库未就绪时先拉起
if ! "$PGBIN_DIR/pg_isready" -h "${PGHOST_:-127.0.0.1}" -p "${PGPORT_:-5433}" >/dev/null 2>&1; then
  echo "数据库未运行，请先执行 ./scripts/local/start.sh" >&2
  exit 1
fi

if ! "$PSQL" -h "${PGHOST_:-127.0.0.1}" -p "${PGPORT_:-5433}" -U "${PGUSER_:-garment_canvas}" -d "${PGDB:-garment_canvas}" \
     -tAc "select 1 from users where account_id = '$ACCOUNT' and deleted_at is null" | grep -q 1; then
  echo "账号不存在：$ACCOUNT" >&2
  exit 1
fi

echo "正在重置账号：$ACCOUNT"
# -s 静默输入，不回显；密码不进入命令行参数与 shell 历史
read -r -s -p "新密码（至少 10 位，需含字母和数字）：" PW1; echo
read -r -s -p "再输入一次确认：" PW2; echo

if [ "$PW1" != "$PW2" ]; then
  echo "两次输入不一致，已取消" >&2
  exit 1
fi
if [ "${#PW1}" -lt 10 ]; then
  echo "密码至少需要 10 位" >&2
  exit 1
fi
if [ "${#PW1}" -gt 200 ]; then
  echo "密码不能超过 200 位" >&2
  exit 1
fi
if ! printf '%s' "$PW1" | grep -qE '[A-Za-z]' || ! printf '%s' "$PW1" | grep -qE '[0-9]'; then
  echo "密码必须同时包含字母和数字" >&2
  exit 1
fi

# 用与 server/lib/password.ts 完全一致的 scrypt 格式生成哈希，密码经 stdin 传入不留痕
HASH="$(printf '%s' "$PW1" | "$NODE" -e '
const { randomBytes, scryptSync } = require("node:crypto");
let pw = "";
process.stdin.on("data", (d) => { pw += d; });
process.stdin.on("end", () => {
  const salt = randomBytes(16);
  const hash = scryptSync(pw, salt, 64);
  process.stdout.write(`scrypt$${salt.toString("base64url")}$${hash.toString("base64url")}`);
});
')"

NOW="$(date -u +"%Y-%m-%dT%H:%M:%S.000Z")"

"$PSQL" -h "${PGHOST_:-127.0.0.1}" -p "${PGPORT_:-5433}" -U "${PGUSER_:-garment_canvas}" -d "${PGDB:-garment_canvas}" \
  -v hash="$HASH" -v acct="$ACCOUNT" -v now="$NOW" >/dev/null <<'SQL'
UPDATE users
   SET password_hash = :'hash',
       must_change_password = 0,
       updated_at = :'now'
 WHERE account_id = :'acct' AND deleted_at IS NULL;

-- 密码变更后强制旧会话失效（sessions 表每个用户仅一行）
DELETE FROM sessions
 WHERE user_id IN (SELECT id FROM users WHERE account_id = :'acct');
SQL

echo "✅ 已重置。请用新密码登录：http://192.168.2.8:3002"
echo "   注意：该账号的旧登录会话已被强制下线。"
