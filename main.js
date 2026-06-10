import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';

// Giải pháp lấy đường dẫn thư mục hiện tại chuẩn ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow = null;
let widgetWindow = null;

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    }
  });

  // Tải cổng kết nối dev local chạy từ Vite
  mainWindow.loadURL('http://localhost:3000');

  mainWindow.on('closed', () => {
    if (widgetWindow) widgetWindow.close();
    mainWindow = null;
  });
}

function createWidgetWindow(scheduleData) {
  if (widgetWindow) {
    widgetWindow.focus();
    widgetWindow.webContents.send('update-widget-data', scheduleData);
    return;
  }

    widgetWindow = new BrowserWindow({
    width: 320,
    height: 480,
    frame: false,             // Không viền
    transparent: true,         // Trong suốt hoàn toàn để hòa vào hình nền
    skipTaskbar: true,         // Không hiện dưới thanh Taskbar

    // === GHIM CHẶT DƯỚI CÙNG MÀN HÌNH NỀN DESKTOP ===
    alwaysOnTop: false,        // Tắt chế độ luôn trên cùng
    type: 'desktop',           // Đẩy cửa sổ xuống dưới cùng màn hình nền Windows, sau tất cả các app đang bật
    // ===============================================

    resizable: false,
    webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
    }
    });

  // Tải route dành riêng cho widget nổi
  widgetWindow.loadURL('http://localhost:3000/#/widget-window'); 

  widgetWindow.webContents.on('did-finish-load', () => {
    widgetWindow.webContents.send('update-widget-data', scheduleData);
  });

  widgetWindow.on('closed', () => {
    widgetWindow = null;
  });
}

// IPC nhận yêu cầu ghim/đóng cửa sổ nổi
ipcMain.on('toggle-widget', (event, scheduleData) => {
  if (widgetWindow) {
    widgetWindow.close();
  } else {
    createWidgetWindow(scheduleData);
  }
});

app.whenReady().then(() => {
  createMainWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});