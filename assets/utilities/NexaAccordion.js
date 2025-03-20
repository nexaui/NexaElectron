/**
 * ==============================
 * Class: Accordion
 * ==============================
 */
export function Accordion() {
  const accordionHeaders = document.querySelectorAll(".nx-accordion-header");
  accordionHeaders.forEach((header) => {
    if (header.closest(".nx-accordion-item.disabled")) return;

    header.addEventListener("click", function () {
      const content = this.nextElementSibling;
      const parentAccordion = this.closest(".nx-accordion");
      const isMultiple = parentAccordion.classList.contains("multiple");
      const isActive = content.classList.contains("active");
      const isAnimated = parentAccordion.classList.contains("animated");

      // Handle multiple accordion
      if (!isMultiple) {
        // Tutup semua accordion content dalam grup yang sama
        parentAccordion
          .querySelectorAll(".nx-accordion-content")
          .forEach((item) => {
            if (item !== content) {
              item.classList.remove("active");
              if (isAnimated) {
                item.style.maxHeight = "0px";
              }
            }
          });

        // Reset semua icon dalam grup
        parentAccordion
          .querySelectorAll(
            ".nx-accordion-header .icon, .nx-accordion-header .custom-icon"
          )
          .forEach((icon) => {
            if (icon.closest(".nx-accordion-header") !== this) {
              icon.style.transform = "rotate(0deg)";
              icon.classList.remove("active");
            }
          });
      }

      // Toggle active class pada content yang diklik
      content.classList.toggle("active");

      // Handle animasi
      if (isAnimated) {
        if (content.classList.contains("active")) {
          content.style.maxHeight = content.scrollHeight + "px";
        } else {
          content.style.maxHeight = "0px";
        }
      }

      // Handle icon rotation
      const icon = this.querySelector(".icon, .custom-icon");
      if (icon) {
        if (content.classList.contains("active")) {
          icon.style.transform = "rotate(180deg)";
          icon.classList.add("active");
        } else {
          icon.style.transform = "rotate(0deg)";
          icon.classList.remove("active");
        }
      }

      // Handle nested accordion - recalculate parent height jika animated
      if (isAnimated) {
        const parentContent = this.closest(".nx-accordion-content");
        if (parentContent && parentContent.classList.contains("active")) {
          parentContent.style.maxHeight = parentContent.scrollHeight + "px";
        }
      }
    });
  });

  // Handle animated accordion pada load
  document
    .querySelectorAll(".nx-accordion.animated .nx-accordion-content")
    .forEach((content) => {
      if (content.classList.contains("active")) {
        content.style.maxHeight = content.scrollHeight + "px";
      } else {
        content.style.maxHeight = "0px";
      }
    });
}