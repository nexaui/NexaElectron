module.exports = class Nexautility {
  /**
   * Daftar warna kustom
   * @type {Object}
   */
  static customColors = {
    primary: "#007bff",
    secondary: "#6c757d",
    success: "#28a745",
    danger: "#dc3545",
    warning: "#ffc107",
    info: "#17a2b8",
    light: "#f8f9fa",
    dark: "#343a40",
    white: "#ffffff",
    black: "#000000",
  };

  /**
   * Daftar utility classes dan properti CSS-nya
   * @type {Object}
   */
  static utilities = {
    tx: "text-align",
    position: "position",
    pos: "position",
    top: "top",
    bottom: "bottom",
    left: "left",
    right: "right",
    w: "width",
    h: "height",
    "min-w": "min-width",
    "min-h": "min-height",
    "max-w": "max-width",
    "max-h": "max-height",

    // Margin
    m: "margin",
    mt: "margin-top",
    mb: "margin-bottom",
    ml: "margin-left",
    mr: "margin-right",
    mx: "margin-left margin-right",
    my: "margin-top margin-bottom",

    // Padding
    p: "padding",
    pt: "padding-top",
    pb: "padding-bottom",
    pl: "padding-left",
    pr: "padding-right",
    px: "padding-left padding-right",
    py: "padding-top padding-bottom",

    // Font
    fs: "font-size",
    fw: "font-weight",
    lh: "line-height",

    // Border
    br: "border-radius",
    bw: "border-width",

    // Opacity & Z-index
    op: "opacity",
    z: "z-index",

    // Background & Text color
    bg: "background-color",
    text: "color",
  };

  /**
   * Mendapatkan unit default berdasarkan properti
   * @param {string} property - Properti CSS
   * @returns {string} Unit default
   */
  static getDefaultUnit(property) {
    const timeProperties = [
      "transition",
      "animation",
      "animation-duration",
      "transition-duration",
    ];
    const unitlessProperties = [
      "opacity",
      "z-index",
      "font-weight",
      "flex",
      "order",
      "scale",
    ];

    if (timeProperties.includes(property)) return "ms";
    if (unitlessProperties.includes(property)) return "";
    return "px";
  }

  /**
   * Parse class utility patterns dan konversi ke inline style
   * @param {string} content - Konten HTML yang akan diparsing
   * @returns {string} Hasil parsing
   */
  static transform(content) {
    // Pattern untuk mencocokkan class warna hex
    content = content.replace(
      /class=(["\'])(b?#[0-9a-f]{3,6})\1/gi,
      (match, quote, hexClass) => {
        const colorMatch = hexClass.match(/^(b?)#([0-9a-f]{3,6})$/i);
        if (colorMatch) {
          const isBackground = colorMatch[1] === "b";
          const hexColor = "#" + colorMatch[2];
          const property = isBackground ? "background-color" : "color";
          return `style="${property}:${hexColor}"`;
        }
        return match;
      }
    );

    // Pattern untuk mencocokkan seluruh tag HTML dengan atribut class
    const pattern = /<([a-zA-Z0-9]+)([^>]*?class=(["\'])(.*?)\3[^>]*?)>/gi;

    return content.replace(
      pattern,
      (match, tag, attributes, quote, classes) => {
        const classArray = classes.split(" ");
        const styles = {};
        const remainingClasses = [];

        // Proses setiap class
        classArray.forEach((className) => {
          let matched = false;

          // Cek untuk class warna hex
          const colorMatch = className.match(/^(b?)#([0-9a-f]{3,6})$/i);
          if (colorMatch) {
            const isBackground = colorMatch[1] === "b";
            const hexColor = "#" + colorMatch[2];
            const property = isBackground ? "background-color" : "color";
            styles[property] = hexColor;
            matched = true;
            return;
          }

          // Cek utility classes yang terdaftar
          for (const [prefix, properties] of Object.entries(
            Nexautility.utilities
          )) {
            const utilityMatch = new RegExp(
              `^${prefix}-([a-zA-Z0-9#\.]+)(?:-(.*?))?$`
            ).exec(className);
            if (utilityMatch) {
              let [, value, unit] = utilityMatch;

              if (properties === "text-align") {
                const alignValues = {
                  center: "center",
                  left: "left",
                  right: "right",
                };
                value = alignValues[value] || value;
              } else {
                unit = unit || Nexautility.getDefaultUnit(properties);
                if (!isNaN(value)) {
                  value += unit;
                }
              }

              properties.split(" ").forEach((prop) => {
                styles[prop] = value;
              });

              matched = true;
              return;
            }
          }

          if (!matched) {
            remainingClasses.push(className);
          }
        });

        // Build output tag
        let output = `<${tag}`;

        if (remainingClasses.length > 0) {
          output += ` class=${quote}${remainingClasses.join(" ")}${quote}`;
        }

        if (Object.keys(styles).length > 0) {
          const styleString = Object.entries(styles)
            .map(([prop, value]) => `${prop}:${value}`)
            .join(";");

          if (attributes.includes("style=")) {
            attributes = attributes.replace(
              /style=(["\'])(.*?)\1/,
              (match, q, existing) => `style="${existing}${styleString}"`
            );
            output += attributes;
          } else {
            output += ` style="${styleString}"${attributes}`;
          }
        } else {
          output += attributes;
        }

        output += ">";
        return output;
      }
    );
  }
};
