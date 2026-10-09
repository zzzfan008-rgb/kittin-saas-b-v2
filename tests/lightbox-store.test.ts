/**
 * R-94 lightboxStore 最小行为契约：open/close 语义。
 */
import { strict as assert } from "node:assert";
import { useLightboxStore } from "../src/store/lightboxStore";

export async function run() {
  // 初始关闭
  assert.equal(useLightboxStore.getState().item, null, "初始 item 应为 null");

  // open 带 alt
  useLightboxStore.getState().open("https://example.com/a.png", "图A");
  assert.deepEqual(useLightboxStore.getState().item, { src: "https://example.com/a.png", alt: "图A" });

  // open 不带 alt
  useLightboxStore.getState().open("https://example.com/b.png");
  assert.deepEqual(useLightboxStore.getState().item, { src: "https://example.com/b.png", alt: undefined });

  // close
  useLightboxStore.getState().close();
  assert.equal(useLightboxStore.getState().item, null, "close 后 item 应为 null");
}

if (import.meta.url === `file://${process.argv[1]}`) {
  run().then(() => console.log("lightbox-store.test: 3 passed"));
}
