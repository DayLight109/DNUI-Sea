export default {
  packagerConfig: {
    name: "北极海冰监测与分析系统",
    executableName: "sasi",
    icon: "./public/favicon.ico",
    asar: true,
    derefSymlinks: true,
    ignore: [
      "^/\\.vscode($|/)",
      "^/\\.git($|/)",
      "^/node_modules/\\.cache($|/)",
      "\\.map$"
    ],
    overwrite: true,
    prune: true,
    extraResource: [
      "./public"
    ],
  },
  // 完全禁用重建
  rebuildConfig: false,
  makers: [
    {
      name: "@electron-forge/maker-zip",
      platforms: ["win32"],
    }
  ],
  plugins: [
    {
      name: "@electron-forge/plugin-vite",
      config: {
        // 构建配置
        build: [
          {
            // 主进程配置
            entry: "main.js",
            config: "vite.main.config.js"
          }
        ],
        // 渲染进程配置
        renderer: [
          {
            name: "main_window",
            entry: "index-ele.html",
            config: "vite.renderer.config.js"
          }
        ]
      }
    },
  ],
  // 离线模式
  forgeConfig: {
    offline: true,
  }
}; 