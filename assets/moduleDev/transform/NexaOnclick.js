/**
 * HTML Transformer Utility
 * Transforms HTML content with custom events into JavaScript event handlers
 */

class NexaOnclick {
  constructor() {
    // List of supported custom events
    this.customEvents = [
      "onPress",
      "onModal",
      "onSubmit",
      "onRemove",
      "onUpdate",
      "onView",
      "onLogout",
    ];
  }

  /**
   * Process variables in the data object
   * @param {Object} data - The data object to process
   * @param {Function} getVar - Function to get variable value
   * @returns {Object} Processed data object
   */
  processVariables(data, getVar) {
    const processValue = (value) => {
      if (typeof value === "string") {
        const match = value.match(/^\{([^}]+)\}$/);
        if (match) {
          const varName = match[1].trim();
          const varValue = getVar(varName);
          return varValue !== undefined ? varValue : value;
        }
      }
      return value;
    };

    const processObject = (obj) => {
      if (Array.isArray(obj)) {
        return obj.map((item) => processObject(item));
      } else if (obj && typeof obj === "object") {
        const result = {};
        for (const [key, value] of Object.entries(obj)) {
          result[key] = processObject(value);
        }
        return result;
      }
      return processValue(obj);
    };

    return processObject(data);
  }

  /**
   * Transform HTML content with custom events
   * @param {string} content - HTML content to transform
   * @param {Function} getVar - Function to get variable value
   * @returns {string} Transformed HTML content
   */
  transform(content, getVar) {
    let transformedContent = content;

    this.customEvents.forEach((event) => {
      const regex = new RegExp(
        `<a([^>]*?)${event}=(["'])(.*?)\\2([^>]*?)>`,
        "gis"
      );

      transformedContent = transformedContent.replace(
        regex,
        (match, before, quote, jsonData, after) => {
          try {
            // Parse JSON data
            let decodedData = JSON.parse(jsonData);

            // Process variables in the data
            decodedData = this.processVariables(decodedData, getVar);

            // Re-encode the processed data dengan format yang benar
            const processedJsonData = JSON.stringify(decodedData)
              .replace(/"/g, "'") // Ganti double quotes dengan single quotes
              .replace(/^\{/, "({") // Tambah kurung di awal
              .replace(/\}$/, "})"); // Tambah kurung di akhir

            // Convert onEventName to eventName (e.g., onPress -> press)
            const eventName = event.slice(2).toLowerCase();

            // Format output yang benar
            return `<a${before} onclick="${eventName}${processedJsonData}" href="javascript:void(0)"${after}>`;
          } catch (error) {
            console.error(`Error processing ${event} event:`, error);
            return match;
          }
        }
      );
    });

    return transformedContent;
  }
}

// Example usage:
/*
const transformer = new NexaOnclick();

// Example variable getter function
const getVar = (varName) => {
    const variables = {
        'user.id': '123',
        'user.name': 'John Doe'
    };
    return variables[varName];
};

// Example HTML content
const htmlContent = `
    <a onPress='{"id": "{user.id}", "name": "{user.name}"}'>Click me</a>
    <a onModal='{"title": "Hello {user.name}"}'>Open Modal</a>
`;

const transformed = transformer.transform(htmlContent, getVar);
console.log(transformed);
*/

module.exports = NexaOnclick;
