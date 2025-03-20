function processExtractor(content) {
  // Pattern alternatif
  const pattern = /<div\s+(?=[^>]*data-template="list")([^>]*)>/gi;

  const result = content.replace(pattern, (match, attributes) => {
    return `<div ${attributes} style="display:none">`;
  });

  return result;
}

/**
 * Process content with NexaVars attribute
 * @param {string} content - HTML content to process
 * @returns {string} - Processed content
 */
function processNexaVars(content) {
  const pattern = /<div([^>]*?)NexaVars=(["'])(.*?)\2([^>]*?)>(.*?)<\/div>/is;

  return content.replace(
    pattern,
    (match, attrs1, quote, extractorValue, attrs2, innerContent) => {
      // Combine attributes before and after extractor
      const attributes = attrs1 + attrs2;

      // Remove extractor attribute from the attributes string
      const cleanAttributes = attributes.replace(/\s*NexaVars=(["']).*?\1/, "");

      // Build the script tag with all remaining attributes
      return `<script type="text/template" NexaVars="${extractorValue}"${cleanAttributes}>${innerContent}</script>`;
    }
  );
}

/**
 * Process content with NexaDom attribute
 * @param {string} content - HTML content to process
 * @returns {string} - Processed content
 */
function processNexaDom(content) {
  // Pattern untuk mencari div dengan atribut NexaDom
  const pattern = /<div([^>]*?)NexaDom([^>]*?)>/gi;

  const result = content.replace(pattern, (match, before, after) => {
    // Hapus atribut NexaDom dan tambahkan style="display:none"
    const cleanedBefore = before.replace(/\s*NexaDom\s*/, "");
    return `<div${cleanedBefore}${after} style="display:none">`;
  });

  return result;
}

/**
 * Process all transformations on the content
 * @param {string} content - HTML content to process
 * @returns {string} - Processed content
 */
function processAll(content) {
  let processedContent = content;

  // Apply NexaDom transformation
  processedContent = processNexaDom(processedContent);

  // Apply extractor transformation
  processedContent = processExtractor(processedContent);

  // Apply NexaVars transformation
  processedContent = processNexaVars(processedContent);

  return processedContent;
}

// Opsional: Kembalikan console di akhir jika diperlukan
// module.exports = hasil;
// console.log = originalConsole.log;
// console.error = originalConsole.error;

module.exports = {
  processExtractor,
  processNexaVars,
  processNexaDom,
  processAll,
};
