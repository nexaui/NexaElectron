class NexaKey {
  constructor() {
    this.templates = {};
    this.dataStore = new Map();
    this.loadPersistedData();
  }

  // Method untuk menyimpan data ke localStorage
  persistData() {
    const data = {};
    this.dataStore.forEach((value, key) => {
      data[key] = value;
    });
    localStorage.setItem("nexaKeyData", JSON.stringify(data));
  }

  // Method untuk memuat data dari localStorage
  loadPersistedData() {
    try {
      const saved = localStorage.getItem("nexaKeyData");
      if (saved) {
        const data = JSON.parse(saved);
        Object.entries(data).forEach(([key, value]) => {
          this.dataStore.set(key, value);
        });
      }
    } catch (error) {
      console.error("Error loading persisted data:", error);
    }
  }

  registerData(key, data) {
    this.dataStore.set(key, data);
    this.persistData(); // Simpan ke localStorage setiap kali data diupdate
    this.renderAll();
  }

  Render(config) {
    const { data, extractor } = config;
    this.registerData(extractor, data);
  }

  renderAll() {
    // Ambil seluruh konten HTML dari body
    let bodyContent = document.body.innerHTML;

    // Proses semua data yang tersimpan
    this.dataStore.forEach((data, extractor) => {
      // Cek apakah ada template pattern {extractor.xxx}
      if (bodyContent.includes(`{${extractor}.`)) {
        // Replace template dengan data yang sesuai
        bodyContent = bodyContent.replace(
          new RegExp(`{${extractor}\\.(\\w+)}`, "g"),
          (match, key) => {
            return data[key] || match;
          }
        );
      }
    });

    // Update konten body
    document.body.innerHTML = bodyContent;
  }

  // Method untuk membersihkan data
  clear(extractor) {
    if (extractor) {
      this.dataStore.delete(extractor);
    } else {
      this.dataStore.clear();
    }
    this.persistData(); // Update localStorage setelah menghapus data
    this.renderAll();
  }
}

// Export untuk Node.js environment
if (typeof module !== "undefined" && module.exports) {
  module.exports = NexaKey;
}

// Export untuk browser environment
if (typeof window !== "undefined") {
  window.NexaKey = NexaKey;
}
