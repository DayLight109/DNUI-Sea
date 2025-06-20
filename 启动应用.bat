@echo off
echo 正在启动北极海冰监测与分析系统...
cd /d "%~dp0"
cd out\北极海冰监测与分析系统-win32-x64
start 北极海冰监测与分析系统.exe
echo 应用已启动！
timeout /t 3 