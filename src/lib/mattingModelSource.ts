/**
 * @imgly/background-removal 模型资源源选择（#4：去错误 CDN、显式失败提示）。
 *
 * 背景：npm 包 @imgly/background-removal 只发 JS，模型/wasm 在独立数据包
 * @imgly/background-removal-data，库默认 publicPath 指向官方 staticimgly.com。
 * 旧代码写死 jsdelivr 路径，但该路径 resources.json 为空 `{}`、模型 404，
 * 抠图必然失败。这里改回库默认的官方数据 CDN（与其内部默认值同源）。
 *
 * 离线/内网部署如需同源托管模型，可在此把 publicPath 指到自托管目录。
 */

/** 与安装版本对齐的官方数据 CDN（同库默认 publicPath，1.7.0）。 */
const PACKAGE_VERSION = "1.7.0";
export const MATTING_PUBLIC_PATH =
  `https://staticimgly.com/@imgly/background-removal-data/${PACKAGE_VERSION}/dist/`;

/**
 * 把资源/网络失败翻译成明确中文提示（不再静默「点了没反应」）。
 * 库常见报错含 "Resource metadata not found" / "Failed to fetch" 等。
 */
export function describeMattingResourceError(error: unknown): string {
  const raw = error instanceof Error ? error.message : String(error);
  if (/resource metadata not found|resource .* not found|404/i.test(raw)) {
    return "抠图模型资源缺失或当前网络无法访问模型服务，请检查网络后重试，或联系管理员配置本地模型";
  }
  if (/failed to fetch|network|load failed|cors|timeout|abort/i.test(raw)) {
    return "无法下载抠图模型（网络不可达），请检查网络连接后重试";
  }
  return raw || "抠图模型加载失败，请重试";
}
