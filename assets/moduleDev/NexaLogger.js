//UILogger
export class NexaLogger {
  constructor() {
    this.logs = []; // Menyimpan history log
    this.maxLogs = 100; // Batasan jumlah log yang disimpan
    this.createLogContainer();
    this.interceptConsole();
    this.interceptErrors();
    this.addToolbar();
  }

  createLogContainer() {
    const container = document.createElement("div");
    container.id = "ui-logger";
    container.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            width: 90%;
            max-width: 800px;
            max-height: 300px;
            overflow-y: auto;
            background: rgba(33, 33, 33, 0.95);
            color: #fff;
            font-family: 'SF Mono', 'Consolas', monospace;
            font-size: 13px;
            padding: 0;
            z-index: 9999;
            display: none;
            border-radius: 8px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
            backdrop-filter: blur(10px);
            opacity: 0;
            transition: opacity 0.3s ease;
            scrollbar-width: thin;
            scrollbar-color: #666 #333;
        `;

    // Tambahkan header
    const header = document.createElement("div");
    header.style.cssText = `
            padding: 12px 16px;
            background: rgba(40, 40, 40, 0.95);
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            font-weight: bold;
            border-radius: 8px 8px 0 0;
            display: flex;
            justify-content: space-between;
            align-items: center;
        `;
    header.innerHTML = `
            <span style="color: #64ffda;">LOGGER</span>
            <span style="font-size: 11px; color: #888;">CONSOLE</span>
        `;
    container.appendChild(header);
    // Tambahkan container untuk log entries
    const logContainer = document.createElement("div");
    logContainer.id = "ui-logger-entries";
    logContainer.style.cssText = `
            padding: 8px 0;
            max-height: calc(300px - 45px);
            overflow-y: auto;
        `;
    container.appendChild(logContainer);

    document.body.appendChild(container);
  }

  showLogger() {
    const container = document.getElementById("ui-logger");
    if (container) {
      container.style.display = "block";
      setTimeout(() => {
        container.style.opacity = "1";
      }, 10);
    }
  }

  interceptConsole() {
    const originalConsole = {
      log: console.log.bind(console),
      error: console.error.bind(console),
      warn: console.warn.bind(console),
      debug: console.debug.bind(console),
    };

    console.log = (...args) => {
      this.logToUI("log", args);
      if (!args) {
        originalConsole.log(...args);
      }
    };

    console.error = (...args) => {
      this.logToUI("error", args);
      originalConsole.error(...args);
    };

    console.warn = (...args) => {
      this.logToUI("warn", args);
      originalConsole.warn(...args);
    };

    console.debug = (...args) => {
      this.logToUI("debug", args);
      originalConsole.debug(...args);
    };
  }

  interceptErrors() {
    window.onerror = (msg, url, lineNo, columnNo, error) => {
      this.showLogger();
      const container = document.getElementById("ui-logger");
      const logEntry = document.createElement("div");
      const timestamp = new Date().toLocaleTimeString();

      logEntry.style.cssText = `
                padding: 4px 8px;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                color: #ff5555;
            `;

      const errorLocation = `${url}:${lineNo}:${columnNo}`;
      logEntry.textContent = `[${timestamp}] [Uncaught Error] ${msg} at ${errorLocation}`;

      container.appendChild(logEntry);
      container.scrollTop = container.scrollHeight;

      // Tambahkan stack trace jika tersedia
      if (error && error.stack) {
        const stackEntry = document.createElement("div");
        stackEntry.style.cssText = `
                    padding: 4px 8px 4px 20px;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                    color: #ff5555;
                    font-size: 11px;
                `;
        stackEntry.textContent = error.stack;
        container.appendChild(stackEntry);
      }
    };

    // Tangkap unhandled promise rejections
    window.onunhandledrejection = (event) => {
      this.showLogger();
      const container = document.getElementById("ui-logger");
      const logEntry = document.createElement("div");
      const timestamp = new Date().toLocaleTimeString();
      logEntry.style.cssText = `
                padding: 4px 8px;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                color: #ff5555;
            `;
      const reason = event.reason;
      logEntry.textContent = `[${timestamp}] [Unhandled Promise Rejection] ${
        reason instanceof Error ? reason.message : String(reason)
      }`;

      container.appendChild(logEntry);
      container.scrollTop = container.scrollHeight;

      // Tambahkan stack trace jika tersedia
      if (reason instanceof Error && reason.stack) {
        const stackEntry = document.createElement("div");
        stackEntry.style.cssText = `
                    padding: 4px 8px 4px 20px;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                    color: #ff5555;
                    font-size: 11px;
                `;
        stackEntry.textContent = reason.stack;
        container.appendChild(stackEntry);
      }
    };
  }
  addToolbar() {
    const toolbar = document.createElement("div");
    toolbar.style.cssText = `
            padding: 8px 16px;
            background: rgba(40, 40, 40, 0.95);
            border-top: 1px solid rgba(255, 255, 255, 0.1);
            display: flex;
            gap: 10px;
            align-items: center;
        `;

    // Filter buttons
    const filterTypes = ["all", "error", "warn", "log", "debug"];
    filterTypes.forEach((type) => {
      const button = document.createElement("button");
      button.textContent = type.toUpperCase();
      button.style.cssText = `
                padding: 4px 8px;
                background: ${type === "all" ? "#64ffda" : "transparent"};
                color: ${type === "all" ? "#000" : "#fff"};
                border: 1px solid ${type === "all" ? "#64ffda" : "#666"};
                border-radius: 4px;
                cursor: pointer;
                font-size: 11px;
                transition: all 0.2s;
            `;
      button.onclick = () => this.filterLogs(type);
      toolbar.appendChild(button);
    });

    // Clear button
    const clearButton = document.createElement("button");
    clearButton.textContent = "CLEAR";
    clearButton.style.cssText = `
            padding: 4px 8px;
            background: #ff5555;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 11px;
            margin-left: auto;
        `;
    clearButton.onclick = () => this.clearLogs();
    toolbar.appendChild(clearButton);

    // Export button
    const exportButton = document.createElement("button");
    exportButton.textContent = "EXPORT";
    exportButton.style.cssText = `
            padding: 4px 8px;
            background: #8be9fd;
            color: black;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 11px;
        `;
    exportButton.onclick = () => this.exportLogs();
    toolbar.appendChild(exportButton);

    const container = document.getElementById("ui-logger");
    container.appendChild(toolbar);
  }

  filterLogs(type) {
    const entries = document.querySelectorAll("#ui-logger-entries .log-entry");
    entries.forEach((entry) => {
      if (type === "all") {
        entry.style.display = "block";
      } else {
        entry.style.display = entry.dataset.type === type ? "block" : "none";
      }
    });
  }

  clearLogs() {
    const container = document.getElementById("ui-logger-entries");
    container.innerHTML = "";
    this.logs = [];
  }

  exportLogs() {
    const exportData = {
      timestamp: new Date().toISOString(),
      logs: this.logs,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `console-logs-${new Date().toISOString()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // Perbaiki method logToUI untuk memastikan container ada
  logToUI(type, args) {
    const container = document.getElementById("ui-logger-entries");
    if (!container) return; // Pastikan container ada

    this.showLogger(); // Tampilkan logger

    // Simpan log ke array
    this.logs.push({
      type,
      timestamp: new Date().toISOString(),
      message: args
        .map((arg) => (typeof arg === "object" ? JSON.stringify(arg) : arg))
        .join(" "),
    });

    // Batasi jumlah log
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    const logEntry = document.createElement("div");
    logEntry.classList.add("log-entry");
    logEntry.dataset.type = type;

    // Styling untuk entry
    logEntry.style.cssText = `
            padding: 8px 16px;
            border-left: 3px solid transparent;
            margin: 2px 0;
            font-size: 12px;
            line-height: 1.4;
        `;

    // Set warna berdasarkan tipe
    let borderColor = "#50fa7b"; // Default untuk log
    switch (type) {
      case "error":
        borderColor = "#ff5555";
        logEntry.style.background = "rgba(255, 85, 85, 0.1)";
        break;
      case "warn":
        borderColor = "#ffb86c";
        logEntry.style.background = "rgba(255, 184, 108, 0.1)";
        break;
      case "debug":
        borderColor = "#8be9fd";
        break;
      case "log":
        logEntry.style.background = "rgba(80, 250, 123, 0.1)";
        break;
    }
    logEntry.style.borderLeftColor = borderColor;
    // Tambahkan timestamp
    const timeSpan = document.createElement("span");
    timeSpan.style.cssText = "color: #888; margin-right: 8px;";
    timeSpan.textContent = new Date().toLocaleTimeString();

    // Tambahkan tipe log
    const typeSpan = document.createElement("span");
    typeSpan.style.cssText = `color: ${borderColor}; font-weight: bold; margin-right: 8px;`;
    typeSpan.textContent = type.toUpperCase();

    // Tambahkan pesan
    const messageSpan = document.createElement("span");
    messageSpan.textContent = args
      .map((arg) =>
        typeof arg === "object" ? JSON.stringify(arg, null, 2) : arg
      )
      .join(" ");

    // Gabungkan semua elemen
    logEntry.appendChild(timeSpan);
    logEntry.appendChild(typeSpan);
    logEntry.appendChild(messageSpan);

    // Tambahkan ke container
    container.appendChild(logEntry);
    container.scrollTop = container.scrollHeight;
  }
}
const UIPublic = new Ngorei().Network();
UIPublic.localStorage()
  .get("UILogger")
  .then((result) => {
    if (result) {
      window.uiLogger = new UILogger();
    }
  });
