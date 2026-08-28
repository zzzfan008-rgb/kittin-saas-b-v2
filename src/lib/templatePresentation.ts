/**
 * Static preview covers for built-in workflows that do not yet have a stored
 * /api/files thumbnail. Keeping this map in code lets every template gallery
 * use the same visual fallback without changing the template API contract.
 */
export const BUILTIN_TEMPLATE_COVERS: Record<string, string> = {
  "builtin-pattern-style-transfer": "/assets/project-center/templates/pattern-style-transfer.png",
  "builtin-person-scene-transfer": "/assets/project-center/templates/person-scene-transfer.png",
};
