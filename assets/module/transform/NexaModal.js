class NexaModal {
  static transform(content) {
    try {
      // Mencari semua tag modal dalam konten
      const modalRegex = /<Modal([^>]*)>([\s\S]*?)<\/Modal>/g;

      let transformedContent = content.replace(
        modalRegex,
        (match, attributes, innerContent) => {
          // Parse atribut
          const id = (attributes.match(/id="([^"]*)"/) || [])[1] || "";
          const title = (attributes.match(/title="([^"]*)"/) || [])[1] || "";

          // Parse footer content menggunakan regex
          const footerMatch = innerContent.match(
            /<footer[^>]*>([\s\S]*?)<\/footer>/i
          );
          const footerContent = footerMatch ? footerMatch[1] : "";

          // Hapus footer dari innerContent jika ada
          const mainContent = footerMatch
            ? innerContent.replace(footerMatch[0], "").trim()
            : innerContent;

          // Membuat HTML untuk modal
          return `
            <div id="${id}" class="nx-modal" role="dialog" aria-labelledby="${id}-title">
              <div class="nx-modal-content">
                <div class="nx-modal-header">
                  <h5 id="${id}-title">${title}</h5>
                  <button class="nx-close" onclick="nxMdClose('${id}')" aria-label="Tutup modal">
                    <span>×</span>
                  </button>
                </div>
                <div class="nx-modal-body">
                  ${mainContent}
                </div>
                ${
                  footerContent
                    ? `
                <div class="nx-modal-footer">
                  ${footerContent}
                </div>
                `
                    : ""
                }
              </div>
            </div>
            
          `;
        }
      );

      return transformedContent;
    } catch (error) {
      console.error("Error transforming modal:", error);
      return content;
    }
  }
}

module.exports = NexaModal;
