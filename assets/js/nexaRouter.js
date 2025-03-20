class NexaRouter {
  constructor() {
    this.routes = new Map();

    // Simpan current path ke sessionStorage saat refresh
    window.addEventListener("beforeunload", () => {
      sessionStorage.setItem("lastPath", window.location.pathname);
    });

    // Cek dan restore path setelah refresh
    const lastPath = sessionStorage.getItem("lastPath");
    if (lastPath && lastPath !== "/") {
      this.navigate(lastPath);
      sessionStorage.removeItem("lastPath");
    }

    // Handle browser back/forward buttons
    window.addEventListener("popstate", (e) => {
      this.handleRoute(window.location.pathname);
    });
  }

  // Menambahkan route
  add(path, callback) {
    this.routes.set(path, callback);
  }

  // Navigasi programatik
  navigate(path) {
    // Update history dan URL
    window.history.pushState({}, "", path);
    // Jalankan handler untuk route tersebut
    this.handleRoute(path);
  }

  // Handle perubahan route
  handleRoute(path) {
    const callback = this.routes.get(path);
    if (callback) {
      callback();
    }
  }

  // Inisialisasi router
  init() {
    // Handle link clicks
    document.addEventListener("click", (e) => {
      if (e.target.matches('a[href^="/"]')) {
        e.preventDefault();
        const path = e.target.getAttribute("href");
        this.navigate(path);
      }
    });

    // Handle initial route
    this.handleRoute(window.location.pathname);
  }
}

// Buat instance global
window.nexaRouter = new NexaRouter();

// Ekspos ke window object agar bisa diakses dari mana saja
window.setPage = (path) => window.nexaRouter.navigate(path);

// Inisialisasi router saat DOM ready
document.addEventListener("DOMContentLoaded", () => {
  window.nexaRouter.init();
});

// Contoh penggunaan:

// Mendaftarkan route
// nexaRouter.add('/', () => {
//     console.log('Halaman Home');
//     // Logic untuk memuat konten halaman home
// });

// nexaRouter.add('/about', () => {
//     console.log('Halaman About');
//     // Logic untuk memuat konten halaman about
// });

// // Inisialisasi router
// nexaRouter.init();

// // Navigasi programatik
// function pindahKeAbout() {
//     nexaRouter.navigate('/about');
// }

// // Bisa dipanggil dari event handler atau fungsi lainnya
// document.getElementById('toAbout').onclick = () => {
//     nexaRouter.navigate('/about');
// };
