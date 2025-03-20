module.exports = class NexaButton {
  /**
   * Transform Button element menjadi format HTML yang diinginkan
   * @param {string} content - Konten yang akan ditransformasi
   * @returns {string} Konten yang sudah ditransformasi
   */
  static transform(content) {
    // Tambahkan flag 'g' untuk global matching
    const pattern = /<Button\s+([^>]*)\/>/gi;

    // replace akan mengganti semua instance yang cocok
    return content.replace(pattern, (match, attributes) => {
      // Parse atribut
      const attrs = this.parseAttributes(attributes);

      // Ekstrak atribut-atribut yang diperlukan
      const {
        title = "",
        onPress = "",
        icon = "",
        spinner = false,
        right = false,
        color = "",
        modal = "",
        key = "",
        close = "",
        type = "button",
        class: buttonClass = "",
        id = "",
        disabled = attributes.includes("disabled"),
      } = attrs;

      // Build class
      let btnClass = buttonClass;
      if (icon && !spinner) btnClass += " icon-button";
      btnClass = btnClass.trim();

      // Build style untuk custom color
      let style = attrs.style || "";
      if (color) {
        style += `${style ? "; " : ""}--button-color: ${color}`;
      }

      // Build onClick handler
      let onClick = [];
      if (onPress) {
        try {
          const parsedOnPress = JSON.parse(onPress);
          onClick.push(`onPress(${JSON.stringify(parsedOnPress)})`);
        } catch {
          onClick.push(`onPress('${onPress}')`);
        }
      }
      if (modal) {
        onClick.push(`nxModal('${modal}'${key ? `, '${key}'` : ", null"})`);
      }
      if (close) {
        onClick.push(`nxMdClose('${close}')`);
      }

      // Build HTML output
      let html = "<button";
      html += ` type="${type}"`;
      if (id) html += ` id="${id}"`;
      if (btnClass) html += ` class="${btnClass}"`;
      if (style) html += ` style="${style}"`;
      if (disabled) html += " disabled";
      if (onClick.length) html += ` onClick="${onClick.join("; ")}"`;
      html += ">";

      // Add spinner atau icon dan title
      if (spinner) {
        html += '<span class="spinner"></span>';
        if (title) html += `<span>${title}</span>`;
      } else {
        if (icon && !right) html += `<i class="${icon}"></i>`;
        if (title) html += `<span>${title}</span>`;
        if (icon && right) html += `<i class="${icon}"></i>`;
      }

      html += "</button>";

      return html;
    });
  }

  /**
   * Parse string atribut menjadi object
   * @param {string} attributes - String atribut
   * @returns {Object} Object atribut
   */
  static parseAttributes(attributes) {
    const attrs = {};
    const pattern = /([a-zA-Z0-9_-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g;
    let match;

    while ((match = pattern.exec(attributes)) !== null) {
      const [, name, value1, value2] = match;
      attrs[name] = value1 || value2;
    }

    // Handle boolean attributes
    ["disabled", "right", "spinner"].forEach((attr) => {
      if (attributes.includes(attr)) attrs[attr] = true;
    });

    return attrs;
  }

  /**
   * Transform Button element untuk server-side
   * @param {Object} attributes - Atribut untuk transformasi
   * @returns {string} - HTML yang ditransformasi
   */
  static transformServer(attributes) {
    let element = `<Button`;

    // Add attributes
    Object.entries(attributes).forEach(([key, value]) => {
      element += ` ${key}="${value}"`;
    });

    element += "/>";

    return this.transform(element);
  }
};
