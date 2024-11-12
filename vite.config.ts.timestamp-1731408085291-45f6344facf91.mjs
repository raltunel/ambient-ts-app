// vite.config.ts
import { defineConfig } from "file:///D:/aa_proven/ambient-ts-2/node_modules/vite/dist/node/index.js";
import react from "file:///D:/aa_proven/ambient-ts-2/node_modules/@vitejs/plugin-react/dist/index.mjs";
import macrosPlugin from "file:///D:/aa_proven/ambient-ts-2/node_modules/vite-plugin-babel-macros/dist/plugin.js";
import checker from "file:///D:/aa_proven/ambient-ts-2/node_modules/vite-plugin-checker/dist/esm/main.js";
import { execSync } from "child_process";
var vite_config_default = defineConfig({
  base: "/",
  plugins: [
    react(),
    macrosPlugin(),
    checker({
      eslint: {
        // for example, lint .ts and .tsx
        lintCommand: 'eslint "./src/**/*.{ts,tsx}"'
      },
      // e.g. use TypeScript check
      typescript: true
    }),
    {
      name: "html-transform",
      transformIndexHtml(html) {
        const gitHash = execSync("git rev-parse --short HEAD").toString().trim();
        return html.replace(/__BUILD_TIME__/g, Date.now().toString()).replace(/__PRINT__/g, gitHash).replace(
          /__VERSION__/g,
          process.env.npm_package_version || "1.0.0"
        );
      }
    }
  ],
  define: {
    "import.meta.env": {},
    global: {}
  },
  server: {
    port: 3e3
  },
  build: {
    outDir: "build"
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFxhYV9wcm92ZW5cXFxcYW1iaWVudC10cy0yXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJEOlxcXFxhYV9wcm92ZW5cXFxcYW1iaWVudC10cy0yXFxcXHZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9EOi9hYV9wcm92ZW4vYW1iaWVudC10cy0yL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSc7XHJcbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdCc7XHJcbmltcG9ydCBtYWNyb3NQbHVnaW4gZnJvbSAndml0ZS1wbHVnaW4tYmFiZWwtbWFjcm9zJztcclxuaW1wb3J0IGNoZWNrZXIgZnJvbSAndml0ZS1wbHVnaW4tY2hlY2tlcic7XHJcbmltcG9ydCB7IGV4ZWNTeW5jIH0gZnJvbSAnY2hpbGRfcHJvY2Vzcyc7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xyXG4gICAgYmFzZTogJy8nLFxyXG4gICAgcGx1Z2luczogW1xyXG4gICAgICAgIHJlYWN0KCksXHJcbiAgICAgICAgbWFjcm9zUGx1Z2luKCksXHJcbiAgICAgICAgY2hlY2tlcih7XHJcbiAgICAgICAgICAgIGVzbGludDoge1xyXG4gICAgICAgICAgICAgICAgLy8gZm9yIGV4YW1wbGUsIGxpbnQgLnRzIGFuZCAudHN4XHJcbiAgICAgICAgICAgICAgICBsaW50Q29tbWFuZDogJ2VzbGludCBcIi4vc3JjLyoqLyoue3RzLHRzeH1cIicsXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIC8vIGUuZy4gdXNlIFR5cGVTY3JpcHQgY2hlY2tcclxuICAgICAgICAgICAgdHlwZXNjcmlwdDogdHJ1ZSxcclxuICAgICAgICB9KSxcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIG5hbWU6ICdodG1sLXRyYW5zZm9ybScsXHJcbiAgICAgICAgICAgIHRyYW5zZm9ybUluZGV4SHRtbChodG1sKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBnaXRIYXNoID0gZXhlY1N5bmMoJ2dpdCByZXYtcGFyc2UgLS1zaG9ydCBIRUFEJylcclxuICAgICAgICAgICAgICAgICAgICAudG9TdHJpbmcoKVxyXG4gICAgICAgICAgICAgICAgICAgIC50cmltKCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gaHRtbFxyXG4gICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC9fX0JVSUxEX1RJTUVfXy9nLCBEYXRlLm5vdygpLnRvU3RyaW5nKCkpXHJcbiAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoL19fUFJJTlRfXy9nLCBnaXRIYXNoKVxyXG4gICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvX19WRVJTSU9OX18vZyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgcHJvY2Vzcy5lbnYubnBtX3BhY2thZ2VfdmVyc2lvbiB8fCAnMS4wLjAnLFxyXG4gICAgICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgfSxcclxuICAgIF0sXHJcbiAgICBkZWZpbmU6IHtcclxuICAgICAgICAnaW1wb3J0Lm1ldGEuZW52Jzoge30sXHJcbiAgICAgICAgZ2xvYmFsOiB7fSxcclxuICAgIH0sXHJcbiAgICBzZXJ2ZXI6IHtcclxuICAgICAgICBwb3J0OiAzMDAwLFxyXG4gICAgfSxcclxuICAgIGJ1aWxkOiB7XHJcbiAgICAgICAgb3V0RGlyOiAnYnVpbGQnLFxyXG4gICAgfSxcclxufSk7XHJcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBbVEsU0FBUyxvQkFBb0I7QUFDaFMsT0FBTyxXQUFXO0FBQ2xCLE9BQU8sa0JBQWtCO0FBQ3pCLE9BQU8sYUFBYTtBQUNwQixTQUFTLGdCQUFnQjtBQUV6QixJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUN4QixNQUFNO0FBQUEsRUFDTixTQUFTO0FBQUEsSUFDTCxNQUFNO0FBQUEsSUFDTixhQUFhO0FBQUEsSUFDYixRQUFRO0FBQUEsTUFDSixRQUFRO0FBQUE7QUFBQSxRQUVKLGFBQWE7QUFBQSxNQUNqQjtBQUFBO0FBQUEsTUFFQSxZQUFZO0FBQUEsSUFDaEIsQ0FBQztBQUFBLElBQ0Q7QUFBQSxNQUNJLE1BQU07QUFBQSxNQUNOLG1CQUFtQixNQUFNO0FBQ3JCLGNBQU0sVUFBVSxTQUFTLDRCQUE0QixFQUNoRCxTQUFTLEVBQ1QsS0FBSztBQUNWLGVBQU8sS0FDRixRQUFRLG1CQUFtQixLQUFLLElBQUksRUFBRSxTQUFTLENBQUMsRUFDaEQsUUFBUSxjQUFjLE9BQU8sRUFDN0I7QUFBQSxVQUNHO0FBQUEsVUFDQSxRQUFRLElBQUksdUJBQXVCO0FBQUEsUUFDdkM7QUFBQSxNQUNSO0FBQUEsSUFDSjtBQUFBLEVBQ0o7QUFBQSxFQUNBLFFBQVE7QUFBQSxJQUNKLG1CQUFtQixDQUFDO0FBQUEsSUFDcEIsUUFBUSxDQUFDO0FBQUEsRUFDYjtBQUFBLEVBQ0EsUUFBUTtBQUFBLElBQ0osTUFBTTtBQUFBLEVBQ1Y7QUFBQSxFQUNBLE9BQU87QUFBQSxJQUNILFFBQVE7QUFBQSxFQUNaO0FBQ0osQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
