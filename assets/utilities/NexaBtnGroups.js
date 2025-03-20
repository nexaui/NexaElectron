/**
 * ==============================
 * Class: Button Groups
 * ==============================
 */
export function buttonGroups() {
  const dropToggles = document.querySelectorAll(".nx-dropdown-toggle");

  // Fungsi untuk menutup semua dropdown
  function closeAllDropdowns() {
    document.querySelectorAll(".nx-dropdown-menu").forEach((menu) => {
      menu.classList.remove("show");
    });
    document.querySelectorAll(".nx-dropdown-toggle").forEach((btn) => {
      btn.classList.remove("active");
    });
  }

  // Event listener untuk setiap tombol dropdown
  dropToggles.forEach((toggle) => {
    toggle.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();

      const dropdown = this.closest(".nx-dropdown");
      const menu = dropdown.querySelector(".nx-dropdown-menu");

      // Toggle active state
      const isActive = this.classList.contains("active");

      // Close all dropdowns first
      closeAllDropdowns();

      // If wasn't active, open this dropdown
      if (!isActive) {
        this.classList.add("active");
        menu.classList.add("show");

        // Adjust position if needed
        const rect = dropdown.getBoundingClientRect();
        const menuRect = menu.getBoundingClientRect();
        const viewportWidth = window.innerWidth;

        // Check if menu goes beyond right edge
        if (rect.left + menuRect.width > viewportWidth) {
          menu.style.left = "auto";
          menu.style.right = "0";
        } else {
          menu.style.left = "0";
          menu.style.right = "auto";
        }
      }
    });
  });

  // Tutup dropdown saat mengklik di luar
  document.addEventListener("click", function (e) {
    if (!e.target.closest(".nx-dropdown")) {
      closeAllDropdowns();
    }
  });

  // Tutup dropdown saat menekan tombol Escape
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      closeAllDropdowns();
    }
  });
}

// Export fungsi closeAllDropdowns jika diperlukan di file lain
export function closeAllDropdowns() {
  document.querySelectorAll(".nx-dropdown-menu").forEach((menu) => {
    menu.classList.remove("show");
  });
  document.querySelectorAll(".nx-dropdown-toggle").forEach((btn) => {
    btn.classList.remove("active");
  });
}