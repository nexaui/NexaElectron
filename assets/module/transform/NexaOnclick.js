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
   * Decode HTML entities to their corresponding characters
   * @param {string} html - String with HTML entities
   * @returns {string} Decoded string
   */
  decodeHtmlEntities(html) {
    const textarea = document.createElement("textarea");
    textarea.innerHTML = html;
    return textarea.value;
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

    // Simple HTML entity decoder function for server-side
    const decodeEntities = (str) => {
      return str
        .replace(/&quot;/g, '"')
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&#39;/g, "'")
        .replace(/&apos;/g, "'");
    };

    this.customEvents.forEach((event) => {
      const regex = new RegExp(
        `<a([^>]*?)${event}=(["'])(.*?)\\2([^>]*?)>`,
        "gis"
      );

      transformedContent = transformedContent.replace(
        regex,
        (match, before, quote, jsonData, after) => {
          try {
            // Decode HTML entities in the JSON data
            const decodedJsonData = decodeEntities(jsonData);

            // Parse JSON data
            let decodedData;

            // Try to parse the JSON with error handling
            try {
              decodedData = JSON.parse(decodedJsonData);
            } catch (parseError) {
              // If it fails, check if it might be an empty object or simple string
              if (
                decodedJsonData.trim() === "" ||
                decodedJsonData.trim() === "{}"
              ) {
                decodedData = {};
              } else if (
                !decodedJsonData.startsWith("{") &&
                !decodedJsonData.startsWith("[")
              ) {
                // If it's not trying to be JSON, treat it as a simple string value
                decodedData = { value: decodedJsonData };
              } else {
                // Log more details and re-throw
                console.error(`Failed to parse JSON: '${decodedJsonData}'`);
                throw parseError;
              }
            }

            // Process variables in the data
            if (typeof getVar === "function") {
              decodedData = this.processVariables(decodedData, getVar);
            }

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
            console.error(`Problematic content: ${jsonData}`);
            // Return the original match to avoid breaking the page
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
