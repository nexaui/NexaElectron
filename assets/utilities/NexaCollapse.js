// Fungsi utama untuk menginisialisasi collapse
export function Collapse() {
  const collapseButtons = document.querySelectorAll(".nx-collapse-btn");

  collapseButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const target = document.querySelector(this.getAttribute("data-target"));
      if (target) {
        target.classList.toggle("show");
        // Trigger custom events
        const event = new CustomEvent(
          target.classList.contains("show")
            ? "show.nx-collapse"
            : "hide.nx-collapse"
        );
        target.dispatchEvent(event);
      }
    });
  });
}