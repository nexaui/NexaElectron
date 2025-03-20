// Color palette configuration
const colorPalette = [
  { code: "#fee4cb", name: "Peach" },
  { code: "#e9e7fd", name: "Lavender" },
  { code: "#ffd3e2", name: "Pink" },
  { code: "#c8f7dc", name: "Mint" },
  { code: "#d5deff", name: "Sky Blue" },
];

// Color Manager Class
export class NexaColor {
   constructor() {
    this.defaultColor = "#ffffff";
    this.defaultColorName = "White";
    this.sectionToColorListMap = {}; // Map to store relationship between section ID and color list ID
    this.init();
  }

  init() {
    // Make sure DOM is fully loaded before initializing
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () =>
        this.initAfterDOMLoaded()
      );
    } else {
      this.initAfterDOMLoaded();
    }
  }

  initAfterDOMLoaded() {
    // Detect target sections from color circles with data-target attribute
    this.detectTargetSections();
    // Set default white background for all sections
    this.setDefaultWhiteBackground();
    this.createColorCircles();
    // Load saved colors from localStorage or set defaults
    this.loadSavedColors();
  }

  // Detect target sections dynamically from color circles with data-target attribute
  detectTargetSections() {
    this.targetSections = [];
    const colorCircles = document.querySelectorAll(".circle[data-target]");

    colorCircles.forEach((circle) => {
      const targetId = circle.getAttribute("data-target");
      if (targetId && !this.targetSections.includes(targetId)) {
        this.targetSections.push(targetId);
        // Store the mapping between section ID and color list ID
        this.sectionToColorListMap[targetId] = circle.id;
      }
    });

    console.log("Detected target sections:", this.targetSections);
    console.log("Section to color list mapping:", this.sectionToColorListMap);
  }

  setDefaultWhiteBackground() {
    // Set default white background for each target section by ID
    this.targetSections.forEach((sectionId) => {
      const section = document.getElementById(sectionId);
      if (section) {
        section.style.backgroundColor = this.defaultColor;
        section.setAttribute("data-active-color", this.defaultColor);
      }
    });
  }

  createColorCircles() {
    const colorLists = document.querySelectorAll(".circle[data-target]");

    colorLists.forEach((list) => {
      const targetId = list.getAttribute("data-target");
      const infoId = list.id.replace("List", "Info");
      const infoElement = document.getElementById(infoId);

      // Add white color option first
      const whiteOption = document.createElement("li");
      whiteOption.style.backgroundColor = this.defaultColor;
      whiteOption.style.border = "1px solid #ccc"; // Add border to make white visible
      whiteOption.setAttribute("title", this.defaultColorName);
      whiteOption.setAttribute("data-color", this.defaultColor);
      whiteOption.setAttribute("data-name", this.defaultColorName);

      // Use addEventListener instead of inline onclick
      whiteOption.addEventListener("click", () => {
        this.changeColor(
          this.defaultColor,
          this.defaultColorName,
          whiteOption,
          targetId,
          document.getElementById(infoId)
        );
      });

      list.appendChild(whiteOption);

      // Add other colors
      colorPalette.forEach((color) => {
        const li = document.createElement("li");
        li.style.backgroundColor = color.code;
        li.setAttribute("title", color.name);
        li.setAttribute("data-color", color.code);
        li.setAttribute("data-name", color.name);

        // Use addEventListener instead of inline onclick
        li.addEventListener("click", () => {
          this.changeColor(
            color.code,
            color.name,
            li,
            targetId,
            document.getElementById(infoId)
          );
        });

        list.appendChild(li);
      });
    });
  }

  // Save color selection to localStorage
  saveColorToLocalStorage(sectionId, color, colorName) {
    localStorage.setItem(
      `color_${sectionId}`,
      JSON.stringify({
        color: color,
        name: colorName,
      })
    );
    console.log(`Saved color for ${sectionId}: ${colorName} (${color})`);
  }

  // Load saved colors from localStorage
  loadSavedColors() {
    setTimeout(() => {
      // Load saved colors for each target section
      this.targetSections.forEach((sectionId) => {
        const savedColorData = localStorage.getItem(`color_${sectionId}`);

        if (savedColorData) {
          // If we have saved color data, use it
          try {
            const { color, name } = JSON.parse(savedColorData);
            console.log(
              `Loading saved color for ${sectionId}: ${name} (${color})`
            );

            // Find the color circle with this color using our mapping
            const colorListId = this.sectionToColorListMap[sectionId];
            const colorList = document.getElementById(colorListId);

            if (colorList) {
              // Try to find the color circle with this color
              let foundColorElement = null;
              const colorCircles = colorList.querySelectorAll("li");

              colorCircles.forEach((circle) => {
                if (circle.getAttribute("data-color") === color) {
                  foundColorElement = circle;
                }
              });

              // If found, click it to apply the color
              if (foundColorElement) {
                foundColorElement.click();
                return;
              }
            }
          } catch (e) {
            console.error("Error parsing saved color data:", e);
          }
        }

        // If no saved color or error occurred, set default colors
        // Use our mapping to find the correct color list
        const colorListId = this.sectionToColorListMap[sectionId];
        if (colorListId) {
          const colorList = document.getElementById(colorListId);
          if (colorList && colorList.children.length > 0) {
            colorList.children[0].click();
          }
        }
      });
    }, 300); // Increased timeout to ensure DOM is fully ready
  }

  changeColor(color, colorName, element, targetSectionId, colorInfoElement) {
    // Get the parent list
    const parentList = element.parentNode;

    // Get all color circles in this list
    const colorCircles = parentList.querySelectorAll("li");

    // Remove active class from all circles in this list
    colorCircles.forEach((c) => c.classList.remove("active"));

    // Add active class to clicked circle
    element.classList.add("active");

    // Update the data-active-color attribute of the list
    parentList.setAttribute("data-active-color", color);

    // Update color info text
    if (colorInfoElement) {
      colorInfoElement.textContent = `Selected: ${colorName} (${color})`;
      colorInfoElement.style.color = this.getContrastColor(color);
      colorInfoElement.style.backgroundColor = color;
    }

    // Find the target section by ID
    const targetSection = document.getElementById(targetSectionId);

    // Add active-target class to the current target section
    targetSection.classList.add("active-target");

    // Apply the selected color to the background of the target section
    targetSection.style.backgroundColor = color;

    // Adjust text color for better contrast
    const textColor = this.getContrastColor(color);
    targetSection.style.color = textColor;

    // Add a data attribute to the target section to show which color is active
    targetSection.setAttribute("data-active-color", color);

    // Save the selected color to localStorage
    this.saveColorToLocalStorage(targetSectionId, color, colorName);

    console.log(`Changed ${targetSectionId} background to ${color}`);
  }

  setDefaultColors() {
    // Set default colors after a short delay to ensure DOM is ready
    setTimeout(() => {
      // Set white color for first section
      const firstList = document.getElementById("colorList1");
      if (firstList && firstList.children.length > 0) {
        // Select the white color (index 0)
        firstList.children[0].click();
      }

      // Set white color for second section
      const secondList = document.getElementById("colorList2");
      if (secondList && secondList.children.length > 0) {
        // Select the white color (index 0)
        secondList.children[0].click();
      }
    }, 100);
  }

  // Helper function to determine contrasting text color (black or white)
  getContrastColor(hexColor) {
    // Remove the # if present
    hexColor = hexColor.replace("#", "");

    // Convert to RGB
    const r = parseInt(hexColor.substr(0, 2), 16);
    const g = parseInt(hexColor.substr(2, 2), 16);
    const b = parseInt(hexColor.substr(4, 2), 16);

    // Calculate luminance - brighter colors have higher values
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

    // Return black for bright colors, white for dark colors
    return luminance > 0.5 ? "#000000" : "#ffffff";
  }
}