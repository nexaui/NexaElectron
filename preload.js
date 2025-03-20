const { contextBridge, ipcRenderer } = require("electron");

// Cache untuk menyimpan elemen yang sudah diproses
const processedElements = new Set();

// Tambahkan API untuk akses kamera
contextBridge.exposeInMainWorld("cameraAPI", {
  requestCamera: async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });
      return stream;
    } catch (error) {
      throw error;
    }
  },
  stopCamera: (stream) => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
  },
});

// Fungsi untuk memproses satu elemen
function processElement(element) {
  if (processedElements.has(element)) return;

  const isExtractorVar = element.hasAttribute("extractorVar");
  const isExtractor = element.hasAttribute("extractor");

  if (!isExtractorVar && !isExtractor) return;

  try {
    const scriptElement = document.createElement("script");
    scriptElement.type = "text/template";

    // Tambahkan style sheet untuk menyembunyikan semua script[type="text/template"]
    if (!document.getElementById("nexa-extractor-style")) {
      const style = document.createElement("style");
      style.id = "nexa-extractor-style";
      style.textContent =
        'script[type="text/template"] { display: none !important; }';
      document.head.appendChild(style);
    }

    scriptElement.dataset.extractor = element.getAttribute(
      isExtractorVar ? "extractorVar" : "extractor"
    );
    if (element.id) scriptElement.id = element.id;

    // Simpan konten dan langsung ganti elemen
    const content = element.innerHTML;
    element.parentNode?.replaceChild(scriptElement, element);
    scriptElement.textContent = content;

    processedElements.add(element);
  } catch (error) {
    console.error("Error processing element:", error);
  }
}

// Tambahkan fungsi untuk decode saat diperlukan
function decodeScript(scriptElement) {
  if (scriptElement.dataset.processed === "true") {
    return atob(scriptElement.textContent);
  }
  return scriptElement.textContent;
}

// Fungsi untuk memproses elemen yang sudah ada
function handleExistingElements() {
  const elements = document.querySelectorAll("[extractorVar], [extractor]");
  elements.forEach(processElement);
}

// Setup observer untuk menangani elemen baru
function setupObserver() {
  // Observer untuk elemen baru
  const elementObserver = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === "childList") {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1) {
            // Element node
            // Cek elemen itu sendiri
            processElement(node);
            // Cek child elements
            node
              .querySelectorAll("[extractorVar], [extractor]")
              .forEach(processElement);
          }
        });
      }
    }
  });

  // Observer untuk document.body
  const bodyObserver = new MutationObserver(() => {
    if (document.body) {
      bodyObserver.disconnect();
      elementObserver.observe(document.body, {
        childList: true,
        subtree: true,
      });
      handleExistingElements();
    }
  });

  // Mulai observasi
  if (document.body) {
    elementObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });
    handleExistingElements();
  } else {
    bodyObserver.observe(document.documentElement, {
      childList: true,
      subtree: true,
    });
  }

  return { elementObserver, bodyObserver };
}

// Inisialisasi
let observers = null;

function initialize() {
  try {
    if (!observers) {
      observers = setupObserver();
    }
  } catch (err) {
    console.error("Failed to initialize observers:", err);
  }
}

// Ubahlah semua window.* kembali menjadi contextBridge.exposeInMainWorld
contextBridge.exposeInMainWorld("nexaExtractor", {
  init: () => {
    try {
      initialize();
    } catch (err) {
      console.error("Failed to initialize nexaExtractor:", err);
    }
  },
  extract: handleExistingElements,
  loadScript: (path) => {
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.type = "module";
      script.src = path;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  },
  getScriptContent: (scriptId) => {
    const script = document.getElementById(scriptId);
    if (script) {
      return decodeScript(script);
    }
    return null;
  },
});

contextBridge.exposeInMainWorld("electronAPI", {
  onOnlineStatus: (callback) => ipcRenderer.on("online-status", callback),
});

contextBridge.exposeInMainWorld("nexaAPI", {
  // ... existing APIs ...
});

contextBridge.exposeInMainWorld("storageManager", {
  // Mendapatkan info quota
  getStorageQuota: async () => {
    try {
      if (navigator.storage && navigator.storage.estimate) {
        const estimate = await navigator.storage.estimate();
        return {
          quota: Math.round((estimate.quota / 1024 / 1024) * 100) / 100, // Convert to MB with 2 decimals
          usage: Math.round((estimate.usage / 1024 / 1024) * 100) / 100,
          remaining:
            Math.round(
              ((estimate.quota - estimate.usage) / 1024 / 1024) * 100
            ) / 100,
        };
      }
      return null;
    } catch (error) {
      console.error("Error in getStorageQuota:", error);
      throw error;
    }
  },

  // Membersihkan storage
  clearStorage: async (storageType) => {
    try {
      switch (storageType) {
        case "localStorage":
          localStorage.clear();
          return true;
        case "indexedDB":
          const dbs = await window.indexedDB.databases();
          dbs.forEach((db) => {
            indexedDB.deleteDatabase(db.name);
          });
          return true;
        case "all":
          localStorage.clear();
          const allDbs = await window.indexedDB.databases();
          allDbs.forEach((db) => {
            indexedDB.deleteDatabase(db.name);
          });
          return true;
        default:
          return false;
      }
    } catch (error) {
      console.error("Error clearing storage:", error);
      return false;
    }
  },

  // Mengatur persistent storage
  requestPersistentStorage: async () => {
    if (navigator.storage && navigator.storage.persist) {
      const isPersisted = await navigator.storage.persist();
      return isPersisted;
    }
    return false;
  },

  // Cek status persistent storage
  isPersistentStorage: async () => {
    if (navigator.storage && navigator.storage.persisted) {
      return await navigator.storage.persisted();
    }
    return false;
  },

  // Request additional storage
  requestAdditionalStorage: async (bytes) => {
    try {
      if (navigator.storage) {
        // Request persistent storage first
        if (navigator.storage.persist) {
          await navigator.storage.persist();
        }

        // Request the quota
        if (navigator.storage.requestQuota) {
          await navigator.storage.requestQuota(bytes);
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error("Error requesting additional storage:", error);
      throw error;
    }
  },
});

contextBridge.exposeInMainWorld("api", {
  onOnlineStatusChange: (callback) => {
    ipcRenderer.on("online-status", (event, status) => {
      callback(status);
    });
  },
});

// Inisialisasi dengan prioritas tinggi
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initialize, { once: true });
} else {
  queueMicrotask(initialize);
}

// Cleanup
window.addEventListener(
  "beforeunload",
  () => {
    if (observers) {
      observers.elementObserver.disconnect();
      observers.bodyObserver.disconnect();
      observers = null;
    }
    processedElements.clear();
  },
  { once: true }
);
