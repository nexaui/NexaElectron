export class NexaKey {
  constructor() {
    this.templates = {};
    this.dataStore = new Map(); // Untuk menyimpan multiple data
  }

  // Method untuk mendaftarkan data
  registerData(key, data) {
    this.dataStore.set(key, data);
  }

  // Method untuk merender template dengan data
  Render(config) {
    const { data, extractor } = config;
    this.registerData(extractor, config);

    // Cari elemen dengan data-nexakey
    const elements = document.querySelectorAll("[data-nexakey]");

    elements.forEach((element) => {
      let content = element.innerHTML;

      if (content.includes(`{${extractor}.`)) {
        const rendered = content.replace(
          new RegExp(`{${extractor}\\.(\\w+)}`, "g"),
          (match, key) => {
            return data[key] || match;
          }
        );
        element.innerHTML = rendered;
      }
    });

    // Cari elemen dengan atribut data-nexakey-value
    const valueElements = document.querySelectorAll("[data-nexakey-value]");
    valueElements.forEach((element) => {
      const templateKey = element.getAttribute("data-nexakey-value");
      if (templateKey.startsWith(`${extractor}.`)) {
        const key = templateKey.split(".")[1];
        if (data[key]) {
          if (element.tagName === "INPUT" || element.tagName === "TEXTAREA") {
            element.value = data[key];
          } else {
            element.textContent = data[key];
          }
        }
      }
    });
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
