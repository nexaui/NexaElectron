// Tambahkan JSDOM untuk simulasi DOM di Node.js
const { JSDOM } = require("jsdom");

module.exports = class NexaTextInput {
  /**
   * Transform TextInput element menjadi format HTML yang diinginkan
   * @param {string} content - Konten yang akan ditransformasi
   * @returns {string} Konten yang sudah ditransformasi
   */
  static transform(content) {
    // Pattern untuk mencocokkan elemen TextInput dengan atributnya
    const pattern = /<TextInput\s*([^>]*)(?:>(.*?)<\/TextInput>|\/?>)/gi;

    return content.replace(pattern, (match, attributes) => {
      // Parse atribut
      const attrs = this.parseAttributes(attributes);

      // Siapkan nilai default
      const {
        label = "",
        type = "text",
        placeholder = label,
        value = "",
        id = this.generateId(label),
        name = "",
        className = "",
        col = "",
        size = "",
        state = "",
        readonly = attributes.includes("readonly"),
        iconLeft = "",
        iconRight = "",
        iconClass = "",
        prefix = "",
        suffix = "",
        prefixIcon = "",
        suffixIcon = "",
        stack = attributes.includes("stack"),
        floating = attributes.includes("floating"),
        iconAction = "",
      } = attrs;

      // Sesuaikan class berdasarkan size
      const baseClass = size
        ? `form-nexa-control-${size}`
        : "form-nexa-control";
      let inputClass = `${baseClass}${className ? " " + className : ""}`;

      // Add state classes
      if (state === "valid") inputClass += " is-valid";
      if (state === "invalid") inputClass += " is-invalid";

      // Build HTML output
      let html = "";

      // Handle floating label
      if (floating) {
        html = `<div class="form-nexa-floating">`;

        if (iconLeft || iconRight) {
          html += `<div class="form-nexa-icon">`;

          if (iconLeft) {
            html += `<i class="${iconClass} ${iconLeft}"></i>`;
          }

          const inputAttrs = `type="${type}" class="${inputClass}" id="${id}"${
            name ? ` name="${name}"` : ""
          } autocomplete="${id}" placeholder="${placeholder}"${
            value ? ` value="${value}"` : ""
          }${readonly ? " readonly" : ""}`;

          html += `<input ${inputAttrs}>`;

          if (iconRight) {
            html += `<i class="${iconClass} ${iconRight}"${
              iconAction ? ` data-action="${iconAction}"` : ""
            }></i>`;
          }

          if (label) {
            html += `<label for="${id}">${label}</label>`;
          }

          html += `</div>`;
        } else {
          const inputAttrs = `type="${type}" class="${inputClass}" id="${id}"${
            name ? ` name="${name}"` : ""
          } autocomplete="${id}" placeholder="${placeholder}"${
            value ? ` value="${value}"` : ""
          }${readonly ? " readonly" : ""}`;

          html += `<input ${inputAttrs}>`;
          if (label) {
            html += `<label for="${id}">${label}</label>`;
          }
        }

        html += `</div>`;
      } else {
        // Non-floating label
        html = `<div class="form-nexa ${col}">`;

        if (label) {
          html += `<label for="${id}">${label}</label>`;
        }

        if (prefix || suffix || prefixIcon || suffixIcon) {
          let groupClass = "form-nexa-input-group";
          if (stack) groupClass += " form-nexa-input-group-stack";
          if (prefixIcon || suffixIcon)
            groupClass += " form-nexa-input-group-icon";

          html += `<div class="${groupClass}">`;

          // Add prefix
          if (prefix || prefixIcon) {
            html += `<span class="form-nexa-input-group-text">`;
            if (prefixIcon) {
              html += `<i class="${prefixIcon}"></i>`;
            }
            if (prefix) {
              html += prefix;
            }
            html += `</span>`;
          }

          const inputAttrs = `type="${type}" class="${inputClass}" id="${id}"${
            name ? ` name="${name}"` : ""
          } autocomplete="${id}" placeholder="${placeholder}"${
            value ? ` value="${value}"` : ""
          }${readonly ? " readonly" : ""}`;

          html += `<input ${inputAttrs}>`;

          // Add suffix
          if (suffix || suffixIcon) {
            html += `<span class="form-nexa-input-group-text">`;
            if (suffixIcon) {
              html += `<i class="${suffixIcon}"></i>`;
            }
            if (suffix) {
              html += suffix;
            }
            html += `</span>`;
          }

          html += `</div>`;
        } else if (iconLeft || iconRight) {
          html += `<div class="form-nexa-icon">`;

          if (iconLeft) {
            html += `<i class="${iconClass} ${iconLeft}"></i>`;
          }

          const inputAttrs = `type="${type}" class="${inputClass}" id="${id}"${
            name ? ` name="${name}"` : ""
          } autocomplete="${id}" placeholder="${placeholder}"${
            value ? ` value="${value}"` : ""
          }${readonly ? " readonly" : ""}`;

          html += `<input ${inputAttrs}>`;

          if (iconRight) {
            html += `<i class="${iconClass} ${iconRight}"${
              iconAction ? ` data-action="${iconAction}" id="iconLeft"` : ""
            }></i>`;
          }

          html += `</div>`;
        } else {
          const inputAttrs = `type="${type}" class="${inputClass}" id="${id}"${
            name ? ` name="${name}"` : ""
          } autocomplete="${id}" placeholder="${placeholder}"${
            value ? ` value="${value}"` : ""
          }${readonly ? " readonly" : ""}`;

          html += `<input ${inputAttrs}>`;
        }

        html += `</div>`;
      }

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

    return attrs;
  }

  /**
   * Generate ID dari label atau random string
   * @param {string} label - Label untuk generate ID
   * @returns {string} Generated ID
   */
  static generateId(label) {
    if (label) {
      return "input_" + label.toLowerCase().replace(/[^a-z0-9]/g, "_");
    }
    return "input_" + Math.random().toString(36).substr(2, 8);
  }

  /**
   * Initialize all TextInput elements in the document
   * @param {Document} doc - The document to initialize elements in
   */
  static initInDocument(doc) {
    console.log("Initializing TextInput elements");
    const elements = doc.querySelectorAll("TextInput");
    console.log("Found elements:", elements.length);

    elements.forEach((element) => {
      console.log("Processing element:", element.outerHTML);
      const transformed = this.transform(element.outerHTML);
      console.log("Transformed to:", transformed);
      element.parentNode.replaceChild(transformed, element);
    });
  }

  /**
   * Transform TextInput element into desired HTML format
   * @param {Object} attributes - The attributes for transformation
   * @returns {string} - The transformed HTML string
   */
  static transformServer(attributes) {
    const dom = new JSDOM("");
    const element = dom.window.document.createElement("TextInput");

    // Set attributes
    Object.entries(attributes).forEach(([key, value]) => {
      element.setAttribute(
        key,
        typeof value === "string" ? value : JSON.stringify(value)
      );
    });

    const transformed = this.transform(element.outerHTML);
    return transformed;
  }

  // Helper method untuk membuat input element
  static createInput(attrs, doc) {
    const input = doc.createElement("input");
    Object.entries(attrs).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== "") {
        input.setAttribute(key, val);
      }
    });
    return input;
  }
};
