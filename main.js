import { app, BrowserWindow, screen, globalShortcut } from 'electron';
import path from 'path';

let win;

function createWindow() {
  // 获取屏幕的工作区域
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;

  win = new BrowserWindow({
    width: Math.min(800, width),  // 确保宽度不会超过屏幕宽度
    height: Math.min(600, height), // 确保高度不会超过屏幕高度
    minWidth: 300,  // 设置最小宽度
    minHeight: 400,  // 设置最小高度
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  // 加载前端项目的入口页面 (假设你使用 Vite 或其他构建工具)
  win.loadURL('http://localhost:5173');  // 本地开发端口，或打包后的 index.html

  // 窗口最大化
  win.maximize();
  // 打开开发者工具
  win.webContents.openDevTools();

  // 注册 F12 快捷键以打开开发者工具
  globalShortcut.register('F12', () => {
    win.webContents.openDevTools();
  });

  // 监听窗口关闭
  win.on('closed', () => {
    win = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });
});

// 在应用退出时注销快捷键
app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});
