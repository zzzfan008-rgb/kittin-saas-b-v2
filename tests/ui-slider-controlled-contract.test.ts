/**
 * R-85 回归护栏：本地 shadcn Slider 原语（src/components/ui/slider.tsx）的
 * 「受控回写契约」。缺陷史实：受控用法（value + onValueChange）下真实鼠标拖动
 * 完全不生效（键盘/原生通道正常）。根因：@base-ui/react 1.7.0 在单 Thumb 受控
 * 场景下向 onValueChange 发出的 payload 是标量 number（而非 d.ts 声明的
 * number[]），调用方按声明类型取 value[0] 得 undefined，受控 setState 被守卫
 * 挡掉，值永不落地。修复：原语层把标量/数组 payload 归一化为 number[] 再上抛。
 *
 * 本测试为 fail-closed 的源码契约断言（机械可测，不钉死实现细节）：
 *  1. onValueChange/onValueCommitted 在透传给 Root 前必须经过归一化包装，
 *     不得把调用方回调原样透传（payload 形状修复点）；
 *  2. 归一化必须同时覆盖数组与标量两种 payload（Array.isArray 分支）；
 *  3. 受控/非受控二选一——受控时不得把 defaultValue 一并传给 Root；
 *  4. value/defaultValue 不得原样透传（须按数值归一记忆化，保证引用稳定）。
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const sliderSource = fs.readFileSync(
  new URL("../src/components/ui/slider.tsx", import.meta.url),
  "utf8",
);

await test("onValueChange/onValueCommitted 必须经归一化包装（payload 标量→数组）", () => {
  assert.match(
    sliderSource,
    /Array\.isArray\(payload\) \? payload : \[payload\]/,
    "归一化必须覆盖数组与标量两种 payload",
  );
  assert.match(
    sliderSource,
    /normalizePayload\(payload\)/,
    "两个回调必须走归一化",
  );
  assert.match(
    sliderSource,
    /onValueChange=\{handleValueChange\}/,
    "Root 收到的必须是包装后的回调，不得原样透传调用方 onValueChange",
  );
  assert.match(
    sliderSource,
    /onValueCommitted=\{handleValueCommitted\}/,
    "onValueCommitted 同样必须包装（同一缺陷会在 commit 通道复发）",
  );
});

await test("受控/非受控二选一：受控时不得把 defaultValue 传给 Root", () => {
  assert.match(
    sliderSource,
    /defaultValue=\{controlled \? undefined : [a-zA-Z]/,
    "受控用法必须切断 defaultValue 通道",
  );
  assert.match(
    sliderSource,
    /value=\{controlled \? [a-zA-Z][a-zA-Z]* : undefined\}/,
    "非受控用法必须切断 value 通道",
  );
  assert.match(
    sliderSource,
    /const controlled = value !== undefined/,
    "受控判定须与 base-ui useControlled 首帧语义一致",
  );
});

await test("value/defaultValue 不得原样透传（须按数值归一记忆化）", () => {
  assert.doesNotMatch(
    sliderSource,
    /defaultValue=\{defaultValue\}/,
    "不得原样透传 defaultValue prop",
  );
  assert.doesNotMatch(
    sliderSource,
    /^\s*value=\{value\}\s*$/m,
    "不得原样透传 value prop",
  );
  assert.match(
    sliderSource,
    /source\.map\(\(v\) => Number\(v\)\)\.join\(/,
    "memo 依赖键必须来自数值内容",
  );
});
