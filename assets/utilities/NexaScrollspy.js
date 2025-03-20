// Scrollspy
export function Scrollspy() {
  const scrollSpyContainers = document.querySelectorAll(
    '[data-nx-spy="scroll"]'
  );

  scrollSpyContainers.forEach((container) => {
    const parentContainer = container.closest(".code-preview");
    if (!parentContainer) return;

    const navContainer = parentContainer.querySelector("[data-nx-nav]");
    if (!navContainer) return;

    const navButtons = navContainer.querySelectorAll("[data-nx-scroll-target]");
    const sections = container.querySelectorAll("[data-nx-section]");
    const offset = parseInt(container.getAttribute("data-nx-offset")) || 0;

    if (!navButtons.length || !sections.length) return;

    // Event listener untuk tombol navigasi
    navButtons.forEach((button) => {
      button.addEventListener("click", (e) => {
        e.preventDefault();
        const targetId = e.target.getAttribute("data-nx-scroll-target");
        const targetSection = container.querySelector(`#${targetId}`);

        if (targetSection) {
          // Update active state
          navButtons.forEach((btn) => btn.classList.remove("active"));
          e.target.classList.add("active");

          // Scroll dengan memperhitungkan offset
          let scrollTop = targetSection.offsetTop;

          // Jika ini adalah offset scrollspy, tambahkan offset tambahan
          if (container.hasAttribute("data-nx-offset")) {
            scrollTop -= offset;
          }

          container.scrollTo({
            top: scrollTop,
            behavior: "smooth",
          });
        }
      });
    });

    // Set initial active state
    const firstSection = sections[0];
    if (firstSection) {
      const firstButton = navContainer.querySelector(
        `[data-nx-scroll-target="${firstSection.id}"]`
      );
      if (firstButton) {
        firstButton.classList.add("active");
      }
    }
  });
}
