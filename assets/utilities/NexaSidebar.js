// SidebarMenu
export class SidebarMenu {
  constructor(selector = ".section-header-grid") {
    this.sectionHeaders = document.querySelectorAll(selector);
    this.init();
  }

  init() {
    // Load saved state
    this.loadSavedState();

    // Add click listeners
    this.sectionHeaders.forEach((button) => {
      button.addEventListener("click", () => this.toggleSection(button));
    });
  }

  toggleSection(button) {
    const isExpanded = button.getAttribute("aria-expanded") === "true";

    // Jika section sudah terbuka, tutup saja
    if (isExpanded) {
      this.closeSection(button);
      localStorage.removeItem("lastOpenSection");
      return;
    }

    // Tutup semua section terlebih dahulu
    this.closeAllSections();

    // Buka section yang diklik
    this.openSection(button);

    // Simpan ID section yang terakhir dibuka
    const sectionId = button.querySelector("span").textContent;
    localStorage.setItem("lastOpenSection", sectionId);
  }

  closeSection(button) {
    button.setAttribute("aria-expanded", "false");
    button.nextElementSibling.classList.add("collapsed");
  }

  openSection(button) {
    button.setAttribute("aria-expanded", "true");
    button.nextElementSibling.classList.remove("collapsed");
  }

  closeAllSections() {
    this.sectionHeaders.forEach((header) => this.closeSection(header));
  }

  loadSavedState() {
    const lastOpenSection = localStorage.getItem("lastOpenSection");
    if (lastOpenSection) {
      this.sectionHeaders.forEach((button) => {
        const sectionId = button.querySelector("span").textContent;
        if (sectionId === lastOpenSection) {
          this.openSection(button);
        }
      });
    }
  }
}