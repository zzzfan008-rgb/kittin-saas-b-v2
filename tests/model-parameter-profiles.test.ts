import assert from "node:assert/strict";
import {
  MODEL_PARAMETER_PROFILES,
  getModelParameterProfile,
  materializeModelParameterProfile,
} from "../src/types/modelParameterProfiles";

const NEW_FAMILIES = ["upscale", "print-extract", "print-mutate", "fabric-recolor"] as const;
const LEGACY_FAMILIES = ["fashion-lookbook", "commerce-hero", "design-sheet"] as const;
const EXPECTED_PROFILE_COUNT = 41;

assert.equal(MODEL_PARAMETER_PROFILES.length, 41, "4 个普通模型 × (3 族 × 2 模式 + 4 族 × 1 edit) + 1 蒙版 = 41");
assert.equal(new Set(MODEL_PARAMETER_PROFILES.map((profile) => profile.profileId)).size, 41);

const vip = getModelParameterProfile("gpt-image-2.5-flare-vip:fashion-lookbook:edit:v1");
assert.equal(vip?.modelId, "gpt-image-2.5-flare-vip");
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

const mask = getModelParameterProfile("gpt-image-2.5-sunburst:mask-local-edit:mask-edit:v1");
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
      if (profile.businessFrame.aspectRatio === "source") {
        assert.equal(profile.native.size, "source-derived");
        assert.equal(profile.native.derivedFromFirstReference, true);
      }
      break;
    case "gemini-image":
      assert.deepEqual(materialized.modelOptions, {
        aspectRatio: profile.native.aspectRatio,
        imageSize: profile.native.imageSize,
      });
      assert.deepEqual(materialized.ignoredNativeFields, []);
      break;
    case "flux-image":
      if (profile.native.derivedFromFirstReference) {
        assert.deepEqual(materialized.modelOptions, { outputFormat: profile.native.outputFormat });
      } else {
        assert.deepEqual(materialized.modelOptions, {
          width: profile.native.width,
          height: profile.native.height,
          outputFormat: profile.native.outputFormat,
        });
        assert.equal(profile.native.width % profile.native.multipleOf, 0);
        assert.equal(profile.native.height % profile.native.multipleOf, 0);
        assert.ok(profile.native.width * profile.native.height <= profile.native.maxPixels);
      }
      break;
    case "seedream-image":
      assert.deepEqual(materialized.modelOptions, { size: profile.native.size });
      assert.deepEqual(materialized.ignoredNativeFields, profile.native.forbiddenFields);
      assert.equal(Object.hasOwn(materialized.modelOptions, "aspectRatio"), false);
      break;
  }
}

for (const familyId of LEGACY_FAMILIES) {
  assert.equal(MODEL_PARAMETER_PROFILES.filter((p) => p.familyId === familyId).length, 8, `${familyId} 仍为 4 模型 × 2 模式 = 8 条`);
}
for (const familyId of NEW_FAMILIES) {
  assert.equal(MODEL_PARAMETER_PROFILES.filter((p) => p.familyId === familyId).length, 4, `${familyId} 仅 edit 模式 = 4 条`);
  assert.ok(MODEL_PARAMETER_PROFILES.filter((p) => p.familyId === familyId).every((p) => p.mode === "edit"));
}
for (const familyId of NEW_FAMILIES) {
  const expectedFrame = {
    upscale: "source",
    "fabric-recolor": "source",
    "print-extract": "1:1",
    "print-mutate": "1:1",
  }[familyId];
  assert.ok(MODEL_PARAMETER_PROFILES.filter((p) => p.familyId === familyId).every(
    (p) => p.businessFrame.aspectRatio === expectedFrame && p.postprocess.finalAspectRatio === expectedFrame,
  ));
}

console.log("五模型判别联合参数档案测试通过");
