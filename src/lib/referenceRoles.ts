import {
  REFERENCE_ROLE_VALUES,
  type ReferenceRole,
} from "../types/workflow";

export type ReferenceRoleSpecificity = "specific" | "supplemental";

export interface ReferenceRoleDefinition {
  id: ReferenceRole;
  label: string;
  responsibility: string;
  forbiddenInfluence: string;
  specificity: ReferenceRoleSpecificity;
}

type ReferenceRoleDefinitionMap = {
  [Role in ReferenceRole]: Omit<ReferenceRoleDefinition, "id"> & { id: Role };
};

/**
 * Runtime semantics for every stable ReferenceRole ID. The IDs and their order
 * remain owned by workflow.ts; this catalog is the single descriptive source
 * used by Provider prompt rendering and evaluation release hashing.
 */
const REFERENCE_ROLE_DEFINITIONS = {
  identity: {
    id: "identity",
    label: "人物身份与面部",
    responsibility: "仅提供同一人物的面部特征、肤色、发型和可识别身份",
    forbiddenInfluence: "不得提供服装款式、穿搭方式、姿势、构图或背景",
    specificity: "specific",
  },
  pose_composition: {
    id: "pose_composition",
    label: "姿势与构图",
    responsibility: "仅提供身体姿势、肢体朝向、镜头角度、取景和主体位置",
    forbiddenInfluence: "不得借用人物身份、面部、服装款式、图案、颜色或材质",
    specificity: "specific",
  },
  garment_top: {
    id: "garment_top",
    label: "上装",
    responsibility: "仅提供上装本体的版型、裁片与构造、颜色、图案、工艺、材质和未受造型方式影响的自然物理垂坠",
    forbiddenInfluence: "不得改变人物身份、面部、姿势、下装、配饰或背景；不得提供叠穿、塞衣、卷边、开合、腰线或单品之间的穿搭关系",
    specificity: "specific",
  },
  garment_bottom: {
    id: "garment_bottom",
    label: "下装",
    responsibility: "仅提供下装本体的版型、裁片与构造、颜色、图案、工艺、材质和未受造型方式影响的自然物理垂坠",
    forbiddenInfluence: "不得改变人物身份、面部、姿势、上装、配饰或背景；不得提供叠穿、塞衣、卷边、开合、腰线或单品之间的穿搭关系",
    specificity: "specific",
  },
  garment_full: {
    id: "garment_full",
    label: "整套服装",
    responsibility: "仅提供整套中各服装单品本体的版型、结构、颜色、图案、工艺、材质和未受造型方式影响的自然物理垂坠",
    forbiddenInfluence: "不得借用人物身份、面部、发型、姿势、构图、配饰或背景；不得提供叠穿、塞衣、卷边、开合、腰线或单品之间的穿搭关系",
    specificity: "specific",
  },
  fabric: {
    id: "fabric",
    label: "面料与材质",
    responsibility: "仅提供指定面料的颜色、纹理、光泽、厚薄、透明度和垂坠质感",
    forbiddenInfluence: "不得把面料图轮廓当作服装版型，也不得改变人物、姿势、配饰或背景",
    specificity: "specific",
  },
  accessory: {
    id: "accessory",
    label: "配饰",
    responsibility: "仅提供指定配饰的类别、形状、材质、颜色、尺寸和佩戴位置",
    forbiddenInfluence: "不得把配饰变成服装主体，也不得改变人物身份、面部、服装版型或背景",
    specificity: "specific",
  },
  styling_only: {
    id: "styling_only",
    label: "穿搭方式",
    responsibility: "仅提供叠穿、塞衣、卷边、开合、腰线和单品之间的穿搭关系",
    forbiddenInfluence: "不得借用人物身份、面部、发型、肤色、身材、姿势、构图或背景；不得新增、删除或改写服装本体的版型、结构、颜色、图案、工艺、材质或配饰",
    specificity: "specific",
  },
  background: {
    id: "background",
    label: "背景",
    responsibility: "仅提供场景、背景色、环境层次和背景氛围",
    forbiddenInfluence: "不得改变人物身份、面部、姿势、服装、面料或配饰",
    specificity: "specific",
  },
  generic: {
    id: "generic",
    label: "通用补充参考",
    responsibility: "仅补充未被具体角色覆盖的信息；与任何具体角色冲突时，具体角色优先",
    forbiddenInfluence: "不得覆盖、改写或混合 identity、pose_composition、garment、fabric、accessory、styling_only 或 background 的明确职责",
    specificity: "supplemental",
  },
} as const satisfies ReferenceRoleDefinitionMap;

/** Complete, unique and workflow-ordered role catalog. */
export const REFERENCE_ROLE_CATALOG: readonly ReferenceRoleDefinition[] =
  REFERENCE_ROLE_VALUES.map((role) => REFERENCE_ROLE_DEFINITIONS[role]);

/** Exact lookup; a supported role never falls back to generic semantics. */
export function getReferenceRoleDefinition(role: ReferenceRole): ReferenceRoleDefinition {
  return REFERENCE_ROLE_DEFINITIONS[role];
}
