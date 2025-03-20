import NexaFilter from "./NexaFilter.js";

export class NexaVars {
  constructor(options) {
    // Tambahkan unique identifier untuk instance
    this._instanceId = `nexavars_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    this._templateSelector =
      options.templateSelector || '[data-template="static"]';

    // Gunakan WeakMap untuk menyimpan data private
    this._storage = new WeakMap();
    this._storage.set(this, {
      nexadom: {
        ".": {}, // Root level variables
      },
    });

    this.filter = new NexaFilter();

    // Set data langsung dari options
    if (options && options.data) {
      this.nexaVars(options.data);
    }

    // Inisialisasi templates setelah data diset
    this.initTemplates();
  }

  /**
   * Menetapkan variabel berdasarkan NexaVars
   * @param {Object} vararray - Object berisi variabel yang akan diset
   * @param {boolean} bAppend - Jika true, menambahkan ke nilai yang ada
   * @returns {boolean} - Selalu mengembalikan true setelah operasi selesai
   */
  nexaVars(vararray, bAppend = false) {
    const storage = this._storage.get(this);
    const elements = document.querySelectorAll("[NexaVars]");

    elements.forEach((element) => {
      const keyExtractor = element.getAttribute("NexaVars");

      if (!storage.nexadom[keyExtractor]) {
        storage.nexadom[keyExtractor] = {};
      }

      Object.entries(vararray).forEach(([key, val]) => {
        const targetKey = `${this._instanceId}_${key}`;
        if (bAppend && storage.nexadom[keyExtractor][targetKey]) {
          storage.nexadom[keyExtractor][targetKey] += val;
          return;
        }
        storage.nexadom[keyExtractor][targetKey] = val;
      });
    });

    return true;
  }

  /**
   * Mengambil nilai variabel berdasarkan nama blok dan NexaVars
   * @param {string} blockname - Nama blok yang akan diambil nilainya
   * @returns {*} - Nilai variabel atau false jika tidak ditemukan
   */
  getBlock(blockname) {
    const storage = this._storage.get(this);
    const elements = document.querySelectorAll("[NexaVars]");

    for (const element of elements) {
      const keyExtractor = element.getAttribute("NexaVars");

      if (blockname.startsWith(keyExtractor + ".")) {
        blockname = blockname.substring(keyExtractor.length + 1);
      }

      const targetKey = `${this._instanceId}_${blockname}`;
      const namespace = storage.nexadom[keyExtractor] || {};
      const value = namespace[targetKey];

      if (value !== undefined) {
        return value;
      }
    }

    return false;
  }

  /**
   * Memproses string template dan mengganti variabel
   * @param {string} content - Content yang akan diproses
   * @returns {string} - Content yang sudah diproses
   */
  processTemplate(content) {
    return content.replace(/{(?!list\.)([^}]+)}/g, (match, varName) => {
      if (!varName) return match;

      const parts = varName.trim().split("|");
      const name = parts[0];
      const filters = parts.slice(1);

      let value = this.getBlock(name);
      if (value === false) return match;

      filters.forEach((filterName) => {
        const [filterType, ...args] = filterName.split(":");
        value = this.filter.applyFilter(value, filterType, args);
      });

      return value;
    });
  }

  /**
   * Menginisialisasi dan memproses semua template
   */
  initTemplates() {
    // Cari template yang sesuai
    const templates = document.querySelectorAll('script[type="text/template"]');

    templates.forEach((template) => {
      // Skip template yang digunakan NexaDom
      if (template.hasAttribute("extractor")) return;

      template.setAttribute("data-nexavars", this._instanceId);
      const targetId = template.id;
      const content = template.innerHTML;

      // Log untuk debugging
      // console.log("Processing template:", {
      //   id: targetId,
      //   content: content,
      //   data: this._storage.get(this),
      // });

      const processedContent = this.processTemplate(content);

      // Buat atau dapatkan target element
      const targetElement =
        document.getElementById(`${targetId}-target`) ||
        (() => {
          const el = document.createElement("div");
          el.id = `${targetId}-target`;
          template.parentNode.insertBefore(el, template.nextSibling);
          return el;
        })();

      // Set content
      targetElement.innerHTML = processedContent;
    });
  }

  /**
   * Method untuk memperbarui nilai variabel dan me-render ulang templates
   */
  update(data) {
    // Update data
    this.nexaVars(data);

    // Re-render semua template yang terkait
    const templates = document.querySelectorAll(
      `script[type="text/template"][data-nexavars="${this._instanceId}"]`
    );

    templates.forEach((template) => {
      const targetId = template.id;
      const content = template.innerHTML;
      const processedContent = this.processTemplate(content);

      const targetElement = document.getElementById(`${targetId}-target`);
      if (targetElement) {
        targetElement.innerHTML = processedContent;
      }
    });
  }

  // Tambahkan method untuk cleanup
  destroy() {
    const storage = this._storage.get(this);
    if (storage) {
      storage.nexadom = null;
      this._storage.delete(this);
    }

    // Cleanup templates
    document
      .querySelectorAll(`[data-nexavars="${this._instanceId}"]`)
      .forEach((el) => el.remove());
  }
}
