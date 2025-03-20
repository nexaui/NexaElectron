export class Offcanvas {
  constructor() {
    this.init();
  }
  init() {
    // Event untuk membuka offcanvas
    document.querySelectorAll("[nx-offcanvas-target]").forEach((trigger) => {
      trigger.addEventListener("click", () => {
        const targetId = trigger.getAttribute("nx-offcanvas-target");
        this.show(targetId);
      });
    });

    // Event untuk menutup offcanvas
    document.querySelectorAll("[data-offcanvas-close]").forEach((closeBtn) => {
      closeBtn.addEventListener("click", (e) => {
        const offcanvas = closeBtn.closest(".nx-offcanvas");
        this.hide(offcanvas.id);
      });
    });

    // Event untuk menutup offcanvas ketika klik backdrop
    document.addEventListener("click", (e) => {
      if (e.target.classList.contains("nx-offcanvas-backdrop")) {
        const visibleOffcanvas = document.querySelector(".nx-offcanvas.show");
        if (visibleOffcanvas) {
          this.hide(visibleOffcanvas.id);
        }
      }
    });
  }

  show(offcanvasId) {
    const offcanvas = document.getElementById(offcanvasId);
    if (!offcanvas) return;

    // Buat backdrop
    const backdrop = document.createElement("div");
    backdrop.className = "nx-offcanvas-backdrop";
    document.body.appendChild(backdrop);

    // Tambahkan class show setelah backdrop ditambahkan ke DOM
    setTimeout(() => {
      backdrop.classList.add("show");
      offcanvas.classList.add("show");
    }, 10);

    // Nonaktifkan scroll pada body
    document.body.style.overflow = "hidden";
  }

  hide(offcanvasId) {
    const offcanvas = document.getElementById(offcanvasId);
    if (!offcanvas) return;

    const backdrop = document.querySelector(".nx-offcanvas-backdrop");

    // Hapus class show
    offcanvas.classList.remove("show");
    if (backdrop) {
      backdrop.classList.remove("show");
    }

    // Tunggu animasi selesai sebelum menghapus backdrop
    setTimeout(() => {
      if (backdrop) {
        backdrop.remove();
      }
      // Aktifkan kembali scroll pada body
      document.body.style.overflow = "";
    }, 300);
  }
}

