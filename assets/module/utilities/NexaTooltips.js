// Fungsi untuk menginisialisasi tooltips
export function Tooltips() {
  // Inisialisasi tooltip dengan HTML content
  const htmlTooltips = document.querySelectorAll(
    '[data-tooltip][data-html="true"]'
  );
  htmlTooltips.forEach((tooltip) => {
    const content = tooltip.getAttribute("data-tooltip");
    tooltip.setAttribute("data-tooltip", content);
  });

  // Event Tooltip Demo
  const tooltip = document.getElementById("eventTooltip");
  const toggleBtn = document.getElementById("toggleTooltip");

  if (tooltip && toggleBtn) {
    // Event untuk hover
    tooltip.addEventListener("mouseenter", function () {
      this.setAttribute("data-show", "true");
      console.log("Tooltip ditampilkan");
    });

    tooltip.addEventListener("mouseleave", function () {
      this.removeAttribute("data-show");
      console.log("Tooltip disembunyikan");
    });

    // Event untuk toggle manual
    toggleBtn.addEventListener("click", function () {
      const isVisible = tooltip.hasAttribute("data-show");
      if (isVisible) {
        tooltip.removeAttribute("data-show");
      } else {
        tooltip.setAttribute("data-show", "true");
      }
    });
  }
}
