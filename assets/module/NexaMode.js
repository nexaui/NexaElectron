
export class NexaMode {
  constructor() {
    // Properties
    this.body = document.body;
    this.themeToggle = document.getElementById("themeToggle");
    // Periksa apakah themeToggle ada sebelum melanjutkan
    if (!this.themeToggle) {
      return;
    }

    this.themeIcon = this.themeToggle.querySelector("i");
    this.menuToggle = document.getElementById("menuToggle");
    this.sidebar = document.querySelector(".sidebar-grid");
    this.prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)");

    // Initialize hanya jika themeToggle ada
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.loadThemePreference();
  }

  setupEventListeners() {
    // Toggle theme event
    this.themeToggle.addEventListener("click", () => {
      this.body.classList.toggle("dark-mode-grid");
      this.updateThemeIcon();
      this.saveThemePreference();
    });

    // System theme change event
    this.prefersDarkScheme.addEventListener("change", (e) => {
      if (localStorage.getItem("darkMode") === null) {
        if (e.matches) {
          this.body.classList.add("dark-mode-grid");
        } else {
          this.body.classList.remove("dark-mode-grid");
        }
        this.updateThemeIcon();
      }
    });
  }

  updateThemeIcon() {
    // Icon akan otomatis berganti karena menggunakan CSS display
    // Tidak perlu mengubah class
  }

  saveThemePreference() {
    const isDarkMode = this.body.classList.contains("dark-mode-grid");
    onCookie("darkmode", isDarkMode || "");
    localStorage.setItem("darkMode", isDarkMode);
  }

  loadThemePreference() {
    const savedTheme = localStorage.getItem("darkMode");

    if (savedTheme !== null) {
      // Use saved preference
      if (savedTheme === "true") {
        this.body.classList.add("dark-mode-grid");
      }
    } else {
      // Use system preference
      if (this.prefersDarkScheme.matches) {
        this.body.classList.add("dark-mode-grid");
      }
    }

    this.updateThemeIcon();
  }
}
export function onCookie(name, value) {
  // Membuat cookie dengan waktu kedaluwarsa sesi
  document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(
    value
  )}; path=/`;
}