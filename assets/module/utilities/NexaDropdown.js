// Fungsi untuk toggle dropdown
export function Dropdown() {
  // Fungsi untuk toggle dropdown
  function toggleDropdown(btn) {
    const dropdown = btn.nextElementSibling;
    dropdown.classList.toggle("show");
  }

  // Event listener untuk click di luar dropdown
  window.addEventListener("click", function (event) {
    if (!event.target.matches(".nx-btn")) {
      const dropdowns = document.getElementsByClassName("nx-dropdown-content");
      for (const dropdown of dropdowns) {
        if (dropdown.classList.contains("show")) {
          dropdown.classList.remove("show");
        }
      }
    }
  });

  // Tambahkan event listener ke semua tombol dropdown
  const dropdownButtons = document.querySelectorAll(
    '.nx-btn[data-toggle="dropdown"]'
  );
  dropdownButtons.forEach((btn) => {
    btn.addEventListener("click", function () {
      toggleDropdown(this);
    });
  });
}