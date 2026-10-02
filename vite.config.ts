import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

const DEFAULT_API_PORT = 3001;

export function resolveApiProxyTarget(
  env: Readonly<Record<string, string | undefined>>,
): string {
  const explicitTarget = env.API_PROXY_TARGET?.trim();
  if (explicitTarget) {
    let url: URL;
    try {
      url = new URL(explicitTarget);
    } catch {
      throw new Error("API_PROXY_TARGET must be an absolute HTTP(S) URL");
    }
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      throw new Error("API_PROXY_TARGET must use http:// or https://");
    }
    return explicitTarget.replace(/\/+$/, "");
  }

  const rawPort = env.PORT?.trim() || String(DEFAULT_API_PORT);
  const port = Number(rawPort);
  if (!Number.isInteger(port) || port < 1 || port > 65_535) {
    throw new Error("PORT must be an integer between 1 and 65535");
  }
  return `http://localhost:${port}`;
}

export default defineConfig(({ mode }) => {
  const projectRoot = process.cwd();
  const env = {
    ...loadEnv(mode, projectRoot, ""),
    ...process.env,
  };

  return {
    plugins: [
      react(),
      tailwindcss(),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"),
        "@server": path.resolve(__dirname, "server"),
        // (b) stub @excalidraw/mermaid-to-excalidraw → 消去 cynefin/katex chunk
        // 该包仅服务于 Excalidraw 内置的「Mermaid 转画布」对话框（~1MB 含 mermaid 全家桶）。
        "@excalidraw/mermaid-to-excalidraw": path.resolve(__dirname, "src/lib/excalidraw-mermaid-stub.ts"),
      },
    },
    server: {
      port: 5173,
      proxy: {
        "/api": {
          target: resolveApiProxyTarget(env),
          changeOrigin: true,
        },
      },
    },
    build: {
      manifest: true,
      rollupOptions: {
        output: {
          manualChunks(id) {
            // Vite 的 __vite__preload helper（虚拟模块）必须独立成小 chunk：
            // 否则 Rollup 可能把它 hoist 进 excalidraw 等 lazy chunk，
            // 使 index/App 对 lazy chunk 形成静态依赖（excalidraw 被拖进首屏）。
            if (id.includes("vite/preload-helper")) {
              return "preload-helper";
            }
            if (!id.includes("node_modules")) return undefined;
            if (/[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/.test(id)) {
              return "vendor-react";
            }
            if (/[\\/]node_modules[\\/](@xyflow|d3-|internmap|delaunator|robust-predicates)/.test(id)) {
              return "vendor-flow";
            }
            if (/[\\/]node_modules[\\/](@base-ui|@floating-ui)[\\/]/.test(id)) {
              return "vendor-ui";
            }
            if (/[\\/]node_modules[\\/](zustand|zundo|nanoid)[\\/]/.test(id)) {
              return "vendor-state";
            }
            if (/[\\/]node_modules[\\/](lucide-react)[\\/]/.test(id)) {
              return "vendor-icons";
            }
            // Card #60: Excalidraw → 独立 lazy chunk。
            // excalidraw 库体积 ~4MB（含字体子集引擎 + 多语言数据），无法拆到 500KB 以下；
            // 门禁脚本对该 chunk 做 source-id 豁免（verify-bundle-budget.mjs --exclude=excalidraw）。
            // 手动归并是为了防止 Rollup 把它的共享依赖散入其他 chunk（如 cynefin/index）。
            if (/[\\/]node_modules[\\/]@excalidraw[\\/]excalidraw[\\/]/.test(id)) {
              return "excalidraw";
            }
            return undefined;
          },
        },
      },
    },
  };
});
