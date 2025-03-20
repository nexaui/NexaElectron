class NexaExtractor {
  static transform(document) {
    console.log("NexaExtractor: Starting transformation");
    console.log("Document HTML:", document.documentElement.outerHTML);
    
    const elements = document.querySelectorAll("[extractorVar]");
    console.log(`NexaExtractor: Found ${elements.length} elements to transform`);
    
    if (elements.length === 0) {
      console.log("NexaExtractor: No elements found with extractorVar attribute");
      return document;
    }
    
    elements.forEach((element) => {
      console.log("NexaExtractor: Processing element:", {
        id: element.id,
        extractorVar: element.getAttribute("extractorVar"),
        innerHTML: element.innerHTML
      });
      
      try {
        const scriptElement = document.createElement("script");
        scriptElement.setAttribute("type", "text/template");
        scriptElement.setAttribute(
          "data-extractor",
          element.getAttribute("extractorVar")
        );
        scriptElement.setAttribute("id", element.id);
        scriptElement.textContent = element.innerHTML;
        element.parentNode.replaceChild(scriptElement, element);
        console.log("NexaExtractor: Successfully transformed element");
      } catch (error) {
        console.error("NexaExtractor: Error transforming element:", error);
      }
    });
    
    return document;
  }
}

module.exports = NexaExtractor; 