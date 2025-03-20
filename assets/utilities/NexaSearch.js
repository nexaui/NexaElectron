// Fungsi utama untuk inisialisasi komponen search
export function initializeSearch() {
  // Mendapatkan semua komponen search
  const searchComponents = document.querySelectorAll(".nx-search");

  searchComponents.forEach((search) => {
    const input = search.querySelector("input");
    const button = search.querySelector(".nx-search-btn");
    // Event listener untuk tombol search
    button.addEventListener("click", () => {
      handleSearch(input.value);
    });

    // Event listener untuk input ketika menekan Enter
    input.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        handleSearch(input.value);
      }
    });
  });

  initializeAutocomplete();
  initializeSearchWithClear();
  initializeLoadingState();
}

// Fungsi untuk menangani pencarian
function handleSearch(value) {
  console.log("Mencari:", value);
  // Implementasi pencarian sesuai kebutuhan
}

// Fungsi untuk inisialisasi fitur autocomplete
function initializeAutocomplete() {
  const autoCompleteSearches = document.querySelectorAll(
    ".nx-search-autocomplete"
  );

  autoCompleteSearches.forEach((search) => {
    const input = search.querySelector("input");
    const suggestions = search.querySelector(".nx-search-suggestions");
    const items = search.querySelectorAll(".nx-search-item");

    input.addEventListener("focus", () => {
      search.classList.add("active");
    });

    input.addEventListener("blur", () => {
      setTimeout(() => {
        search.classList.remove("active");
      }, 200);
    });

    items.forEach((item) => {
      item.addEventListener("click", () => {
        input.value = item.textContent;
        search.classList.remove("active");
        handleSearch(input.value);
      });
    });
  });
}

// Fungsi untuk inisialisasi fitur clear button
function initializeSearchWithClear() {
  const searchWithClear = document.querySelectorAll(".nx-search-with-clear");

  searchWithClear.forEach((search) => {
    const input = search.querySelector("input");
    const clearBtn = search.querySelector(".nx-search-clear");

    input.addEventListener("input", () => {
      if (input.value) {
        search.classList.add("has-value");
      } else {
        search.classList.remove("has-value");
      }
    });

    clearBtn.addEventListener("click", () => {
      input.value = "";
      search.classList.remove("has-value");
      input.focus();
    });
  });
}

// Fungsi untuk inisialisasi loading state
function initializeLoadingState() {
  document
    .querySelectorAll(".nx-search:not(.nx-search-loading)")
    .forEach((search) => {
      const searchBtn = search.querySelector(".nx-search-btn");

      searchBtn.addEventListener("click", () => {
        const input = search.querySelector("input");
        if (input.value) {
          search.classList.add("nx-search-loading");
          input.disabled = true;
          searchBtn.disabled = true;

          setTimeout(() => {
            search.classList.remove("nx-search-loading");
            input.disabled = false;
            searchBtn.disabled = false;
          }, 2000);
        }
      });
    });
}