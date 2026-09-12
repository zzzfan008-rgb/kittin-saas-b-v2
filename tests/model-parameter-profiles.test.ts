import assert from "node:assert/strict";
import {
  MODEL_PARAMETER_PROFILES,
  getModelParameterProfile,
  materializeModelParameterProfile,
} from "../src/types/modelParameterProfiles";

assert.equal(MODEL_PARAMETER_PROFILES.length, 25, "4 个普通模型 × 3 任务族 × 2 模式 + 1 蒙版轨");
assert.equal(new Set(MODEL_PARAMETER_PROFILES.map((profile) => profile.profileId)).size, 25);

const vip = getModelParameterProfile("gpt-image-2-vip:fashion-lookbook:edit:v1");
assert.equal(vip?.modelId, "gpt-image-2-vip");
assert.deepEqual(vip?.native.kind === "gpt-image-2-vip" ? vip.native.omittedFields : [], [
  "quality", "n", "aspect_ratio",
]);

const seedream = getModelParameterProfile("seedream-5-0-260128:design-sheet:edit:v1");
assert.equal(seedream?.native.kind, "seedream-image");
if (seedream?.native.kind === "seedream-image") {
  assert.equal(seedream.native.responseFormat, "b64_json");
  assert.equal(seedream.native.watermark, false);
  assert.equal(seedream.native.sequentialImageGeneration, "disabled");
  assert.equal(seedream.native.aspectRatioField, "unsupported");
  assert.deepEqual(seedream.native.forbiddenFields, ["n", "aspect_ratio"]);
  assert.equal(seedream.native.recordActualOutputSize, true);
  assert.equal(seedream.postprocess.finalAspectRatio, "4:3");
}

const mask = getModelParameterProfile("gpt-image-2:mask-local-edit:mask-edit:v1");
assert.equal(mask?.native.kind, "gpt-image-2-mask");
assert.equal(mask?.businessFrame.aspectRatio, "source");
assert.equal(getModelParameterProfile("missing-profile"), undefined, "不得静默回退");

for (const profile of MODEL_PARAMETER_PROFILES) {
  const before = JSON.stringify(profile);
  const materialized = materializeModelParameterProfile(profile);
  assert.equal(materialized.aspectRatio, profile.businessFrame.aspectRatio);
  assert.equal(materialized.batchSize, profile.businessFrame.requestedOutputs);
  assert.equal(JSON.stringify(profile), before, `${profile.profileId} materialize 不得修改受审查档案`);

  switch (profile.native.kind) {
    case "gpt-image-2-mask":
      assert.deepEqual(materialized.modelOptions, {});
      assert.deepEqual(materialized.ignoredNativeFields, []);
      break;
    case "gpt-image-2-vip":
      assert.deepEqual(materialized.modelOptions, { size: profile.native.size });
      assert.deepEqual(materialized.ignoredNativeFields, profile.native.omittedFields);
      break;
    case "gemini-image":
      assert.deepEqual(materialized.modelOptions, {
        aspectRatio: profile.native.aspectRatio,
        imageSize: profile.native.imageSize,
      });
      assert.deepEqual(materialized.ignoredNativeFields, []);
      break;
    case "flux-image":
      assert.deepEqual(materialized.modelOptions, {
        width: profile.native.width,
        height: profile.native.height,
        outputFormat: profile.native.outputFormat,
      });
      assert.equal(profile.native.width % profile.native.multipleOf, 0);
      assert.equal(profile.native.height % profile.native.multipleOf, 0);
      assert.ok(profile.native.width * profile.native.height <= profile.native.maxPixels);
      break;
    case "seedream-image":
      assert.deepEqual(materialized.modelOptions, { size: profile.native.size });
      assert.deepEqual(materialized.ignoredNativeFields, profile.native.forbiddenFields);
      assert.equal(Object.hasOwn(materialized.modelOptions, "aspectRatio"), false);
      break;
  }
}

console.log("五模型判别联合参数档案测试通过");
