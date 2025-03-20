const path = require("path");
const { app, BrowserWindow, Menu } = require("electron");
const NexaExpress = require("./assets/NexaExpress");
const fs = require("fs");

// Set custom GPU cache path in a location with proper permissions
const userDataPath = app.getPath("userData");
const gpuCachePath = path.join(userDataPath, "GPUCache");
app.commandLine.appendSwitch("gpu-cache-dir", gpuCachePath);

// Add command line switches to suppress GPU cache errors
app.commandLine.appendSwitch("disable-gpu-shader-disk-cache");
app.commandLine.appendSwitch("ignore-gpu-blacklist");
app.commandLine.appendSwitch("disable-gpu-process-crash-limit");

// Disable GPU acceleration to prevent cache errors
app.disableHardwareAcceleration();

// Near the start of your file, before creating any windows
process.on("uncaughtException", (error) => {
  if (
    error.message.includes("Unable to move the cache") ||
    error.message.includes("Unable to create cache") ||
    error.message.includes("Gpu Cache Creation failed")
  ) {
    // Silently ignore GPU cache errors
    return;
  }
  console.error("Uncaught Exception:", error);
});

// Aktifkan reload otomatis dalam mode pengembangan
if (process.env.NODE_ENV === "development") {
  try {
    require("electron-reloader")(module, {
      debug: true,
      watchRenderer: true,
      ignore: [
        "node_modules",
        "dist",
        ".git",
        "package.json",
        "package-lock.json",
      ],
      // Pantau direktori ini untuk perubahan
      watch: [
        path.join(__dirname, "public", "**", "*.{html,js,css}"),
        path.join(__dirname, "assets", "**", "*.{js,css}"),
        path.join(__dirname, "*.js"),
      ],
    });
    console.log("Electron reloader enabled");
  } catch (err) {
    console.log("Error: ", err);
  }
}

// Read nexaui.json configuration
function getAppConfig() {
  try {
    const configPath = path.join(__dirname, "nexaui.json");
    const configData = fs.readFileSync(configPath, "utf8");
    return JSON.parse(configData);
  } catch (err) {
    console.error("Error reading nexaui.json:", err);
    return { properti: { icon: "/assets/brand/logo.png" } }; // Default fallback
  }
}

// Inisialisasi server Express
const expressServer = new NexaExpress(__dirname);
let port;

// Mulai server
async function startServer() {
  try {
    port = await expressServer.start();
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
}

// Jalankan server
startServer();

function createWindow() {
  // Get app configuration
  const appConfig = getAppConfig();
  const iconPath = appConfig.properti.icon || "/assets/brand/logo.png";

  // Buat jendela browser
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    autoHideMenuBar: true,
    show: false,
    // Use icon from nexaui.json configuration
    icon: path.join(__dirname, iconPath.replace(/^\//, "")),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  // Muat file index.html
  mainWindow.loadURL(`http://localhost:${port}`);

  // Sembunyikan menu bar dan nonaktifkan menu untuk semua mode
  Menu.setApplicationMenu(null);
  mainWindow.setMenuBarVisibility(false);

  // Saat siap ditampilkan, maksimalkan dan tampilkan
  mainWindow.once("ready-to-show", () => {
    mainWindow.maximize();
    mainWindow.show();
  });

  if (process.env.NODE_ENV === "development") {
    // Mode pengembangan - tampilkan semua opsi termasuk alat pengembang
    mainWindow.webContents.on("context-menu", (_, props) => {
      const menu = Menu.buildFromTemplate([
        {
          label: "Refresh",
          accelerator: "CmdOrCtrl+R",
          click: () => mainWindow.reload(),
        },
        {
          label: "Back",
          accelerator: "Alt+Left",
          enabled: mainWindow.webContents.canGoBack(),
          click: () => mainWindow.webContents.goBack(),
        },
        {
          label: "Forward",
          accelerator: "Alt+Right",
          enabled: mainWindow.webContents.canGoForward(),
          click: () => mainWindow.webContents.goForward(),
        },

        { type: "separator" },
        {
          label: "Bantuan",
          accelerator: "F1",
          click: () =>
            mainWindow.loadURL(`http://localhost:${port}/oauth/bantuan.html`),
        },
        { type: "separator" },
        { role: "copy" },
        { role: "paste" },
        { role: "cut" },
        { type: "separator" },
        { role: "selectAll" },
        { type: "separator" },
        { role: "undo" },
        { role: "redo" },
        { type: "separator" },
        {
          label: "Inspect Element",
          click: () => mainWindow.webContents.inspectElement(props.x, props.y),
        },
        {
          label: "Toggle Developer Tools",
          accelerator:
            process.platform === "darwin" ? "Alt+Command+I" : "Ctrl+Shift+I",
          click: () => mainWindow.webContents.toggleDevTools(),
        },
        { type: "separator" },
        {
          label: "Properti",
          click: () =>
            mainWindow.loadURL(`http://localhost:${port}/properti.html`),
        },
      ]);
      menu.popup({ window: mainWindow });
    });
  } else {
    // Mode produksi - tampilkan menu konteks dasar tanpa alat pengembang
    mainWindow.webContents.on("context-menu", (_, props) => {
      const menu = Menu.buildFromTemplate([
        {
          label: "Refresh",
          accelerator: "CmdOrCtrl+R",
          click: () => mainWindow.reload(),
        },
        {
          label: "Back",
          accelerator: "Alt+Left",
          enabled: mainWindow.webContents.canGoBack(),
          click: () => mainWindow.webContents.goBack(),
        },
        {
          label: "Forward",
          accelerator: "Alt+Right",
          enabled: mainWindow.webContents.canGoForward(),
          click: () => mainWindow.webContents.goForward(),
        },

        { type: "separator" },
        {
          label: "Bantuan",
          accelerator: "F1",
          click: () =>
            mainWindow.loadURL(`http://localhost:${port}/oauth/bantuan.html`),
        },
        { type: "separator" },
        { role: "copy" },
        { role: "paste" },
        { role: "cut" },
        { type: "separator" },
        { role: "selectAll" },
        { type: "separator" },
        { role: "undo" },
        { role: "redo" },
        { type: "separator" },
        {
          label: "Properti",
          click: () =>
            mainWindow.loadURL(`http://localhost:${port}/properti.html`),
        },
      ]);
      menu.popup({ window: mainWindow });
    });
  }
}

// Metode ini akan dipanggil ketika Electron telah selesai
// inisialisasi dan siap untuk membuat jendela browser
app.whenReady().then(createWindow);

// Keluar saat semua jendela ditutup
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    expressServer.stop();
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
