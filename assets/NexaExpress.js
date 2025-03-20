const express = require("express");
const cors = require("cors");
const path = require("path");
const portfinder = require("portfinder");
const CONFIG = require("../config");
const fs = require("fs");
const fsPromises = require("fs").promises;
const { JSDOM } = require("jsdom");
const Nexautility = require("./module/transform/Nexautility");
const NexaTextInput = require("./module/transform/NexaTextInput");
const NexaButton = require("./module/transform/NexaButton");
const NexaextractorKey = require("./module/transform/NexaextractorKey");
const NexaModal = require("./module/transform/NexaModal");
const NexaOnclick = require("./module/transform/NexaOnclick");

// Tambahkan ini di bagian awal file atau sebelum menggunakan lastContent
if (typeof window !== "undefined") {
  window.lastContent = localStorage.getItem("lastContent");

  window.updateLastContent = (content) => {
    window.lastContent = content;
    localStorage.setItem("lastContent", content);
  };
}

class NexaExpress {
  constructor(basePath) {
    this.basePath = basePath;
    this.app = express();
    this.serverInstance = null;
    this.port = null;

    // Pastikan folder assets ada
    const assetsPath = path.join(this.basePath, "assets");
    if (!fs.existsSync(assetsPath)) {
      fs.mkdirSync(assetsPath, { recursive: true });
    }

    // Buat default placeholder image jika belum ada
    const defaultPlaceholderPath = path.join(
      assetsPath,
      "default-placeholder.png"
    );
    if (!fs.existsSync(defaultPlaceholderPath)) {
      // Buat placeholder image sederhana menggunakan data URI
      const placeholderData = Buffer.from(
        "iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAYAAADDPmHLAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAADsQAAA7EB9YPtSQAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAEqSURBVHic7dy9DcIwGEbhY5eWmj0YgB2YgZ4ZGIGeGdiBARiAli0oKKKg+LGR7XtOeaV8ei0nkRsGAAAAAAAAAAAAAAAAgO/ZtW1/6Zzz0XtP3rJtW+89pZQcQjh576m1fLwXwIcIwBwBmCMAcwRgjgDMEYA5AjBHAOYIwBwBmCMAcwRgjgDMEYA5AjBHAOYIwBwBmCMAcwRgjgDMEYA5AjBHAOYIwBwBmCMAcwRgjgDMEYA5AjBHAOYIwBwBmCMAcwRgjgDMEYA5AgAAAAAAAAAAAAAAAIA36Q2jGB4wYEYAAAAASUVORK5CYII=",
        "base64"
      );
      fs.writeFileSync(defaultPlaceholderPath, placeholderData);
    }

    this.setupMiddleware();
    this.setupRoutes();
  }

  setupMiddleware() {
    // CORS configuration
    this.app.use(
      cors({
        origin: "*",
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowedHeaders: [
          "Content-Type",
          "Authorization",
          "API-Key",
          "API-Secret",
        ],
        credentials: true,
      })
    );

    // Handle preflight requests
    this.app.options("*", cors());

    // Parse JSON middleware
    this.app.use(
      express.json({
        verify: (req, res, buf) => {
          req.rawBody = buf.toString();
        },
      })
    );

    // Function to add type="module" to script tags
    const addModuleTypeToScripts = (content) => {
      return content.replace(
        /<script(?![^>]*type="module")(?![^>]*type="text\/javascript")(?![^>]*type="application\/javascript")([^>]*)>/g,
        '<script type="module"$1>'
      );
    };

    // HTML Processing Middleware
    this.app.use(async (req, res, next) => {
      if (
        !req.path.endsWith(".html") &&
        !req.path.endsWith("/") &&
        req.path.includes(".")
      ) {
        return next();
      }
      // Process path segments
      let htmlPath = req.path;
      if (htmlPath.includes("/page/")) {
        htmlPath = htmlPath.split("/page/")[0];
        console.log(`Detected /page/ segment - Processing only: ${htmlPath}`);
      } else if (htmlPath.includes("/list/")) {
        htmlPath = htmlPath.split("/list/")[0];
        console.log(`Detected /list/ segment - Processing only: ${htmlPath}`);
      } else if (htmlPath.includes("/n/")) {
        htmlPath = htmlPath.split("/n/")[0];
        console.log(`Detected /n/ segment - Processing only: ${htmlPath}`);
      }

      try {
        if (req.path.endsWith("/")) {
          htmlPath += "index.html";
        }
        if (!htmlPath.endsWith(".html")) {
          htmlPath += ".html";
        }

        const filePath = path.join(this.basePath, "public", htmlPath);
        const normalizedPath = path.normalize(filePath);

        try {
          await fsPromises.access(normalizedPath, fs.constants.F_OK);
        } catch (error) {
          return next();
        }

        const content = await fsPromises.readFile(normalizedPath, "utf8");
        let transformedContent = content;

        // Add type="module" to all script tags
        transformedContent = addModuleTypeToScripts(transformedContent);

        // Create a proper DOM structure for the content
        let dom;
        if (content.includes("</head>") && content.includes("</html>")) {
          // Content already has HTML structure, use it as base
          dom = new JSDOM(transformedContent);
        } else {
          // Create a new HTML structure and insert content into body
          dom = new JSDOM(`<!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body>${transformedContent}</body>
          </html>`);
        }

        const document = dom.window.document;
        const head = document.querySelector("head");

        // Load assets from nexaui.json instead of hardcoding them
        let requiredAssets = [];
        try {
          const nexauiConfigPath = path.join(this.basePath, "nexaui.json");
          const nexauiConfig = JSON.parse(
            fs.readFileSync(nexauiConfigPath, "utf8")
          );

          if (nexauiConfig.assets && Array.isArray(nexauiConfig.assets)) {
            requiredAssets = nexauiConfig.assets.map((asset) => {
              // Handle module scripts (format: "module|/path/to/script.js")
              if (asset.startsWith("module|")) {
                return {
                  type: "script",
                  attributes: { type: "module" },
                  src: asset.substring(7), // Remove "module|" prefix
                };
              }

              // Determine asset type based on file extension or URL
              if (asset.endsWith(".css")) {
                return {
                  type: "link",
                  rel: "stylesheet",
                  href: asset,
                };
              } else {
                // Default to script for .js files and other resources
                return {
                  type: "script",
                  src: asset,
                };
              }
            });
          }
        } catch (error) {
          console.error("Error loading nexaui.json:", error.message);
          // Fallback to default assets if nexaui.json can't be loaded
          requiredAssets = [
            { type: "script", src: "/assets/env-config.js" },
            { type: "script", src: "https://unpkg.com/feather-icons" },
            { type: "link", rel: "stylesheet", href: "/assets/nexaui.min.css" },
            {
              type: "script",
              attributes: { type: "module" },
              src: "/assets/nexaui.bundle.min.js",
            },
          ];
        }

        // Add assets to head if they don't already exist
        requiredAssets.forEach((asset) => {
          // Check if asset already exists to avoid duplicates
          let exists = false;
          if (asset.type === "script") {
            exists = Array.from(head.querySelectorAll("script")).some((el) =>
              el.src.includes(asset.src)
            );
          } else if (asset.type === "link") {
            exists = Array.from(head.querySelectorAll("link")).some((el) =>
              el.href.includes(asset.href)
            );
          }

          if (!exists) {
            const element = document.createElement(asset.type);

            // Add src attribute for scripts or href for links
            if (asset.src) element.src = asset.src;
            if (asset.href) element.href = asset.href;
            if (asset.rel) element.rel = asset.rel;

            // Add any additional attributes
            if (asset.attributes) {
              Object.entries(asset.attributes).forEach(([key, value]) => {
                element.setAttribute(key, value);
              });
            }

            // For stylesheet links
            if (asset.type === "link" && asset.href && !asset.rel) {
              element.rel = "stylesheet";
            }

            head.appendChild(element);
          }
        });

        // Get the updated HTML content
        transformedContent = dom.serialize();

        // Handle require tags
        const requireRegex = /<div\s+require="([^"]+)"[^>]*><\/div>/g;
        let match;
        while ((match = requireRegex.exec(transformedContent)) !== null) {
          const requiredPath = match[1];
          const fullPath = requiredPath.endsWith(".html")
            ? requiredPath
            : `${requiredPath}.html`;
          const requiredFilePath = path.join(this.basePath, "public", fullPath);

          try {
            const requiredContent = await fsPromises.readFile(
              requiredFilePath,
              "utf8"
            );
            transformedContent = transformedContent.replace(
              match[0],
              requiredContent
            );
          } catch (error) {
            transformedContent = transformedContent.replace(
              match[0],
              `<!-- Failed to load ${fullPath} -->`
            );
          }
        }

        // Transform content
        try {
          transformedContent = await Nexautility.transform(transformedContent);
          transformedContent = await NexaTextInput.transform(
            transformedContent
          );
          transformedContent = await NexaButton.transform(transformedContent);
          transformedContent = await NexaModal.transform(transformedContent);
          transformedContent = NexaextractorKey.processAll(transformedContent);
          transformedContent = new NexaOnclick().transform(transformedContent);

          res.send(transformedContent);
        } catch (transformError) {
          res.send(transformedContent);
        }
      } catch (error) {
        next(error);
      }
    });

    // Middleware untuk menangani placeholder sebelum static file serving
    this.app.use((req, res, next) => {
      const url = decodeURIComponent(req.url);
      if (url.includes("{") && url.includes("}")) {
        // Jika URL mengandung placeholder yang belum terganti
        const defaultPlaceholderPath = path.join(
          this.basePath,
          "assets",
          "default-placeholder.png"
        );
        if (fs.existsSync(defaultPlaceholderPath)) {
          res.status(200).sendFile(defaultPlaceholderPath);
        } else {
          res.status(404).send("Placeholder image not found");
        }
      } else {
        next();
      }
    });

    // Static file serving setelah middleware placeholder
    this.app.use(express.static(path.join(this.basePath, "public")));
    this.app.use("/assets", express.static(path.join(this.basePath, "assets")));
    this.app.use(
      "/package",
      express.static(path.join(this.basePath, "package"))
    );
    this.app.use(
      "/assets/css",
      express.static(path.join(this.basePath, "assets", "css"))
    );

    // Error handler
    this.app.use((err, req, res, next) => {
      res.status(500).json({ error: err.message });
    });

    process.env.SUPPRESS_LOGS = "true";
  }

  setupRoutes() {
    // Create and serve env-config.js
    const envConfigPath = path.join(this.basePath, "assets", "env-config.js");
    const envConfigContent = `
    window.ENV_CONFIG = {
      SERVER_HOST: "${CONFIG.SERVER_HOST}",
      SERVER_API: "${CONFIG.SERVER_API}",
      WS_HOST: "${CONFIG.WS_HOST}"
    };
    `;

    if (
      !fs.existsSync(envConfigPath) ||
      fs.readFileSync(envConfigPath, "utf8") !== envConfigContent
    ) {
      fs.writeFileSync(envConfigPath, envConfigContent);
    }

    // Serve env-config.js
    this.app.get("/assets/env-config.js", (req, res) => {
      res.setHeader("Content-Type", "application/javascript");
      res.sendFile(envConfigPath);
    });

    // API Endpoints
    this.app.post("/api/transform", (req, res) => {
      try {
        const { content } = req.body;
        if (!content) {
          return res.status(400).json({ error: "Content is required" });
        }
        const transformed = Nexautility.transform(content);
        res.json({ result: transformed });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    this.app.get("/api/utilities", (req, res) => {
      res.json({
        utilities: Nexautility.utilities,
        customColors: Nexautility.customColors,
      });
    });

    this.app.post("/api/textinput/transform", (req, res) => {
      try {
        const { attributes } = req.body;
        if (!attributes || !Array.isArray(attributes)) {
          return res.status(400).json({ error: "Invalid attributes format" });
        }
        const results = attributes.map((item) => {
          return NexaTextInput.transformServer(item.attributes);
        });
        res.json({ results });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    this.app.post("/api/button/transform", (req, res) => {
      try {
        const { attributes } = req.body;
        if (!attributes || !Array.isArray(attributes)) {
          return res.status(400).json({ error: "Invalid attributes format" });
        }
        const results = attributes.map((item) => {
          return NexaButton.transformServer(item.attributes);
        });
        res.json({ results });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    this.app.post("/api/modal/transform", (req, res) => {
      try {
        const { attributes } = req.body;
        if (!attributes || !Array.isArray(attributes)) {
          return res.status(400).json({ error: "Invalid attributes format" });
        }
        const results = attributes.map((item) => {
          return NexaModal.transformServer(item.attributes);
        });
        res.json({ results });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // Navigation endpoints
    this.app.get("/api/navigate/:url(*)", async (req, res) => {
      try {
        const targetUrl = req.params.url;

        if (!targetUrl) {
          return res.status(400).json({ error: "URL is required" });
        }

        // Deteksi pola untuk path segments dengan regex
        // Regex ini akan mencocokkan URL yang mengandung /page/, /list/, atau /n/
        const regex = /^(.+?)(?:\/page\/|\/list\/|\/n\/).*$/;
        const match = targetUrl.match(regex);

        let processedUrl = targetUrl;
        if (match) {
          processedUrl = match[1]; // Ambil grup yang cocok
          console.log(`Regex matched! New targetUrl: ${processedUrl}`);
        } else {
          // Check each segment pattern
          const segments = ["/page/", "/list/", "/n/"];
          for (const segment of segments) {
            if (targetUrl.includes(segment)) {
              const original = targetUrl;
              processedUrl = targetUrl.split(segment)[0];
              console.log(
                `URL contains '${segment}' segment - changed from ${original} to: ${processedUrl}`
              );
              break;
            }
          }
        }

        let htmlPath = processedUrl;
        if (processedUrl.endsWith("/")) {
          htmlPath += "index.html";
        }
        if (!htmlPath.endsWith(".html")) {
          htmlPath += ".html";
        }

        const filePath = path.join(this.basePath, "public", htmlPath);

        try {
          await fsPromises.access(filePath, fs.constants.F_OK);
        } catch (error) {
          return res.status(404).json({
            error: "Page not found",
            requestedPath: filePath,
          });
        }

        let content = await fsPromises.readFile(filePath, "utf8");

        // Function to add type="module" to script tags
        const addModuleTypeToScripts = (content) => {
          return content.replace(
            /<script(?![^>]*type="module")(?![^>]*type="text\/javascript")(?![^>]*type="application\/javascript")([^>]*)>/g,
            '<script type="module"$1>'
          );
        };

        try {
          // Add type="module" to all script tags
          content = addModuleTypeToScripts(content);

          // Tambahkan proses require tag
          const requireRegex = /<div\s+require="([^"]+)"[^>]*><\/div>/g;
          let match;
          while ((match = requireRegex.exec(content)) !== null) {
            const requiredPath = match[1];
            const fullPath = requiredPath.endsWith(".html")
              ? requiredPath
              : `${requiredPath}.html`;
            const requiredFilePath = path.join(
              this.basePath,
              "public",
              fullPath
            );

            try {
              const requiredContent = await fsPromises.readFile(
                requiredFilePath,
                "utf8"
              );
              content = content.replace(match[0], requiredContent);
            } catch (error) {
              content = content.replace(
                match[0],
                `<!-- Failed to load ${fullPath} -->`
              );
            }
          }

          // Lanjutkan dengan transformasi komponen
          content = await Nexautility.transform(content);
          content = await NexaTextInput.transform(content);
          content = await NexaButton.transform(content);
          content = await NexaModal.transform(content);
          content = NexaextractorKey.processAll(content);
          content = new NexaOnclick().transform(content);

          res.send(content);
        } catch (transformError) {
          res.send(content); // Send untransformed content if transform fails
        }
      } catch (error) {
        res.status(500).json({
          error: "Navigation failed",
          details: error.message,
        });
      }
    });

    // Navigation endpoints - tambahkan endpoint POST
    this.app.post("/api/navigate/:url(*)", async (req, res) => {
      try {
        const targetUrl = req.params.url;
        const { targetId, isRestore, originalUrl, attributes } = req.body;

        if (!targetUrl) {
          return res.status(400).json({ error: "URL is required" });
        }

        // Deteksi pola untuk path segments dengan regex
        // Regex ini akan mencocokkan URL yang mengandung /page/, /list/, atau /n/
        const regex = /^(.+?)(?:\/page\/|\/list\/|\/n\/).*$/;
        const match = targetUrl.match(regex);

        let processedUrl = targetUrl;
        if (match) {
          processedUrl = match[1]; // Ambil grup yang cocok
          console.log(`Regex matched! New targetUrl: ${processedUrl}`);
        } else {
          // Check each segment pattern
          const segments = ["/page/", "/list/", "/n/"];
          for (const segment of segments) {
            if (targetUrl.includes(segment)) {
              const original = targetUrl;
              processedUrl = targetUrl.split(segment)[0];
              console.log(
                `URL contains '${segment}' segment - changed from ${original} to: ${processedUrl}`
              );
              break;
            }
          }
        }

        let htmlPath = processedUrl;
        if (processedUrl.endsWith("/")) {
          htmlPath += "index.html";
        }
        if (!htmlPath.endsWith(".html")) {
          htmlPath += ".html";
        }

        const filePath = path.join(this.basePath, "public", htmlPath);

        try {
          await fsPromises.access(filePath, fs.constants.F_OK);
        } catch (error) {
          return res.status(404).json({
            error: "Page not found",
            requestedPath: filePath,
          });
        }

        let content = await fsPromises.readFile(filePath, "utf8");

        // Function to add type="module" to script tags
        const addModuleTypeToScripts = (content) => {
          return content.replace(
            /<script(?![^>]*type="module")(?![^>]*type="text\/javascript")(?![^>]*type="application\/javascript")([^>]*)>/g,
            '<script type="module"$1>'
          );
        };

        try {
          // Add type="module" to all script tags
          content = addModuleTypeToScripts(content);

          // Tambahkan proses require tag
          const requireRegex = /<div\s+require="([^"]+)"[^>]*><\/div>/g;
          let match;
          while ((match = requireRegex.exec(content)) !== null) {
            const requiredPath = match[1];
            const fullPath = requiredPath.endsWith(".html")
              ? requiredPath
              : `${requiredPath}.html`;
            const requiredFilePath = path.join(
              this.basePath,
              "public",
              fullPath
            );

            try {
              const requiredContent = await fsPromises.readFile(
                requiredFilePath,
                "utf8"
              );
              content = content.replace(match[0], requiredContent);
            } catch (error) {
              content = content.replace(
                match[0],
                `<!-- Failed to load ${fullPath} -->`
              );
            }
          }

          // Lanjutkan dengan transformasi komponen
          content = await Nexautility.transform(content);
          content = await NexaTextInput.transform(content);
          content = await NexaButton.transform(content);
          content = await NexaModal.transform(content);
          content = NexaextractorKey.processAll(content);
          content = new NexaOnclick().transform(content);

          // Kirim response HTML langsung, bukan JSON
          res.setHeader("Content-Type", "text/html");
          res.send(content);
        } catch (transformError) {
          // Tetap kirim HTML jika transform gagal
          res.setHeader("Content-Type", "text/html");
          res.send(content);
        }
      } catch (error) {
        res.status(500).json({
          error: error.message,
          url: req.params.url,
        });
      }
    });

    // 404 handler
    this.app.use((req, res) => {
      const notFoundPath = path.join(this.basePath, "public", "404.html");
      if (fs.existsSync(notFoundPath)) {
        res.status(404).sendFile(notFoundPath);
      } else {
        res.status(404).send("Page not found");
      }
    });

    process.env.SUPPRESS_LOGS = "true";
  }

  async start() {
    try {
      // Ensure required directories exist
      const publicDir = path.join(this.basePath, "public");
      const assetsDir = path.join(this.basePath, "assets");
      const cssDir = path.join(assetsDir, "css");
      const packageDir = path.join(this.basePath, "package");

      [publicDir, assetsDir, cssDir, packageDir].forEach((dir) => {
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
      });

      // Configure portfinder
      portfinder.basePort = CONFIG.PORT || 3000;
      portfinder.highestPort = portfinder.basePort + 100;

      this.port = await portfinder.getPortPromise();

      this.serverInstance = this.app.listen(this.port, "0.0.0.0", () => {});

      this.serverInstance.on("error", (err) => {
        process.exit(1);
      });

      return this.port;
    } catch (err) {
      throw err;
    }
  }

  getPort() {
    return this.port;
  }

  stop() {
    if (this.serverInstance) {
      this.serverInstance.close();
    }
  }
}

module.exports = NexaExpress;
