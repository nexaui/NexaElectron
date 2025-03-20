// Helper untuk navigasi
const NexaNavigation = {
  // Konfigurasi routes
  _routes: {
    // Definisi route dan konfigurasinya
    user: {
      pattern: /\/(user|user\.html)$/i,
      defaultContent: [
        { url: "/dashboard", targetId: "main-content" },
        { url: "/activities", targetId: "recent-activities" },
      ],
      layout: "user-layout",
    },
    // Tambahkan route lain sesuai kebutuhan
  },

  // Store last navigation state
  _lastNavigation: null,
  _currentPage: null,
  _currentRoute: null,
  _isInitialized: false,

  // Tambahkan property untuk NexaKey
  _nexaKeyData: new Map(),

  // Helper untuk parse atribut
  _parseNavAttr: (element) => {
    // Format: nav="target:main-content" atau nav="main-content" atau nav saja
    const navAttr = element.getAttribute("nav");
    const url = element.getAttribute("href");

    // Jika nav tidak memiliki nilai, gunakan default main-content
    if (navAttr === "" || navAttr === null) {
      return { url, targetId: "main-content" };
    }

    // Jika nav memiliki nilai, parse targetId-nya
    const [target = "main-content"] = navAttr.split(":").reverse();
    return { url, targetId: target };
  },

  // Inisialisasi awal
  init: () => {
    if (NexaNavigation._isInitialized) return;

    // Set current page dan cek tipe halaman
    NexaNavigation._currentPage = window.location.pathname;
    NexaNavigation._isInitialized = true;

    // Load saved NexaKey data
    try {
      const savedKeyData = localStorage.getItem("nexaNavigationKeyData");
      if (savedKeyData) {
        const data = JSON.parse(savedKeyData);
        Object.entries(data).forEach(([key, value]) => {
          NexaNavigation._nexaKeyData.set(key, value);
        });
      }
    } catch (error) {
      console.error("Error loading NexaKey data:", error);
    }

    // Setup event delegation untuk navigasi
    document.addEventListener("click", async (e) => {
      // Handle navigation links
      const navElement = e.target.closest("[nav]");
      if (navElement) {
        e.preventDefault();
        const navInfo = NexaNavigation._parseNavAttr(navElement);
        if (navInfo?.url) {
          try {
            // Simpan URL asli sebelum navigasi
            const originalUrl = window.location.pathname;
            await NexaNavigation.load(
              navInfo.url,
              navInfo.targetId,
              false,
              originalUrl
            );
          } catch (error) {
            console.error("Navigation failed:", error);
          }
        }
      }

      // Handle load buttons
      const loadElement = e.target.closest("[load]");
      if (loadElement) {
        e.preventDefault();
        const url = loadElement.getAttribute("url");
        const target = loadElement.getAttribute("load") || "main-content";
        if (url) {
          try {
            await NexaNavigation.load(url, target);
          } catch (error) {
            console.error("Load failed:", error);
          }
        }
      }
    });

    // Inisialisasi halaman saat pertama kali load
    window.addEventListener("DOMContentLoaded", async () => {
      try {
        await NexaNavigation.initializePage();
      } catch (error) {
        console.error("Failed to initialize page:", error);
      }
    });

    // Handle browser back/forward
    window.addEventListener("popstate", async (event) => {
      if (event.state?.contents) {
        try {
          for (const [targetId, url] of Object.entries(event.state.contents)) {
            await NexaNavigation.load(url, targetId, true);
          }
        } catch (error) {
          console.error("Navigation failed:", error);
        }
      }
    });

    // Save state before unload
    window.addEventListener("beforeunload", () => {
      NexaNavigation.saveCurrentState();
    });
  },

  // Deteksi route berdasarkan path
  detectRoute: (path) => {
    for (const [routeName, routeConfig] of Object.entries(
      NexaNavigation._routes
    )) {
      if (routeConfig.pattern.test(path)) {
        return {
          name: routeName,
          ...routeConfig,
        };
      }
    }
    return null;
  },

  // Load konten default berdasarkan route
  loadDefaultContent: async (route) => {
    if (!route?.defaultContent) return;

    for (const content of route.defaultContent) {
      // Cek apakah elemen target ada sebelum mencoba load
      if (document.getElementById(content.targetId)) {
        await NexaNavigation.load(content.url, content.targetId, true);
      } else {
        console.warn(
          `Target element '${content.targetId}' not found, skipping load`
        );
      }
    }
  },

  // Inisialisasi halaman berdasarkan route
  initializePage: async () => {
    try {
      const currentPath = window.location.pathname;
      NexaNavigation._currentPage = currentPath;

      const savedState = localStorage.getItem(`navigationState_${currentPath}`);
      const route = NexaNavigation.detectRoute(currentPath);
      NexaNavigation._currentRoute = route;

      // Cek konten terakhir yang disimpan
      const lastContent = NexaNavigation.getLastContent();

      if (savedState) {
        const state = JSON.parse(savedState);
        const actualPage = route?.parentPage || currentPath;

        // Jika ada konten terakhir, gunakan itu untuk main-content
        if (lastContent && lastContent.targetId === "main-content") {
          // Cek elemen main-content ada
          if (document.getElementById("main-content")) {
            await NexaNavigation.load(
              lastContent.url,
              lastContent.targetId,
              true,
              actualPage
            );
          }

          // Load konten lain jika ada dan elemennya tersedia
          for (const [targetId, url] of Object.entries(state.contents)) {
            if (
              targetId !== "main-content" &&
              document.getElementById(targetId)
            ) {
              await NexaNavigation.load(url, targetId, true, actualPage);
            }
          }
        } else {
          // Load semua konten yang elemennya tersedia
          for (const [targetId, url] of Object.entries(state.contents)) {
            if (document.getElementById(targetId)) {
              await NexaNavigation.load(url, targetId, true, actualPage);
            }
          }
        }
      } else if (route) {
        // Load default content jika tidak ada state yang tersimpan
        if (lastContent && lastContent.targetId === "main-content") {
          // Load konten terakhir untuk main-content jika elemennya ada
          if (document.getElementById("main-content")) {
            await NexaNavigation.load(
              lastContent.url,
              lastContent.targetId,
              true
            );
          }

          // Load default content untuk target lain yang elemennya tersedia
          for (const content of route.defaultContent) {
            if (
              content.targetId !== "main-content" &&
              document.getElementById(content.targetId)
            ) {
              await NexaNavigation.load(content.url, content.targetId, true);
            }
          }
        } else {
          await NexaNavigation.loadDefaultContent(route);
        }
      }

      // Trigger event
      window.dispatchEvent(
        new CustomEvent("nexaPageInitialized", {
          detail: {
            route: route?.name || "default",
            layout: route?.layout,
            currentPath,
            lastContent,
          },
        })
      );
    } catch (error) {
      console.error("Page initialization failed:", error);
      throw error;
    }
  },

  // Save current state
  saveCurrentState: (originalUrl = null) => {
    if (NexaNavigation._lastNavigation) {
      const state = {
        contents: {},
        timestamp: Date.now(),
        originalUrl: originalUrl || NexaNavigation._currentPage,
      };

      document.querySelectorAll("[data-nexa-loaded]").forEach((element) => {
        state.contents[element.id] = element.getAttribute("data-nexa-loaded");
      });

      localStorage.setItem(
        `navigationState_${originalUrl || NexaNavigation._currentPage}`,
        JSON.stringify(state)
      );
    }
  },

  // Tambahkan fungsi helper untuk memproses konten HTML
  processHTML: (html) => {
    const temp = document.createElement("div");
    temp.innerHTML = html;

    // Proses semua script module terlebih dahulu
    const moduleScripts = Array.from(
      temp.getElementsByTagName("script")
    ).filter((script) => script.type === "module");

    // Pindahkan script module ke body
    moduleScripts.forEach((script) => {
      const newScript = document.createElement("script");
      Array.from(script.attributes).forEach((attr) => {
        newScript.setAttribute(attr.name, attr.value);
      });
      if (script.textContent) {
        newScript.textContent = script.textContent;
      }
      document.body.appendChild(newScript);
      script.remove();
    });

    // Proses NexaKey data jika ada
    const nexaKeyScripts = Array.from(
      temp.getElementsByTagName("script")
    ).filter((script) => script.textContent.includes("nexaKey.Render"));

    nexaKeyScripts.forEach((script) => {
      try {
        // Extract NexaKey data dari script
        const match = script.textContent.match(/data:\s*({[\s\S]*?}),/);
        if (match) {
          const dataStr = match[1];
          const extractorMatch =
            script.textContent.match(/extractor:\s*"(\w+)"/);
          if (extractorMatch) {
            const data = JSON.parse(dataStr);
            const extractor = extractorMatch[1];
            NexaNavigation._nexaKeyData.set(extractor, data);
          }
        }
      } catch (error) {
        console.error("Error processing NexaKey data:", error);
      }
    });

    return temp;
  },

  // Load konten ke target element
  load: async (url, targetId, isRestore = false, originalUrl = null) => {
    try {
      //console.log(`Loading ${url} into ${targetId}`);
      const targetElement = document.getElementById(targetId);
      if (!targetElement) {
        throw new Error(
          `Target element dengan id '${targetId}' tidak ditemukan`
        );
      }

      // Tentukan halaman yang sebenarnya
      const route = NexaNavigation.detectRoute(url);
      const actualPage =
        route?.parentPage || originalUrl || NexaNavigation._currentPage;

      // Fetch konten
      const response = await fetch(`/api/navigate/${url}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const html = await response.text();

      // Parse HTML menggunakan DOMParser untuk mendapatkan dokumen lengkap
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");

      // Ekstrak style tags dari dokumen
      const styles = Array.from(doc.getElementsByTagName("style"));

      // Cari konten yang sesuai
      let content = null;
      const sourceElement = doc.querySelector(`#${targetId}`);

      if (sourceElement) {
        content = sourceElement.innerHTML;
      } else {
        const mainContent =
          doc.querySelector("main") ||
          doc.querySelector(".main-content") ||
          doc.querySelector("#main-content");
        if (mainContent) {
          content = mainContent.innerHTML;
        } else {
          content = doc.body.innerHTML || html;
        }
      }

      // Update konten
      targetElement.innerHTML = content;

      // Tambahkan style tags ke halaman jika ada
      if (styles.length > 0) {
        // Buat ID unik untuk style berdasarkan URL
        const styleId = `nexa-style-${url.replace(/[^a-zA-Z0-9]/g, "-")}`;

        // Hapus style lama dengan ID yang sama jika ada
        const existingStyle = document.getElementById(styleId);
        if (existingStyle) {
          existingStyle.remove();
        }

        // Gabungkan semua style menjadi satu elemen
        const combinedStyle = document.createElement("style");
        combinedStyle.id = styleId;
        combinedStyle.setAttribute("data-source", url);

        // Gabungkan konten dari semua style tags
        const styleContent = styles
          .map((style) => style.textContent)
          .join("\n");
        combinedStyle.textContent = styleContent;

        // Tambahkan style ke head
        document.head.appendChild(combinedStyle);
      }

      // Restore NexaKey data jika ada
      if (
        typeof NexaKey !== "undefined" &&
        NexaNavigation._nexaKeyData.size > 0
      ) {
        const nexaKey = new NexaKey();
        NexaNavigation._nexaKeyData.forEach((data, extractor) => {
          nexaKey.Render({
            data: data,
            extractor: extractor,
          });
        });
      }

      // Tangani semua script dari dokumen asli
      const scripts = Array.from(doc.getElementsByTagName("script"));
      // console.log("Total scripts found:", scripts.length);

      // Kelompokkan script berdasarkan tipe
      const moduleScripts = scripts.filter(
        (script) => script.type === "module"
      );
      // console.log("Found module scripts:", moduleScripts.length, moduleScripts);

      const regularScripts = scripts.filter(
        (script) => !script.type || script.type === "text/javascript"
      );

      // Eksekusi module scripts terlebih dahulu
      const executeModuleScripts = async () => {
        // console.log("Executing module scripts:", moduleScripts.length);

        for (const oldScript of moduleScripts) {
          //console.log("Processing module script:", oldScript.src || "inline");
          const newScript = document.createElement("script");

          // Copy semua atribut
          Array.from(oldScript.attributes).forEach((attr) => {
            newScript.setAttribute(attr.name, attr.value);
          });

          try {
            if (oldScript.src) {
              // console.log("Loading external module:", oldScript.src);
              // Tambahkan timestamp untuk menghindari cache
              const timestamp = new Date().getTime();
              const srcWithTimestamp = `${oldScript.src}?t=${timestamp}`;
              newScript.src = srcWithTimestamp;

              // Tambahkan script ke body dan tunggu sampai selesai dimuat
              await new Promise((resolve, reject) => {
                newScript.onload = () => {
                  console.log("Module loaded successfully:", srcWithTimestamp);
                  resolve();
                };
                newScript.onerror = (error) => {
                  console.error("Module load error:", error);
                  reject(error);
                };
                document.body.appendChild(newScript);
              });
            } else {
              // console.log("Processing inline module");
              // Untuk inline module, gunakan dynamic import
              const blob = new Blob([oldScript.textContent], {
                type: "text/javascript",
              });
              const blobURL = URL.createObjectURL(blob);

              try {
                await import(blobURL);
                console.log("Inline module executed successfully");
              } catch (error) {
                console.error("Inline module execution error:", error);
              } finally {
                URL.revokeObjectURL(blobURL);
              }
            }
          } catch (error) {
            console.error("Module execution error:", error);
          }
        }
      };

      // Eksekusi scripts secara berurutan
      try {
        await executeModuleScripts();

        // Eksekusi regular scripts
        regularScripts.forEach((oldScript) => {
          const newScript = document.createElement("script");
          Array.from(oldScript.attributes).forEach((attr) => {
            newScript.setAttribute(attr.name, attr.value);
          });
          newScript.textContent = oldScript.textContent;
          document.body.appendChild(newScript);
        });
      } catch (error) {
        console.error("Error executing scripts:", error);
      }

      // Mark element as loaded
      targetElement.setAttribute("data-nexa-loaded", url);

      // Simpan konten terakhir jika ini adalah main-content
      if (targetId === "main-content" && !isRestore) {
        NexaNavigation.saveLastContent(url, targetId);
      }

      // Update URL dan history state
      if (!isRestore) {
        const newState = {
          contents: {},
          originalUrl: actualPage,
          currentContent: url,
        };
        document.querySelectorAll("[data-nexa-loaded]").forEach((element) => {
          newState.contents[element.id] =
            element.getAttribute("data-nexa-loaded");
        });

        // Tetap di halaman user.html
        history.pushState(newState, "", actualPage);
      }

      // Save state
      NexaNavigation.saveCurrentState(actualPage);

      // Save NexaKey state
      if (targetId === "main-content") {
        const nexaKeyData = {};
        NexaNavigation._nexaKeyData.forEach((value, key) => {
          nexaKeyData[key] = value;
        });
        localStorage.setItem(
          "nexaNavigationKeyData",
          JSON.stringify(nexaKeyData)
        );
      }

      // Trigger event
      window.dispatchEvent(
        new CustomEvent("nexaContentLoaded", {
          detail: { targetId, url, actualPage },
        })
      );
    } catch (error) {
      console.error("Load content error:", error);
      window.dispatchEvent(
        new CustomEvent("nexaContentError", {
          detail: { error, targetId, url },
        })
      );
    }
  },

  // Navigasi sederhana
  go: (url) => {
    window.location.href = `/api/navigate/${url}`;
  },

  // Navigasi dengan POST data
  post: async (url, data) => {
    try {
      const response = await fetch("/api/navigate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url,
          ...data,
        }),
      });
      const html = await response.text();
      document.documentElement.innerHTML = html;
      history.pushState({}, "", url);
    } catch (error) {
      console.error("Navigation error:", error);
      window.location.href = url; // fallback
    }
  },

  // Navigasi dengan update konten tanpa refresh
  soft: async (url) => {
    try {
      const response = await fetch(`/api/navigate/${url}`);
      const html = await response.text();
      document.documentElement.innerHTML = html;
      history.pushState({}, "", url);
    } catch (error) {
      console.error("Navigation error:", error);
      window.location.href = url; // fallback
    }
  },

  // Restore last navigation
  restoreLastNavigation: async () => {
    if (NexaNavigation._lastNavigation) {
      const { url, targetId } = NexaNavigation._lastNavigation;
      await NexaNavigation.load(url, targetId);
    } else {
      console.warn("No previous navigation state to restore");
    }
  },

  // Tambahkan method untuk menyimpan last content
  saveLastContent: (url, targetId) => {
    try {
      localStorage.setItem(
        "lastContent",
        JSON.stringify({
          url,
          targetId,
          timestamp: Date.now(),
        })
      );
    } catch (error) {
      console.error("Failed to save last content:", error);
    }
  },

  // Tambahkan method untuk mendapatkan last content
  getLastContent: () => {
    try {
      const saved = localStorage.getItem("lastContent");
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      console.error("Failed to get last content:", error);
      return null;
    }
  },

  // Add method untuk mengelola NexaKey data
  setKeyData: (extractor, data) => {
    NexaNavigation._nexaKeyData.set(extractor, data);
    if (typeof NexaKey !== "undefined") {
      const nexaKey = new NexaKey();
      nexaKey.Render({ data, extractor });
    }
  },

  getKeyData: (extractor) => {
    return NexaNavigation._nexaKeyData.get(extractor);
  },

  clearKeyData: (extractor) => {
    if (extractor) {
      NexaNavigation._nexaKeyData.delete(extractor);
    } else {
      NexaNavigation._nexaKeyData.clear();
    }
    localStorage.removeItem("nexaNavigationKeyData");
  },
};

// Inisialisasi otomatis saat module dimuat
if (typeof window !== "undefined") {
  NexaNavigation.init();
}

// Export sebagai ES module
export default NexaNavigation;
