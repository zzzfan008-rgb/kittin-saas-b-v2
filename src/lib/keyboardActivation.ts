/**
 * 键盘激活目标判定（R-80 R3）。
 *
 * document 级画布快捷键（如「选中节点 + Enter 打开功能设置」）必须让位给
 * 浏览器原生激活行为：焦点在可激活元素上时，Enter/Space 应由该元素自身响应
 * （按钮点击、tab 切换、链接跳转、复选框切换等），快捷键守卫不得 preventDefault。
 *
 * 纯标签名/ARIA role 判定，不依赖 DOM 运行时，便于在 node 单测中直接验证。
 */

const NATIVE_ACTIVATION_ROLES = new Set([
  "button",
  "tab",
  "link",
  "checkbox",
  "radio",
  "switch",
  "menuitem",
  "menuitemcheckbox",
  "menuitemradio",
  "option",
]);

interface ActivatableLike {
  tagName?: string;
  getAttribute?: (name: string) => string | null;
}

export function isNativeActivationTarget(
  element: ActivatableLike | Element | null | undefined,
): boolean {
  if (!element || typeof (element as ActivatableLike).tagName !== "string") return false;
  const tag = (element as ActivatableLike).tagName;
  if (tag === "BUTTON" || tag === "SUMMARY" || tag === "OPTION") return true;
  // 带 href 的链接由 Enter 原生激活；无 href 的 <a> 不在此列。
  if (tag === "A" && typeof element.getAttribute === "function"
    && element.getAttribute("href") != null) {
    return true;
  }
  const getAttribute = (element as ActivatableLike).getAttribute;
  if (typeof getAttribute !== "function") return false;
  const role = getAttribute.call(element, "role");
  if (!role) return false;
  return role.split(/\s+/).some((token) => NATIVE_ACTIVATION_ROLES.has(token));
}
