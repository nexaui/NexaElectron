export class NexaPart {
  constructor(url) {
    this.url = url;
  }

  /**
   * Memparse URL menjadi slug dan part
   * @returns {Object} Object berisi slug dan part
   */
  segment() {
    // Gunakan HOST sebagai base
    const baseUrl = "//";

    // Validasi URL
    if (!this.url) {
      return {
        slug: {},
        part: {},
      };
    }

    // Parse URL dan ambil path
    let pathToUse = "";
    try {
      const parsedUrl = new URL(this.url, "");
      pathToUse = parsedUrl.pathname || "";
    } catch (e) {
      // Jika URL tidak valid, coba tangani sebagai path relatif
      pathToUse = this.url;
    }

    // Hapus baseUrl dari path jika ada
    pathToUse = pathToUse.replace(baseUrl, "");

    // Bersihkan path
    const parts = pathToUse
      .trim()
      .replace(/^\/|\/$/g, "")
      .split("/");

    // Inisialisasi object hasil
    const slugResult = {};
    const partResult = {};

    parts.forEach((value, index) => {
      // Untuk slug (original value)
      const slugKey = index === 0 ? "slug" : `slug${index}`;
      slugResult[slugKey] = value.trim();

      // Untuk part (sanitized value)
      const partKey = index === 0 ? "part" : `part${index}`;
      const sanitizedValue = value.replace(/-/g, " ");
      partResult[partKey] = this.htmlSpecialChars(sanitizedValue.trim());
    });

    return {
      slug: slugResult,
      part: partResult,
    };
  }

  /**
   * Implementasi sederhana dari fungsi htmlspecialchars PHP
   * @param {string} str - String yang akan di-escape
   * @returns {string} String yang sudah di-escape
   */
  htmlSpecialChars(str) {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
}


// Contoh penggunaan
// const nexaPart = new NexaPart('https://example.com/halaman-utama/artikel/teknologi');
// console.log(nexaPart.segment());
