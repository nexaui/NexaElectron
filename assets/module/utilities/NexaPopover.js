export class Popover {
  constructor() {
    this.popovers = document.querySelectorAll(".nx-popover");
    this.init();
  }

  init() {
    // Inisialisasi event listeners
    document.addEventListener("DOMContentLoaded", () =>
      this.initDynamicPopovers()
    );
    window.addEventListener("resize", () => this.initDynamicPopovers());
  }

  initDynamicPopovers() {
    this.popovers.forEach((popover) => {
      const content = popover.querySelector(".popover-content");
      const position = popover.getAttribute("data-position");

      popover.addEventListener("mouseenter", () => {
        // Reset style
        content.style.transform = "";
        content.style.top = "";
        content.style.bottom = "";
        content.style.left = "";
        content.style.right = "";

        // Dapatkan posisi dan ukuran
        const buttonRect = popover.getBoundingClientRect();
        const contentRect = content.getBoundingClientRect();

        // Atur posisi berdasarkan data-position
        switch (position) {
          case "top":
            content.style.bottom = "calc(100% + 10px)";
            content.style.left = "50%";
            content.style.transform = "translateX(-50%)";
            break;

          case "right":
            content.style.top = "50%";
            content.style.left = "calc(100% + 10px)";
            content.style.transform = "translateY(-50%)";
            break;

          case "bottom":
            content.style.top = "calc(100% + 10px)";
            content.style.left = "50%";
            content.style.transform = "translateX(-50%)";
            break;

          case "left":
            content.style.top = "50%";
            content.style.right = "calc(100% + 10px)";
            content.style.left = "auto";
            content.style.transform = "translateY(-50%)";
            break;
        }
      });
    });
  }
}