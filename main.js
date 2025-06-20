import { app, BrowserWindow, globalShortcut } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';
import { existsSync } from 'fs';

// 获取__dirname（ES模块中）
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 保存主窗口的引用
let mainWindow;
// 保存Vite服务进程
let viteProcess = null;

// 启动Vite开发服务器（仅在开发环境）
async function startViteServer() {
  if (process.env.NODE_ENV !== 'development') return;
  
  console.log('Starting Vite development server...');
  
  return new Promise((resolve) => {
    try {
      // 使用spawn启动npm run dev
      viteProcess = spawn('npm.cmd', ['run', 'dev'], {
        cwd: __dirname,
        stdio: 'pipe'
      });
      
      // 设置超时
      const timeout = setTimeout(() => {
        console.log('Vite server startup timed out, continuing anyway');
        resolve();
      }, 20000); // 20秒超时
      
      // 输出Vite的日志
      if (viteProcess.stdout) {
        viteProcess.stdout.on('data', (data) => {
          const output = data.toString();
          console.log(output);
          
          // 当Vite服务器启动完成时解析Promise
          if (output.includes('Local:') || output.includes('ready in')) {
            console.log('Vite development server started');
            clearTimeout(timeout);
            resolve();
          }
        });
      }
      
      if (viteProcess.stderr) {
        viteProcess.stderr.on('data', (data) => {
          console.error(`Vite stderr: ${data}`);
        });
      }
      
      viteProcess.on('error', (err) => {
        console.error('Failed to start Vite process:', err);
        clearTimeout(timeout);
        resolve(); // 即使出错也继续执行
      });
      
      viteProcess.on('close', (code) => {
        console.log(`Vite process exited with code ${code}`);
        clearTimeout(timeout);
        resolve(); // 即使出错也继续执行
      });
    } catch (err) {
      console.error('Error starting Vite server:', err);
      resolve(); // 即使出错也继续执行
    }
  });
}

async function createWindow() {
  // 创建浏览器窗口
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false  // 允许加载本地文件
    }
  });

  // 打印环境信息
  console.log('App path:', app.getAppPath());
  console.log('Current directory:', __dirname);
  console.log('NODE_ENV:', process.env.NODE_ENV);
  
  // 在开发环境中使用Vite服务器
  if (process.env.NODE_ENV === 'development') {
    // 启动Vite服务器
    await startViteServer();
    // 给Vite服务器一点时间启动
    await new Promise(resolve => setTimeout(resolve, 2000));
    // 加载开发服务器URL
    await mainWindow.loadURL('http://localhost:5173');
    // 打开开发者工具
    mainWindow.webContents.openDevTools();
  } else {
    // 生产环境：尝试加载打包后的文件
    try {
      // 打开开发者工具以便调试
      mainWindow.webContents.openDevTools();
      
      // 优先尝试加载index-prod.html
      const prodHtmlPath = path.join(__dirname, 'index-prod.html');
      console.log(`Checking for index-prod.html at: ${prodHtmlPath}`);
      
      if (existsSync(prodHtmlPath)) {
        console.log(`Loading index-prod.html from: ${prodHtmlPath}`);
        await mainWindow.loadFile(prodHtmlPath);
        return;
      }
      
      // 如果index-prod.html不存在，尝试其他可能的路径
      const possiblePaths = [
        path.join(__dirname, 'dist', 'index.html'),
        path.join(__dirname, 'resources', 'dist', 'index.html'),
        path.join(app.getAppPath(), 'dist', 'index.html'),
        path.join(process.resourcesPath, 'dist', 'index.html')
      ];
      
      // 查找第一个存在的文件
      let indexPath = null;
      for (const p of possiblePaths) {
        console.log(`Checking path: ${p}`);
        if (existsSync(p)) {
          indexPath = p;
          console.log(`Found index.html at: ${p}`);
          break;
        }
      }
      
      if (indexPath) {
        console.log(`Loading file: ${indexPath}`);
        await mainWindow.loadFile(indexPath);
      } else {
        console.error('Could not find index.html in any expected location');
        // 尝试直接加载index-ele.html
        await mainWindow.loadFile(path.join(__dirname, 'index-ele.html'));
      }
    } catch (err) {
      console.error('Error loading production build:', err);
      // 显示错误信息
      await mainWindow.loadURL('data:text/html,<html><body><h1>加载错误</h1><p>无法加载应用，请检查控制台日志</p></body></html>');
    }
  }

  // 注册快捷键
  globalShortcut.register('F12', () => {
    mainWindow.webContents.toggleDevTools();
  });

  globalShortcut.register('Ctrl+R', () => {
    mainWindow.reload();
  });

  // 当窗口关闭时触发
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// 当Electron完成初始化并准备创建浏览器窗口时调用此方法
app.whenReady().then(createWindow).catch(err => {
  console.error('Error in app initialization:', err);
});

// 当所有窗口关闭时退出应用
app.on('window-all-closed', () => {
  // 在macOS上，应用程序和菜单栏通常会保持活动状态，直到用户使用Cmd+Q明确退出
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // 在macOS上，当点击dock图标并且没有其他窗口打开时，通常会在应用程序中重新创建一个窗口
  if (mainWindow === null) {
    createWindow().catch(err => {
      console.error('Error recreating window:', err);
    });
  }
});

// 应用退出前注销所有快捷键并关闭Vite服务器
app.on('will-quit', () => {
  globalShortcut.unregisterAll();
  
  // 关闭Vite进程
  if (viteProcess) {
    console.log('Shutting down Vite development server...');
    try {
      // 在Windows上需要使用taskkill强制终止进程树
      if (process.platform === 'win32') {
        spawn('taskkill', ['/pid', viteProcess.pid, '/f', '/t'], { shell: true });
      } else {
        viteProcess.kill('SIGTERM');
      }
    } catch (err) {
      console.error('Error killing Vite process:', err);
    }
  }
}); 