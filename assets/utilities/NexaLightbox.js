// lightbox
export class Lightbox {
  constructor() {
    // Cek apakah ada elemen dengan data-nx-lightbox sebelum inisialisasi
    if (document.querySelectorAll("[data-nx-lightbox]").length > 0) {
      this.init();
    }
  }

  init() {
    // Cek apakah overlay sudah ada sebelum membuatnya
    if (!document.querySelector(".nx-lightbox-overlay")) {
      this.createOverlay();
    }

    // Tambahkan event listener ke semua gambar dengan data-nx-lightbox
    document.querySelectorAll("[data-nx-lightbox]").forEach((img) => {
      img.addEventListener("click", (e) => this.open(e.target));
    });
  }

  createOverlay() {
    const overlay = document.createElement("div");
    overlay.className = "nx-lightbox-overlay";
    overlay.innerHTML = `
      <div class="nx-lightbox-content">
        <span class="nx-lightbox-close material-icons">close</span>
        <img src="" alt="Lightbox Image">
        <div class="nx-lightbox-caption"></div>
        <span class="nx-lightbox-nav nx-lightbox-prev material-icons">chevron_left</span>
        <span class="nx-lightbox-nav nx-lightbox-next material-icons">chevron_right</span>
      </div>
    `;

    document.body.appendChild(overlay);

    // Event listeners
    overlay
      .querySelector(".nx-lightbox-close")
      .addEventListener("click", () => this.close());
    overlay
      .querySelector(".nx-lightbox-prev")
      .addEventListener("click", () => this.navigate("prev"));
    overlay
      .querySelector(".nx-lightbox-next")
      .addEventListener("click", () => this.navigate("next"));
  }

  open(imgElement) {
    const overlay = document.querySelector(".nx-lightbox-overlay");
    const lightboxImg = overlay.querySelector("img");
    const caption = overlay.querySelector(".nx-lightbox-caption");

    this.currentImg = imgElement;
    this.gallery = document.querySelectorAll(
      `[data-nx-lightbox="${imgElement.dataset.nxLightbox}"]`
    );

    lightboxImg.src = imgElement.src;
    caption.textContent = imgElement.dataset.nxCaption || "";
    overlay.classList.add("active");
  }

  close() {
    document.querySelector(".nx-lightbox-overlay").classList.remove("active");
  }

  navigate(direction) {
    const currentIndex = Array.from(this.gallery).indexOf(this.currentImg);
    let newIndex;

    if (direction === "prev") {
      newIndex = currentIndex > 0 ? currentIndex - 1 : this.gallery.length - 1;
    } else {
      newIndex = currentIndex < this.gallery.length - 1 ? currentIndex + 1 : 0;
    }

    this.open(this.gallery[newIndex]);
  }
}