function processExtractorVar(content) {
  if (!content) {
    console.log("NexaDom: Content is empty");
    return content;
  }

  console.log("\n=== NexaDom Transform Start ===");
  console.log("Input:", content);

  try {
    // Pattern untuk menangkap div dengan extractorVar
    const pattern =
      /<div([^>]*?)extractorVar=["']([^"']+)["']([^>]*?)>([\s\S]*?)<\/div>/g;

    // Test pattern terlebih dahulu
    const test = pattern.test(content);
    console.log("Pattern match found:", test);

    // Reset lastIndex karena test() mengubahnya
    pattern.lastIndex = 0;

    // Cari matches
    const matches = content.match(pattern);
    console.log("Matches found:", matches);

    if (!matches) {
      console.log("No matches found, returning original content");
      return content;
    }

    // Lakukan transformasi
    const transformed = content.replace(
      pattern,
      (match, beforeAttr, extractorValue, afterAttr, innerContent) => {
        console.log("\nTransforming match:", {
          original: match,
          extractorValue,
          beforeAttr,
          afterAttr,
          innerContent,
        });

        // Combine atribut
        let attributes = (beforeAttr + " " + afterAttr).trim();

        // Hapus extractorVar dari atribut
        attributes = attributes.replace(/extractorVar=["'][^"']+["']/g, "");

        // Buat script template dan div untuk output
        return `
<script type="text/template" data-extractor="${extractorValue}"${attributes}>
${innerContent.trim()}
</script>
<div id="output-${extractorValue}"></div>`;
      }
    );

    console.log("\nFinal result:", transformed);
    console.log("=== NexaDom Transform End ===\n");

    return transformed;
  } catch (error) {
    console.error("NexaDom Error:", error);
    return content;
  }
}

// Export modul
module.exports = {
  processExtractorVar,
};
