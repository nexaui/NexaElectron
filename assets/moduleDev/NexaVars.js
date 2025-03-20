import NexaFilter from "./NexaFilter.js";

export class NexaVars {
  constructor(options) {
    // Tambahkan unique identifier untuk instance
    this._instanceId = `nexavars_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    // Ubah default template selector untuk mencari semua template dengan data-extractor
    this._templateSelector = 'script[type="text/template"][data-extractor]';

    // Gunakan WeakMap untuk menyimpan data private
    this._storage = new WeakMap();
    this._storage.set(this, {
      nexadom: {}, // Simpan data berdasarkan extractor
    });

    this.filter = new NexaFilter();

    // Set data langsung dari options
    if (options && options.data) {
      // Cari semua template terlebih dahulu
      const templates = document.querySelectorAll(this._templateSelector);
      templates.forEach((template) => {
        const extractorKey = template.getAttribute("data-extractor");
        if (extractorKey) {
          // Inisialisasi data untuk setiap extractor yang ditemukan
          this.nexaVars(options.data, extractorKey);
        }
      });

      // Hanya inisialisasi template jika ada data
      this.initTemplates();
    }
  }

  /**
   * Menetapkan variabel berdasarkan keyExtractor
   * @param {Object} vararray - Object berisi variabel yang akan diset
   * @param {string} keyExtractor - Namespace untuk variabel
   * @param {boolean} bAppend - Jika true, menambahkan ke nilai yang ada
   * @returns {boolean} - Selalu mengembalikan true setelah operasi selesai
   */
  nexaVars(vararray, keyExtractor, bAppend = false) {
    const storage = this._storage.get(this);

    if (!storage.nexadom[keyExtractor]) {
      storage.nexadom[keyExtractor] = {};
    }

    Object.entries(vararray).forEach(([key, val]) => {
      // Tidak perlu menambahkan instanceId ke key
      if (bAppend && storage.nexadom[keyExtractor][key]) {
        storage.nexadom[keyExtractor][key] += val;
        return;
      }
      storage.nexadom[keyExtractor][key] = val;
    });
    return true;
  }

  /**
   * Mengambil nilai variabel berdasarkan nama blok dan keyExtractor
   * @param {string} blockname - Nama blok yang akan diambil nilainya
   * @param {string} keyExtractor - Namespace untuk variabel
   * @returns {*} - Nilai variabel atau false jika tidak ditemukan
   */
  getBlock(blockname, keyExtractor) {
    const storage = this._storage.get(this);
    const namespace = storage.nexadom[keyExtractor];

    if (!namespace) return false;

    // Hapus prefix jika ada
    if (blockname.startsWith(keyExtractor + ".")) {
      blockname = blockname.substring(keyExtractor.length + 1);
    }

    return namespace[blockname] ?? false;
  }

  /**
   * Memproses string template dan mengganti variabel
   * @param {string} content - Content yang akan diproses
   * @param {string} keyExtractor - Namespace untuk variabel
   * @returns {string} - Content yang sudah diproses
   */
  processTemplate(content, keyExtractor) {
    // Perbaiki regex pattern untuk mengambil group dengan benar
    return content.replace(/{(?!list\.)([^}]+)}/g, (match, varName) => {
      if (!varName) return match;

      const parts = varName.trim().split("|");
      const name = parts[0];
      const filters = parts.slice(1);

      let value = this.getBlock(name, keyExtractor);
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
    // Cari semua template yang memiliki data-extractor
    const templates = document.querySelectorAll(this._templateSelector);

    templates.forEach((template) => {
      const extractorKey = template.getAttribute("data-extractor");
      if (!extractorKey) return;

      // Skip jika sudah diproses
      if (template.hasAttribute("data-nexavars")) {
        return;
      }

      // Cek apakah ada data untuk extractor ini
      const storage = this._storage.get(this);
      const hasData =
        storage.nexadom[extractorKey] &&
        Object.keys(storage.nexadom[extractorKey]).length > 0;

      if (!hasData) {
        console.log(`No data available for extractor: ${extractorKey}`);
        return;
      }

      // Mark template as processed
      template.setAttribute("data-nexavars", this._instanceId);
      const targetId = template.id;
      const content = template.innerHTML;

      // Proses template menggunakan extractor dari template
      const processedContent = this.processTemplate(content, extractorKey);

      // Buat target element jika ada hasil proses
      if (processedContent && processedContent !== content) {
        const targetElement = document.createElement("div");
        targetElement.id = `${targetId}-nexavars-target`;
        targetElement.setAttribute("data-nexavars-content", this._instanceId);

        // Masukkan hasil proses ke target element
        targetElement.innerHTML = processedContent;

        // Tambahkan ke DOM setelah template
        if (template.parentNode) {
          template.parentNode.insertBefore(targetElement, template.nextSibling);
        }

        // Debug output
        console.log("Template processed:", {
          extractorKey,
          originalContent: content,
          processedContent,
          data: this._storage.get(this).nexadom[extractorKey],
        });
      }
    });
  }

  /**
   * Method untuk memperbarui nilai variabel dan me-render ulang templates
   */
  update(data, keyExtractor = ".") {
    // Update data
    this.nexaVars(data, keyExtractor);

    // Re-render semua template yang terkait
    const templates = document.querySelectorAll(
      `script[type="text/template"][data-nexavars="${this._instanceId}"]`
    );

    templates.forEach((template) => {
      const targetId = template.id;
      const content = template.innerHTML;
      const processedContent = this.processTemplate(content, keyExtractor);

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

    // Cleanup templates and content elements
    document
      .querySelectorAll(
        `[data-nexavars="${this._instanceId}"], [data-nexavars-content="${this._instanceId}"]`
      )
      .forEach((el) => el.remove());
  }
}
