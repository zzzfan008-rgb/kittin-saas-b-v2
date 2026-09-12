import assert from "node:assert/strict";
import {
  REFERENCE_ROLE_CATALOG,
  getReferenceRoleDefinition,
} from "../src/lib/referenceRoles";
import { REFERENCE_ROLE_VALUES } from "../src/types/workflow";

assert.deepEqual(
  REFERENCE_ROLE_CATALOG.map((definition) => definition.id),
  [...REFERENCE_ROLE_VALUES],
  "catalog order must remain the stable workflow role order",
);
assert.equal(new Set(REFERENCE_ROLE_CATALOG.map((definition) => definition.id)).size, 10);

for (const role of REFERENCE_ROLE_VALUES) {
  const definition = getReferenceRoleDefinition(role);
  assert.equal(definition.id, role);
  assert.ok(definition.label.trim());
  assert.ok(definition.responsibility.trim());
  assert.ok(definition.forbiddenInfluence.trim());
}

const styling = getReferenceRoleDefinition("styling_only");
assert.match(styling.responsibility, /叠穿|塞衣|卷边|腰线/);
assert.match(styling.forbiddenInfluence, /人物身份|面部/);

const generic = getReferenceRoleDefinition("generic");
assert.equal(generic.specificity, "supplemental");
assert.match(generic.responsibility, /具体角色优先/);
assert.match(generic.forbiddenInfluence, /覆盖|改写|混合/);

console.log("角色目录契约测试通过");
