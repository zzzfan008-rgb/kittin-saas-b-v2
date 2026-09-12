const PNG = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

function node(
  id: string,
  type: string,
  data: Record<string, unknown>,
) {
  return { id, type, position: { x: 0, y: 0 }, data: { status: "idle", ...data } };
}
export function legacyV0Workflow() {
  return {
    nodes: [node("source", "image-input", {
      kind: "image-input",
      label: "历史参考图",
      imageRole: "reference",
      imageUrl: PNG,
    })],
    edges: [],
  };
}

export function legacyV4Workflow() {
  return {
    schemaVersion: 4,
    nodes: [
      node("source", "image-input", {
        kind: "image-input",
        label: "人物参考",
        imageRole: "identity",
        roleNeedsConfirmation: false,
        imageUrl: PNG,
      }),
      node("target", "ai-modify", {
        kind: "ai-modify",
        label: "改款",
        prompt: "保留参考图职责",
        outputImages: [],
      }),
    ],
    edges: [{ id: "source-target", source: "source", target: "target" }],
  };
}

export function legacyV5Workflow() {
  return {
    schemaVersion: 5,
    nodes: [node("target", "ai-modify", {
      kind: "ai-modify",
      label: "旧版改款",
      prompt: "迁移后仍需复核",
      outputImages: [],
    })],
    edges: [],
  };
}

export function duplicateRoleWorkflow() {
  return {
    schemaVersion: 6,
    nodes: [
      node("one", "image-input", {
        kind: "image-input",
        label: "上装正面",
        imageRole: "garment_top",
        roleNeedsConfirmation: false,
        imageUrl: PNG,
      }),
      node("two", "image-input", {
        kind: "image-input",
        label: "上装背面",
        imageRole: "garment_top",
        roleNeedsConfirmation: false,
        imageUrl: PNG,
      }),
      node("target", "ai-modify", {
        kind: "ai-modify",
        label: "改款",
        prompt: "保留上装",
        outputImages: [],
        modelId: "gpt-image-2-vip",
        modelOptions: { size: "2048x2048" },
        operationMode: "edit",
        operationModeNeedsConfirmation: false,
      }),
    ],
    edges: [
      {
        id: "one-target",
        source: "one",
        target: "target",
        data: { role: "garment_top", roleNeedsConfirmation: false },
      },
      {
        id: "two-target",
        source: "two",
        target: "target",
        data: { role: "garment_top", roleNeedsConfirmation: false },
      },
    ],
  };
}

export function generatedUpstreamWorkflow() {
  return {
    schemaVersion: 6,
    nodes: [
      node("generated", "ai-modify", {
        kind: "ai-modify",
        label: "上游生成",
        prompt: "生成一张图",
        aspectRatio: "1:1",
        batchSize: 1,
        outputImages: [PNG],
        modelId: "gpt-image-2-vip",
        modelOptions: { size: "2048x2048" },
        operationMode: "edit",
        operationModeNeedsConfirmation: false,
      }),
      node("target", "ai-modify", {
        kind: "ai-modify",
        label: "下游改款",
        prompt: "等待角色复核",
        aspectRatio: "1:1",
        batchSize: 1,
        outputImages: [],
        modelId: "gpt-image-2-vip",
        modelOptions: { size: "2048x2048" },
        operationMode: "edit",
        operationModeNeedsConfirmation: false,
      }),
    ],
    edges: [{
      id: "generated-target",
      source: "generated",
      target: "target",
      data: { role: "generic", roleNeedsConfirmation: true },
    }],
  };
}

export function missingImageWorkflow() {
  return {
    schemaVersion: 6,
    nodes: [
      node("source", "image-input", {
        kind: "image-input",
        label: "缺失参考图",
        imageRole: "identity",
        roleNeedsConfirmation: false,
      }),
      node("target", "ai-modify", {
        kind: "ai-modify",
        label: "改款",
        prompt: "不能运行",
        aspectRatio: "1:1",
        batchSize: 1,
        outputImages: [],
        modelId: "gpt-image-2-vip",
        modelOptions: { size: "2048x2048" },
        operationMode: "edit",
        operationModeNeedsConfirmation: false,
      }),
    ],
    edges: [{
      id: "missing-target",
      source: "source",
      target: "target",
      data: { role: "identity", roleNeedsConfirmation: false },
    }],
  };
}
