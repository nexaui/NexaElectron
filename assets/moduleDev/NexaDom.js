import NexaFilter from "./NexaFilter.js";

/**
 * @class View
 * @description Kelas untuk menangani view dan template
 */
export class NexaDom {
  /**
   * Membuat element template
   * @private
   */
  createTemplateElement(firstKey, elementById, oldElement) {
    const template = document.createElement("script");
    template.type = "text/template";
    template.setAttribute("data-template", "list");
    template.id = `${firstKey}_${elementById}_${this._instanceId}`;
    template.setAttribute("data-nexadom", this._instanceId);

    let templateHtml = oldElement.innerHTML;
    templateHtml = templateHtml.trim();

    template.innerHTML = templateHtml;
    oldElement.parentNode.replaceChild(template, oldElement);
    return template;
  }

  /**
   * Membuat element konten
   * @private
   */
  createContentElement(elementById, className) {
    const content = document.createElement("div");
    content.id = `${elementById}_content_${this._instanceId}`;
    content.setAttribute("data-nexadom", this._instanceId);
    if (className) content.className = className;

    const template = document.querySelector(
      `[data-nexadom="${this._instanceId}"]`
    );
    if (template) {
      template.parentNode.insertBefore(content, template.nextSibling);
    }
    return content;
  }

  constructor(options) {
    // Tambahkan unique identifier
    this._instanceId = `nexadom_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    // Gunakan WeakMap untuk data private
    this._storage = new WeakMap();
    this._storage.set(this, {
      data: null,
      filter: new NexaFilter(),
      domElements: {},
      templateCache: new Map(),
      fragmentCache: new Map(),
    });

    if (!options || typeof options !== "object") {
      throw new Error("Parameter options harus berupa object");
    }

    // Modifikasi element ID untuk mencegah konflik
    const elementId = `${options.elementById}_${this._instanceId}`;
    const oldElement = document.getElementById(options.elementById);

    if (!oldElement) {
      throw new Error(
        `Element dengan ID ${options.elementById} tidak ditemukan`
      );
    }

    // Set unique attribute untuk mengidentifikasi elements milik instance ini
    oldElement.setAttribute("data-nexadom", this._instanceId);

    // Ambil extractor dari attribute
    const extractor = oldElement.getAttribute("extractor") || "items";

    // Modifikasi fungsi validateAndSanitizeData
    const validateAndSanitizeData = (data) => {
      // Jika data adalah options object tanpa data
      if (data && !data.data && !data[extractor]) {
        return {
          [extractor]: [],
        };
      }

      // Jika data adalah array
      if (Array.isArray(data)) {
        return {
          [extractor]: data,
        };
      }

      // Jika data adalah object dengan property data
      if (data && data.data) {
        return {
          [extractor]: Array.isArray(data.data) ? data.data : [],
        };
      }

      // Jika data adalah object dengan extractor key
      if (data && data[extractor]) {
        return {
          [extractor]: Array.isArray(data[extractor]) ? data[extractor] : [],
        };
      }

      // Default return empty array
      return {
        [extractor]: [],
      };
    };

    // Deklarasikan data dan originalData sebagai property class
    this._data = validateAndSanitizeData(options);
    this._originalData = { ...this._data };

    // Terapkan pengurutan awal jika sortOrder didefinisikan
    if (options.sortOrder && options.sortBy) {
      const order = options.sortOrder.toUpperCase();
      if (this._data[extractor] && this._data[extractor].length > 0) {
        this._data[extractor] = sortData(
          this._data[extractor],
          order,
          options.sortBy
        );
        this._originalData[extractor] = [...this._data[extractor]];
      }
    }

    // Gunakan getter/setter untuk data
    Object.defineProperty(this, "data", {
      get: () => this._data,
      set: (value) => {
        this._data = validateAndSanitizeData(value);
        this._originalData = { ...this._data };
      },
    });

    // Update storage
    const storage = this._storage.get(this);
    storage.data = this._data;

    // Gunakan extractor untuk template
    const firstKey = extractor;
    const sID = "[@" + firstKey + "]";
    const eID = "[/" + firstKey + "]";
    const rowID = firstKey;

    // Inisialisasi NexaDomextractor dengan passing filter
    const domManager = new NexaDomextractor(this.filter);

    // Buat template element sekali saja
    const templateElement = this.createTemplateElement(
      firstKey,
      options.elementById,
      oldElement
    );
    const contentElement = this.createContentElement(
      options.elementById,
      oldElement.className
    );

    // Setup template - HAPUS sID dan eID
    const template = templateElement.innerHTML; // Hapus sID dan eID

    // Cache DOM elements dan event listeners untuk cleanup
    const domElements = {
      template: templateElement,
      content: contentElement,
      searchInput: options.search
        ? document.getElementById(options.search)
        : null,
    };

    // Tambahkan instance NexaFilter
    this.filter = new NexaFilter();

    this._templateSelector =
      options.templateSelector || '[data-template="list"]';

    // Implementasi deep copy yang aman
    function deepCopy(obj) {
      if (obj === null || typeof obj !== "object") return obj;

      const copy = Array.isArray(obj) ? [] : {};

      for (let key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          copy[key] = deepCopy(obj[key]);
        }
      }

      return copy;
    }

    // Fungsi untuk mengurutkan data
    function sortData(data, order = "ASC", sortBy = "id") {
      if (!Array.isArray(data)) return data;

      return [...data].sort((a, b) => {
        const valueA = a[sortBy];
        const valueB = b[sortBy];

        // Handle nilai null atau undefined
        if (valueA === null || valueA === undefined)
          return order === "ASC" ? -1 : 1;
        if (valueB === null || valueB === undefined)
          return order === "ASC" ? 1 : -1;

        // Handle tipe data berbeda
        if (typeof valueA === "string" && typeof valueB === "string") {
          return order === "ASC"
            ? valueA.localeCompare(valueB)
            : valueB.localeCompare(valueA);
        }

        // Handle angka dan tipe data lainnya
        return order === "ASC"
          ? valueA > valueB
            ? 1
            : -1
          : valueA < valueB
          ? 1
          : -1;
      });
    }

    /**
     * @param {string} str - String yang akan dikonversi menjadi slug
     * @returns {string} Slug yang dihasilkan
     */
    function createSlug(str) {
      return str
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
    }

    /**
     * Memproses data dengan menambahkan slug
     */
    function processDataWithSlug(data) {
      if (!Array.isArray(data)) return data;

      return data.map((item) => ({
        ...item,
        slug: item.href ? createSlug(item.href) : null,
      }));
    }

    const pageLimit = options.order || 10;

    // Inisialisasi data dengan slug
    if (this._data[rowID]) {
      this._data[rowID] = processDataWithSlug(this._data[rowID]);
    }

    // Pindahkan deklarasi currentPage dan totalPages ke atas sebelum digunakan
    let currentPage = 1;
    const totalPages = Math.ceil(this._data[rowID].length / pageLimit);

    // Inisialisasi self untuk digunakan dalam function
    const self = this;

    // Inisialisasi _activeFilters
    this._activeFilters = {};

    // Definisikan getFilteredData di awal, sebelum digunakan
    function getFilteredData() {
      // Jika ada filter aktif, gunakan data yang sudah difilter
      if (Object.keys(self._activeFilters).length > 0) {
        return self._data[rowID].filter((item) => {
          return Object.entries(self._activeFilters).every(
            ([filterType, filterValue]) => {
              return String(item[filterType]) === String(filterValue);
            }
          );
        });
      }
      // Jika tidak ada filter, kembalikan semua data
      return self._data[rowID];
    }

    // Tambahkan fungsi curPage yang menggunakan getFilteredData
    function curPage(page = 1) {
      const filteredData = getFilteredData();
      const startIndex = (page - 1) * pageLimit;
      const slicedData = filteredData.slice(startIndex, startIndex + pageLimit);
      return { [rowID]: slicedData };
    }

    // Cache untuk template yang sudah dirender
    const templateCache = new Map();

    // Cache untuk fragment DOM
    const fragmentCache = new Map();

    /**
     * Optimasi render dengan caching
     */
    function optimizedRender(data, templateId) {
      const cacheKey = JSON.stringify(data) + templateId;

      // Cek cache
      if (templateCache.has(cacheKey)) {
        return templateCache.get(cacheKey);
      }

      // Render template menggunakan NexaDomextractor
      const rendered = domManager.render(template, data, templateElement);

      // Simpan ke cache dengan batasan ukuran
      if (templateCache.size > 100) {
        const firstKey = templateCache.keys().next().value;
        templateCache.delete(firstKey);
      }
      templateCache.set(cacheKey, rendered);

      return rendered;
    }

    /**
     * Fragment caching untuk performa
     */
    function createCachedFragment(items, templateId) {
      const cacheKey = templateId + items.length;

      if (fragmentCache.has(cacheKey)) {
        return fragmentCache.get(cacheKey).cloneNode(true);
      }

      const fragment = document.createDocumentFragment();
      items.forEach((item) => {
        const rendered = optimizedRender({ [rowID]: [item] }, templateId);
        const div = document.createElement("div");
        div.innerHTML = rendered;
        fragment.appendChild(div.firstChild);
      });

      fragmentCache.set(cacheKey, fragment.cloneNode(true));
      return fragment;
    }

    /**
     * @param {Object} pageData - Data yang akan dirender
     */
    function renderData(pageData) {
      requestAnimationFrame(() => {
        try {
          // Set pagination info sebelum render
          domManager.setPaginationInfo(currentPage, pageLimit);

          // Clear content terlebih dahulu
          contentElement.innerHTML = "";

          // Render data
          const rendered = domManager.render(
            template,
            pageData,
            templateElement
          );
          contentElement.innerHTML = rendered;

          // Update pagination setelah render
          updatePaginationUI();
        } catch (error) {
          console.error("Error saat render data:", error);
        }
      });
    }

    // Tambahkan fungsi untuk virtual scrolling jika diperlukan
    function setupVirtualScroll() {
      if (!options.virtualScroll) return;

      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Load more data when reaching bottom
            if (currentPage < totalPages) {
              currentPage++;
              renderData(curPage(currentPage));
            }
          }
        });
      });

      // Observe last item
      const lastItem = contentElement.lastElementChild;
      if (lastItem) {
        observer.observe(lastItem);
      }

      // Cleanup
      return () => observer.disconnect();
    }

    // Cache DOM queries dan kalkulasi yang sering digunakan
    const cachedData = {
      totalPages: Math.ceil(this._data[rowID].length / pageLimit),
      searchDebounceTimer: null,
      // Cache DOM elements yang sering digunakan
      paginationElement:
        options.hasOwnProperty("pagination") && options.pagination !== false
          ? document.getElementById(options.pagination)
          : null,
      searchInput:
        options.hasOwnProperty("search") && options.search !== false
          ? document.getElementById(options.search)
          : null,
      // Tambahkan filter select
      filterSelect:
        options.hasOwnProperty("filter") && options.filter !== false
          ? document.getElementById(options.filter)
          : null,
    };

    /**
     * Fungsi debounce untuk search dengan cleanup
     */
    function debounceSearch(fn, delay = 300) {
      let timer = null;
      return function (...args) {
        if (timer) clearTimeout(timer);
        timer = setTimeout(() => {
          timer = null;
          fn.apply(this, args);
        }, delay);
      };
    }

    // Tambahkan fungsi untuk membuat indeks pencarian
    function createSearchIndex(data, searchableFields) {
      const searchIndex = new Map();

      data.forEach((item, index) => {
        let searchText = searchableFields
          .map((field) => {
            return item[field] ? String(item[field]).toLowerCase() : "";
          })
          .join(" ");

        searchIndex.set(index, searchText);
      });

      return searchIndex;
    }

    // Modifikasi memoizedFilter
    const memoizedFilter = (function () {
      const cache = new Map();
      let searchIndex = null;

      return function (keyword, data, searchableFields) {
        const cacheKey = keyword.trim().toLowerCase();
        if (cache.has(cacheKey)) return cache.get(cacheKey);

        // Buat indeks jika belum ada
        if (!searchIndex) {
          searchIndex = createSearchIndex(data, searchableFields);
        }

        const filtered = data.filter((item, index) => {
          const indexedText = searchIndex.get(index);
          return indexedText.includes(cacheKey);
        });

        cache.set(cacheKey, filtered);
        if (cache.size > 100) {
          const firstKey = cache.keys().next().value;
          cache.delete(firstKey);
        }
        return filtered;
      };
    })();

    function debounceAndThrottle(fn, delay = 300, throttleDelay = 100) {
      let debounceTimer;
      let throttleTimer;
      let lastRun = 0;

      return function (...args) {
        // Clear existing debounce timer
        if (debounceTimer) clearTimeout(debounceTimer);

        // Throttle check
        const now = Date.now();
        if (now - lastRun >= throttleDelay) {
          fn.apply(this, args);
          lastRun = now;
        } else {
          // Debounce
          debounceTimer = setTimeout(() => {
            fn.apply(this, args);
            lastRun = Date.now();
          }, delay);
        }
      };
    }

    function handleSearch(keyword, searchableFields) {
      const self = this;
      if (!keyword) {
        self._data[rowID] = [...self._originalData[rowID]];
      } else {
        self._data[rowID] = self._originalData[rowID].filter((item) => {
          return searchableFields.some((field) => {
            const value = item[field];
            return (
              value &&
              value.toString().toLowerCase().includes(keyword.toLowerCase())
            );
          });
        });
      }

      currentPage = 1;
      renderData(curPage(1));
      updatePaginationUI();
    }

    function setupSearch() {
      if (!options.search) return;

      const searchInput = document.getElementById(options.search);
      if (!searchInput) {
        console.warn("Search input tidak ditemukan");
        return;
      }

      const searchHandler = debounceAndThrottle(
        (event) => {
          const keyword = event.target.value.trim();
          handleSearch.call(self, keyword, options.searchableFields);
        },
        300,
        100
      );

      searchInput.removeEventListener("input", searchHandler);
      searchInput.addEventListener("input", searchHandler);
    }

    // Modifikasi setupFilter
    function setupFilter() {
      if (!options.hasOwnProperty("filter")) return;

      const filterSelect = document.getElementById(options.filter);
      if (!filterSelect) return;

      filterSelect.addEventListener("change", function (event) {
        const value = event.target.value;

        if (value === "all") {
          this._data[rowID] = [...this._originalData[rowID]];
          renderData(curPage(1));
          return;
        }

        handleFilter(value, [options.filterBy]);
      });
    }

    // Modifikasi destroy untuk cleanup worker
    this.destroy = function () {
      if (cachedData.searchInput) {
        cachedData.searchInput.removeEventListener("input", handleSearch);
      }

      // Cleanup untuk filter
      if (cachedData.filterElements) {
        cachedData.filterElements.forEach(({ element, handler }) => {
          element.removeEventListener("change", handler);
        });
      }

      if (cachedData.searchDebounceTimer) {
        clearTimeout(cachedData.searchDebounceTimer);
      }

      // Clear memoization cache
      memoizedFilter.cache = new Map();

      // Cleanup DOM elements
      domElements.content?.remove();
      domElements.template?.remove();

      // Clear cached data
      Object.keys(cachedData).forEach((key) => {
        cachedData[key] = null;
      });

      // Cleanup semua elements dengan instance ID ini
      document
        .querySelectorAll(`[data-nexadom="${this._instanceId}"]`)
        .forEach((el) => el.remove());

      // Clear storage
      const storage = this._storage.get(this);
      if (storage) {
        storage.templateCache.clear();
        storage.fragmentCache.clear();
        storage.domElements = {};
        this._storage.delete(this);
      }
    };

    /**
     * Setup filter select untuk multiple filter
     */
    const setupFilterSelect = () => {
      if (!options.hasOwnProperty("filterBy")) {
        return false;
      }

      // Support untuk multiple filter
      const filterBy = Array.isArray(options.filterBy)
        ? options.filterBy
        : [options.filterBy];

      // Gunakan this langsung karena arrow function
      const handleFilter = (event) => {
        const selectedValue = event.target.value;
        const filterType = event.target.getAttribute("data-filter-type");

        // Reset ke halaman pertama saat filter berubah
        currentPage = 1;

        // Update nilai filter aktif
        if (selectedValue === "all") {
          delete this._activeFilters[filterType];
        } else {
          this._activeFilters[filterType] = selectedValue;
        }

        requestAnimationFrame(() => {
          // Reset data terlebih dahulu
          this._data[rowID] = [...this._originalData[rowID]];

          // Filter data berdasarkan semua filter yang aktif
          if (Object.keys(this._activeFilters).length > 0) {
            this._data[rowID] = this._data[rowID].filter((item) => {
              return Object.entries(this._activeFilters).every(
                ([filterType, filterValue]) => {
                  if (!item.hasOwnProperty(filterType)) {
                    console.warn(
                      `Properti "${filterType}" tidak ditemukan pada item:`,
                      item
                    );
                    return false;
                  }
                  return String(item[filterType]) === String(filterValue);
                }
              );
            });
          }

          // Update total pages berdasarkan data yang sudah difilter
          const totalItems = this._data[rowID].length;
          cachedData.totalPages = Math.ceil(totalItems / pageLimit);

          // Pastikan current page valid
          if (currentPage > cachedData.totalPages) {
            currentPage = cachedData.totalPages || 1;
          }

          // Batch DOM updates
          const updates = () => {
            // Render data halaman pertama
            renderData(curPage(currentPage));

            // Update tampilan pagination
            if (cachedData.paginationElement) {
              updatePaginationUI();
            }
          };

          requestAnimationFrame(updates);
        });
      };

      // Setup event listeners untuk setiap filter select
      filterBy.forEach((filterType) => {
        const selectElement = document.getElementById(filterType);
        if (selectElement) {
          selectElement.setAttribute("data-filter-type", filterType);

          // Cleanup dan setup event listener
          selectElement.removeEventListener("change", handleFilter);
          selectElement.addEventListener("change", handleFilter);

          if (!cachedData.filterElements) {
            cachedData.filterElements = [];
          }
          cachedData.filterElements.push({
            element: selectElement,
            handler: handleFilter,
            type: filterType,
          });
        } else {
          console.warn(
            `Element filter dengan ID "${filterType}" tidak ditemukan`
          );
        }
      });

      return true;
    };

    // Setup fitur-fitur dasar
    setupSearch();
    setupFilter();
    setupLazyLoading();

    // Panggil setupFilterSelect setelah didefinisikan
    setupFilterSelect();

    // Initial render
    renderData(curPage(1));

    /**
     * @param {Function} callback - Callback untuk memproses element
     */
    NexaDom.prototype.Element = function (callback) {
      if (typeof callback !== "function") {
        throw new Error("Parameter callback harus berupa function");
      }
      const filteredData = [...this.data.data[Object.keys(this.data.data)[0]]];
      callback(filteredData);
    };

    /**
     * Membuat element pagination jika belum ada
     */
    function createPaginationElement() {
      // Cek apakah pagination didefinisikan dan tidak false
      if (
        !options.hasOwnProperty("pagination") ||
        options.pagination === false
      ) {
        return null;
      }

      const paginationID = options.pagination;

      // Cek apakah element dengan ID yang sesuai ada di HTML
      let paginationElement = document.getElementById(paginationID);

      if (!paginationID || !paginationElement) {
        console.warn("Element pagination tidak ditemukan atau ID tidak sesuai");
        return null;
      }

      // Pastikan element memiliki class pagination
      if (!paginationElement.classList.contains("pagination")) {
        paginationElement.classList.add("pagination");
      }

      return paginationElement;
    }

    /**
     * Membuat dan memperbarui UI pagination
     */
    function updatePaginationUI() {
      // Cek apakah pagination didefinisikan dan tidak false
      if (
        !options.hasOwnProperty("pagination") ||
        options.pagination === false
      ) {
        return false;
      }

      const paginationList = createPaginationElement();
      if (!paginationList) return false;

      // Reset pagination content
      paginationList.innerHTML = "";

      // Gunakan getFilteredData yang sudah didefinisikan di atas
      const filteredData = getFilteredData();
      const totalItems = filteredData.length;
      const currentTotalPages = Math.ceil(totalItems / pageLimit);

      // Validasi current page
      if (currentPage > currentTotalPages) {
        currentPage = currentTotalPages || 1;
      }

      // Update info halaman dan total data
      const pageInfoElement = document.getElementById("pageInfo");
      if (pageInfoElement) {
        const currentPageSpan = document.getElementById("currentPage");
        const totalPagesSpan = document.getElementById("totalPages");
        const totalItemsSpan = document.getElementById("totalItems");

        if (currentPageSpan) currentPageSpan.textContent = currentPage;
        if (totalPagesSpan) totalPagesSpan.textContent = currentTotalPages;
        if (totalItemsSpan) totalItemsSpan.textContent = totalItems;
      }

      // Jika tidak ada data atau hanya 1 halaman, sembunyikan pagination
      if (currentTotalPages <= 1) {
        paginationList.style.display = "none";
        return false;
      }

      paginationList.style.display = "flex";

      // Tombol First
      const firstLi = document.createElement("li");
      firstLi.classList.add("page-item");
      if (currentPage === 1) firstLi.classList.add("disabled");
      firstLi.innerHTML = `<button class="page-link" data-page="1">First</button>`;
      paginationList.appendChild(firstLi);

      // Tombol Previous
      const prevLi = document.createElement("li");
      prevLi.classList.add("page-item");
      if (currentPage === 1) prevLi.classList.add("disabled");
      prevLi.innerHTML = `<button class="page-link" data-page="${
        currentPage - 1
      }">Previous</button>`;
      paginationList.appendChild(prevLi);

      // Logika untuk menampilkan nomor halaman
      let startPage, endPage;
      if (currentTotalPages <= 5) {
        startPage = 1;
        endPage = currentTotalPages;
      } else {
        if (currentPage <= 3) {
          startPage = 1;
          endPage = 5;
        } else if (currentPage >= currentTotalPages - 2) {
          startPage = currentTotalPages - 4;
          endPage = currentTotalPages;
        } else {
          startPage = currentPage - 2;
          endPage = currentPage + 2;
        }
      }

      // Render nomor halaman
      for (let i = startPage; i <= endPage; i++) {
        const pageLi = document.createElement("li");
        pageLi.classList.add("page-item");
        if (i === currentPage) pageLi.classList.add("active");
        pageLi.innerHTML = `<button class="page-link" data-page="${i}">${i}</button>`;
        paginationList.appendChild(pageLi);
      }

      // Tombol Next
      const nextLi = document.createElement("li");
      nextLi.classList.add("page-item");
      if (currentPage === currentTotalPages) nextLi.classList.add("disabled");
      nextLi.innerHTML = `<button class="page-link" data-page="${
        currentPage + 1
      }">Next</button>`;
      paginationList.appendChild(nextLi);

      // Tombol Last
      const lastLi = document.createElement("li");
      lastLi.classList.add("page-item");
      if (currentPage === currentTotalPages) lastLi.classList.add("disabled");
      lastLi.innerHTML = `<button class="page-link" data-page="${currentTotalPages}">Last</button>`;
      paginationList.appendChild(lastLi);

      // Tambahkan event listener untuk pagination buttons
      paginationList.querySelectorAll(".page-link").forEach((button) => {
        button.addEventListener("click", function () {
          const newPage = parseInt(this.dataset.page);
          if (
            newPage &&
            newPage !== currentPage &&
            newPage >= 1 &&
            newPage <= currentTotalPages
          ) {
            currentPage = newPage;
            renderData(curPage(currentPage));
            updatePaginationUI();
          }
        });
      });
    }

    /**
     * Setup event listeners untuk pagination
     */
    function setupPaginationListeners() {
      const paginationList = document.getElementById(options.pagination);
      if (!paginationList) return;

      paginationList.addEventListener("click", function (event) {
        const button = event.target.closest(".page-link");
        if (!button) return;

        const newPage = parseInt(button.dataset.page);
        if (isNaN(newPage) || newPage < 1 || newPage > totalPages) return;
        if (newPage === currentPage) return;

        currentPage = newPage;
        renderData(curPage(currentPage));
        updatePaginationUI();

        // Update info page setiap kali halaman berubah
        const pageInfo = {
          pagination: {
            currentPage: currentPage,
            totalPages: Math.ceil(this._data[rowID].length / pageLimit),
            totalItems: this._data[rowID].length,
          },
        };

        const currentPageSpan = document.getElementById("currentPage");
        if (currentPageSpan) {
          currentPageSpan.textContent = pageInfo.pagination.currentPage;
        }
      });
    }

    // Initial setup
    setupPaginationListeners();

    /**
     * Fungsi untuk memuat ulang data
     * @param {Object|Array} newData - Data baru yang akan dimuat
     * @param {boolean} resetPage - Reset ke halaman pertama (default: true)
     */
    NexaDom.prototype.addData = function (newData, resetPage = true) {
      if (
        !newData ||
        (typeof newData !== "object" && !Array.isArray(newData))
      ) {
        throw new Error("Parameter newData harus berupa object atau array");
      }

      try {
        // Backup data lama untuk rollback jika terjadi error
        const oldData = { ...this._data };
        const oldOriginalData = { ...this._originalData };

        let newItems = [];

        // Validasi dan ekstrak data baru
        if (Array.isArray(newData)) {
          newItems = [...newData];
        } else {
          const firstKey = Object.keys(newData)[0];
          if (!firstKey || !Array.isArray(newData[firstKey])) {
            throw new Error("Data harus berupa array atau object dengan array");
          }
          newItems = [...newData[firstKey]];
        }

        // Validasi data baru tidak kosong
        if (newItems.length === 0) {
          throw new Error("Data baru tidak boleh kosong");
        }

        try {
          // Proses data baru dengan slug
          const processedNewItems = processDataWithSlug(newItems);

          // Gabungkan data baru di awal dengan data lama
          this._originalData[rowID] = [
            ...newItems,
            ...this._originalData[rowID],
          ];
          this._data[rowID] = [...processedNewItems, ...this._data[rowID]];
        } catch (slugError) {
          console.warn("Error saat memproses slug:", slugError);
          // Jika gagal memproses slug, tetap gabungkan data tanpa slug
          this._originalData[rowID] = [
            ...newItems,
            ...this._originalData[rowID],
          ];
          this._data[rowID] = [...newItems, ...this._data[rowID]];
        }

        // Update cache dan perhitungan terkait
        cachedData.totalPages = Math.ceil(this._data[rowID].length / pageLimit);

        // Reset pencarian jika ada
        if (cachedData.searchInput) {
          cachedData.searchInput.value = "";
        }

        // Reset ke halaman pertama jika diminta
        if (resetPage) {
          currentPage = 1;
        }

        // Clear memoization cache karena data berubah
        if (memoizedFilter && memoizedFilter.cache) {
          memoizedFilter.cache.clear();
        }

        // Render ulang dengan data baru
        requestAnimationFrame(() => {
          renderData(curPage(currentPage));

          // Trigger custom event untuk notifikasi reload selesai
          const reloadEvent = new CustomEvent("dataReloaded", {
            detail: {
              success: true,
              newItemsCount: newItems.length,
              totalItems: this._data[rowID].length,
              currentPage: currentPage,
            },
          });
          document.dispatchEvent(reloadEvent);
        });

        return true;
      } catch (error) {
        console.error("Error saat reload data:", error);

        // Rollback ke data lama jika terjadi error
        this._data = { ...oldData };
        this._originalData = { ...oldOriginalData };

        // Trigger custom event untuk notifikasi error
        const errorEvent = new CustomEvent("dataReloadError", {
          detail: {
            error: error.message,
          },
        });
        document.dispatchEvent(errorEvent);

        return false;
      }
    };

    /**
     * Fungsi untuk mendapatkan data saat ini
     * @returns {Object} Data yang sedang ditampilkan
     */
    NexaDom.prototype.getCurrentData = function () {
      const totalItems = this._data[rowID].length;
      const currentTotalPages = Math.ceil(totalItems / pageLimit);

      return {
        all: this._data[rowID],
        current: this.curPage(currentPage)[rowID],
        pagination: {
          currentPage: currentPage,
          totalPages: currentTotalPages,
          pageLimit: pageLimit,
          totalItems: totalItems,
        },
      };
    };

    /**
     * Fungsi untuk refresh manual dengan tombol
     * @param {string} buttonId - ID tombol refresh
     * @param {Object} options - Data dan opsi refresh
     */
    NexaDom.prototype.setupRefreshButton = function (buttonId, options = {}) {
      const refreshButton = document.getElementById(buttonId);
      if (!refreshButton) {
        console.warn("Tombol refresh tidak ditemukan:", buttonId);
        return null;
      }

      const {
        onStart,
        onSuccess,
        onError,
        loadingText = "Memperbarui...",
        data = null,
        reloadOptions = {},
      } = options;

      let isLoading = false;
      const originalText = refreshButton.innerHTML;

      const handleRefresh = async () => {
        if (isLoading) return;

        try {
          isLoading = true;
          refreshButton.disabled = true;
          refreshButton.innerHTML = loadingText;

          if (onStart) await onStart();

          if (data) {
            const success = this.Reload(data, reloadOptions);
            if (success && onSuccess) {
              await onSuccess({ data });
            }
          }
        } catch (error) {
          console.error("Error saat refresh:", error);
          if (onError) await onError(error);
        } finally {
          isLoading = false;
          refreshButton.disabled = false;
          refreshButton.innerHTML = originalText;
        }
      };

      const cleanup = () => {
        refreshButton.removeEventListener("click", handleRefresh);
      };

      refreshButton.addEventListener("click", handleRefresh);
      return cleanup;
    };

    /**
     * Fungsi untuk refresh dengan onclick
     * @param {Object} data - Data untuk refresh
     */
    NexaDom.prototype.Reload = function (newData, options = {}) {
      try {
        // Validasi data dengan lebih fleksibel
        let dataToLoad;
        const rowID = this._rowID; // Gunakan _rowID yang sudah diinisialisasi

        if (Array.isArray(newData)) {
          dataToLoad = { [rowID]: newData };
        } else if (newData && newData.data && newData.data[rowID]) {
          dataToLoad = { [rowID]: newData.data[rowID] };
        } else if (newData && newData[rowID]) {
          dataToLoad = newData;
        } else {
          throw new Error("Format data tidak valid untuk reload");
        }

        const {
          append = false,
          preserveFilters = false,
          resetPage = true,
        } = options;

        // Backup data lama untuk rollback
        const oldData = [...this._data[rowID]];
        const oldOriginalData = [...this._originalData[rowID]];

        try {
          if (append) {
            // Tambahkan data baru ke existing data
            this._originalData[rowID] = [
              ...this._originalData[rowID],
              ...dataToLoad[rowID],
            ];
            this._data[rowID] = [...this._data[rowID], ...dataToLoad[rowID]];
          } else {
            // Ganti dengan data baru
            this._originalData[rowID] = [...dataToLoad[rowID]];
            this._data[rowID] = [...dataToLoad[rowID]];
          }

          // Reset ke halaman pertama jika diminta
          if (resetPage) {
            this._currentPage = 1;
          }

          // Update UI
          this.renderData(this.curPage(this._currentPage));

          return {
            success: true,
            totalItems: this._data[rowID].length,
            currentPage: this._currentPage,
          };
        } catch (error) {
          // Rollback jika terjadi error
          this._data[rowID] = oldData;
          this._originalData[rowID] = oldOriginalData;
          throw error;
        }
      } catch (error) {
        console.error("Error dalam Reload:", error);
        return {
          success: false,
          error: error.message,
        };
      }
    };

    function renderLargeTemplate(template, data) {
      const chunkSize = 1000; // karakter
      const chunks = [];

      for (let i = 0; i < template.length; i += chunkSize) {
        chunks.push(template.slice(i, i + chunkSize));
      }

      let result = "";
      chunks.forEach((chunk, index) => {
        requestAnimationFrame(() => {
          result += processTemplateChunk(chunk, data);
          if (index === chunks.length - 1) {
            contentElement.innerHTML = result;
          }
        });
      });
    }

    /**
     * Setup lazy loading untuk gambar dan konten
     */
    function setupLazyLoading() {
      const options = {
        root: null,
        rootMargin: "50px",
        threshold: 0.1,
      };

      // Observer untuk gambar
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target;
            if (img.dataset.src) {
              // Load gambar dengan fade effect
              img.style.opacity = "0";
              img.src = img.dataset.src;
              img.onload = () => {
                img.style.transition = "opacity 0.3s";
                img.style.opacity = "1";
              };
              delete img.dataset.src;
              imageObserver.unobserve(img);
            }
          }
        });
      }, options);

      // Observer untuk konten berat
      const contentObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const element = entry.target;
            if (element.dataset.content) {
              loadHeavyContent(element);
              contentObserver.unobserve(element);
            }
          }
        });
      }, options);

      // Load konten berat
      function loadHeavyContent(element) {
        const contentId = element.dataset.content;
      }

      // Observe semua gambar lazy
      document.querySelectorAll("img[data-src]").forEach((img) => {
        imageObserver.observe(img);
      });

      // Observe konten berat
      document.querySelectorAll("[data-content]").forEach((element) => {
        contentObserver.observe(element);
      });

      return {
        imageObserver,
        contentObserver,
      };
    }

    // Cleanup untuk lazy loading
    this.destroy = function () {
      if (this.lazyLoadObservers) {
        this.lazyLoadObservers.imageObserver.disconnect();
        this.lazyLoadObservers.contentObserver.disconnect();
      }
      // ... cleanup lainnya
    };

    // Setup lazy loading saat inisialisasi
    this.lazyLoadObservers = setupLazyLoading();

    /**
     * Setup virtual scrolling untuk data besar
     */
    function setupVirtualScrolling() {
      const viewportHeight = window.innerHeight;
      const itemHeight = 50; // Perkiraan tinggi setiap item
      const bufferSize = 5; // Jumlah item buffer atas dan bawah
      const visibleItems =
        Math.ceil(viewportHeight / itemHeight) + bufferSize * 2;

      let startIndex = 0;
      let scrollTimeout;

      const container = contentElement;
      const scrollContainer = document.createElement("div");
      scrollContainer.style.position = "relative";
      container.appendChild(scrollContainer);

      function updateVisibleItems() {
        const scrollTop = container.scrollTop;
        startIndex = Math.floor(scrollTop / itemHeight);
        startIndex = Math.max(0, startIndex - bufferSize);

        const visibleData = this._data[rowID].slice(
          startIndex,
          startIndex + visibleItems
        );
        const totalHeight = this._data[rowID].length * itemHeight;

        scrollContainer.style.height = `${totalHeight}px`;

        // Render hanya item yang visible
        const fragment = document.createDocumentFragment();
        visibleData.forEach((item, index) => {
          const itemElement = document.createElement("div");
          itemElement.style.position = "absolute";
          itemElement.style.top = `${(startIndex + index) * itemHeight}px`;
          itemElement.style.height = `${itemHeight}px`;

          const rendered = optimizedRender({ [rowID]: [item] }, rowID);
          itemElement.innerHTML = rendered;

          fragment.appendChild(itemElement);
        });

        // Clear dan update content
        while (scrollContainer.firstChild) {
          scrollContainer.removeChild(scrollContainer.firstChild);
        }
        scrollContainer.appendChild(fragment);
      }

      container.addEventListener("scroll", () => {
        if (scrollTimeout) {
          cancelAnimationFrame(scrollTimeout);
        }
        scrollTimeout = requestAnimationFrame(updateVisibleItems);
      });

      // Initial render
      updateVisibleItems();

      return {
        refresh: updateVisibleItems,
        destroy: () => {
          container.removeEventListener("scroll", updateVisibleItems);
          scrollContainer.remove();
        },
      };
    }

    /**
     * Setup data chunking dan storage
     */
    class DataChunkManager {
      constructor(dbName = "viewDB", storeName = "chunks") {
        this.dbName = dbName;
        this.storeName = storeName;
        this.chunkSize = 1000; // Items per chunk
        this.db = null;
      }

      async init() {
        return new Promise((resolve, reject) => {
          const request = indexedDB.open(this.dbName, 1);

          request.onerror = () => reject(request.error);
          request.onsuccess = () => {
            this.db = request.result;
            resolve();
          };

          request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(this.storeName)) {
              db.createObjectStore(this.storeName, { keyPath: "chunkId" });
            }
          };
        });
      }

      async storeChunks(data) {
        const chunks = this.createChunks(data);
        const store = this.db
          .transaction(this.storeName, "readwrite")
          .objectStore(this.storeName);

        return Promise.all(
          chunks.map(
            (chunk) =>
              new Promise((resolve, reject) => {
                const request = store.put(chunk);
                request.onsuccess = () => resolve();
                request.onerror = () => reject(request.error);
              })
          )
        );
      }

      async getChunk(chunkId) {
        return new Promise((resolve, reject) => {
          const request = this.db
            .transaction(this.storeName)
            .objectStore(this.storeName)
            .get(chunkId);

          request.onsuccess = () => resolve(request.result);
          request.onerror = () => reject(request.error);
        });
      }

      createChunks(data) {
        const chunks = [];
        for (let i = 0; i < data.length; i += this.chunkSize) {
          chunks.push({
            chunkId: Math.floor(i / this.chunkSize),
            data: data.slice(i, i + this.chunkSize),
          });
        }
        return chunks;
      }
    }

    /**
     * Setup data streaming untuk load data besar
     */
    class DataStreamManager {
      constructor(options = {}) {
        this.pageSize = options.pageSize || 50;
        this.chunkManager = new DataChunkManager();
      }

      async init() {
        await this.chunkManager.init();
        this.setupStreamHandlers();
      }

      setupStreamHandlers() {
        let currentChunk = 0;
        let isLoading = false;

        const loadNextChunk = async () => {
          if (isLoading) return;
          isLoading = true;

          try {
            const chunk = await this.chunkManager.getChunk(currentChunk);
            if (chunk) {
              // Process chunk dengan worker
              this.worker.postMessage({
                action: "processChunk",
                data: chunk.data,
              });
              currentChunk++;
            }
          } catch (error) {
            console.error("Error loading chunk:", error);
          } finally {
            isLoading = false;
          }
        };

        // Setup intersection observer untuk infinite scroll
        const observer = new IntersectionObserver(
          (entries) => {
            if (entries[0].isIntersecting) {
              loadNextChunk();
            }
          },
          { threshold: 0.5 }
        );

        // Observe loader element
        const loader = document.querySelector("#chunk-loader");
        if (loader) {
          observer.observe(loader);
        }
      }

      async processStreamedData(data) {
        // Store chunks di IndexedDB
        await this.chunkManager.storeChunks(data);

        // Setup virtual scrolling
        const virtualScroller = setupVirtualScrolling();

        return {
          destroy: () => {
            virtualScroller.destroy();
            // Cleanup lainnya
          },
        };
      }
    }

    // Inisialisasi managers
    const streamManager = new DataStreamManager();
    let virtualScroller = null;

    // Bind this ke initializeDataHandling
    const initializeDataHandling = async () => {
      await streamManager.init();

      if (this._data[rowID].length > 1000) {
        // Gunakan virtual scrolling untuk data besar
        virtualScroller = setupVirtualScrolling();

        // Process data dengan streaming
        await streamManager.processStreamedData(this._data[rowID]);
      } else {
        // Render normal untuk data kecil
        renderData(curPage(1));
      }
    };

    // Update destroy method to remove worker cleanup
    this.destroy = function () {
      if (virtualScroller) {
        virtualScroller.destroy();
      }
      // ... other cleanup
    };

    // Initialize dengan arrow function untuk mempertahankan this
    initializeDataHandling().catch(console.error);

    /**
     * Filter data berdasarkan key dan value
     */
    this.filterKey = function (key, value) {
      if (!key || !value) {
        console.warn("Parameter key dan value harus diisi");
        return this;
      }

      try {
        // Filter data berdasarkan key dan value
        this._data[rowID] = this._originalData[rowID].filter((item) => {
          return String(item[key]) === String(value);
        });

        // Update UI
        currentPage = 1;
        renderData(curPage(1));
        updatePaginationUI();

        // Return object dengan informasi hasil filter
        return {
          filtered: this._data[rowID].length,
          total: this._originalData[rowID].length,
          data: this._data[rowID],
        };
      } catch (error) {
        console.error("Error dalam filterKey:", error);
        return {
          filtered: 0,
          total: this._originalData[rowID].length,
          data: [],
        };
      }
    };

    /**
     * Internal filter state management
     */
    this._filterState = {
      active: {},
      history: [],

      add: function (key, value) {
        this.active[key] = value;
        this.history.push({
          key,
          value,
          timestamp: Date.now(),
        });
      },

      remove: function (key) {
        delete this.active[key];
      },

      clear: function () {
        this.active = {};
        this.history = [];
      },

      get: function (key) {
        return this.active[key];
      },

      getAll: function () {
        return { ...this.active };
      },
    };

    /**
     * Internal filter helper
     */
    this._internalFilter = function (key, value) {
      if (!key || !value) return;

      try {
        this._data[rowID] = this._data[rowID].filter((item) => {
          // Handle nested object
          if (key.includes(".")) {
            const keys = key.split(".");
            let val = item;
            for (const k of keys) {
              if (val === undefined) return false;
              val = val[k];
            }
            return String(val) === String(value);
          }

          // Handle array value
          if (Array.isArray(value)) {
            return value.includes(String(item[key]));
          }

          return String(item[key]) === String(value);
        });
      } catch (error) {
        console.error("Error pada internal filter:", error);
      }
    };

    /**
     * Method untuk mengubah urutan data
     * @param {string} order - 'ASC' atau 'DESC'
     * @param {string} sortBy - field yang akan diurutkan
     */
    NexaDom.prototype.sort = function (order, sortBy) {
      this._data[rowID] = sortData(this._data[rowID], order, sortBy);
      currentPage = 1;
      renderData(curPage(1));
      updatePaginationUI();
    };

    /**
     * Mendapatkan data berdasarkan ID
     * @param {number|string} id - ID yang dicari
     * @returns {Object|null} Data yang ditemukan atau null jika tidak ada
     */
    NexaDom.prototype.getID = function (id) {
      if (!id) {
        console.warn("Parameter ID harus diisi");
        return null;
      }

      try {
        // Cari data di originalData untuk memastikan mendapat data yang belum difilter
        const found = this._originalData[rowID].find(
          (item) =>
            // Konversi ke string untuk comparison yang lebih aman
            String(item.id) === String(id)
        );

        if (!found) {
          console.warn(`Data dengan ID ${id} tidak ditemukan`);
          return null;
        }

        return {
          success: true,
          data: found,
          message: `Data dengan ID ${id} ditemukan`,
        };
      } catch (error) {
        console.error("Error dalam getID:", error);
        return {
          success: false,
          data: null,
          message: `Error: ${error.message}`,
        };
      }
    };

    // Tambahkan method setData
    this.setData = function (newData) {
      if (!Array.isArray(newData)) {
        throw new Error("Parameter data harus berupa array");
      }

      try {
        // Update data di storage
        const storage = this._storage.get(this);

        // Update both data and originalData
        this._data = {
          [extractor]: newData,
        };
        this._originalData = {
          [extractor]: [...newData],
        };

        // Update storage data
        storage.data = this._data;

        // Reset page
        this._currentPage = 1;

        // Render data
        renderData(curPage(1));
        updatePaginationUI();

        return true;
      } catch (error) {
        console.error("Error dalam setData:", error);
        return false;
      }
    };

    // Inisialisasi variabel penting
    this._currentPage = 1;
    this._pageLimit = options.order || 10;
    this._rowID = extractor;

    // Bind methods ke instance
    this.handleSearch = handleSearch.bind(this);
    this.renderData = renderData.bind(this);
    this.curPage = curPage.bind(this);
    this.updatePaginationUI = updatePaginationUI.bind(this);

    // Setup fitur-fitur
    setupSearch();
    setupFilter();
    setupPaginationListeners();

    // Initial render jika ada data
    if (this._data[this._rowID].length > 0) {
      this.renderData(this.curPage(1));
    }
  }

  /**
   * Mendapatkan data dalam format JSON berdasarkan ID
   * @param {number|string} id - ID yang dicari
   * @returns {Object} Data dalam format JSON atau error object
   */
  getData(id) {
    try {
      // Validasi parameter
      if (!id) {
        throw new Error("Parameter ID harus diisi");
      }

      // Gunakan extractor yang sudah ada
      const rowID = Object.keys(this._data)[0];

      // Cari data berdasarkan ID
      const found = this._data[rowID].find(
        (item) => String(item.id) === String(id)
      );

      if (!found) {
        return {
          success: false,
          message: `Data dengan ID ${id} tidak ditemukan`,
          data: null,
        };
      }

      // Return data dalam format JSON
      return {
        success: true,
        message: `Data dengan ID ${id} ditemukan`,
        data: {
          ...found,
          _meta: {
            timestamp: new Date().toISOString(),
            source: "NexaDom",
            id: id,
          },
        },
      };
    } catch (error) {
      console.error("Error dalam getData:", error);
      return {
        success: false,
        message: `Error: ${error.message}`,
        data: null,
        error: error.toString(),
      };
    }
  }
}

// Export class-class tambahan jika diperlukan

export class NexaDomextractor {
  constructor(filter) {
    if (!filter || !(filter instanceof NexaFilter)) {
      this.filter = new NexaFilter();
    } else {
      this.filter = filter;
    }

    // Tambahkan method untuk set pagination info
    this.paginationInfo = {
      currentPage: 1,
      pageLimit: 10,
    };

    this.setPaginationInfo = function (currentPage, pageLimit) {
      this.paginationInfo.currentPage = currentPage || 1;
      this.paginationInfo.pageLimit = pageLimit || 10;
    };

    this.render = function (template, data, element) {
      try {
        //console.log("Template yang diterima:", template);
        //console.log("Data yang akan dirender:", data);

        let result = "";
        const dataKeys = Object.keys(data);

        dataKeys.forEach((key) => {
          const items = data[key];
          if (!Array.isArray(items)) {
            console.warn(`Data untuk key ${key} bukan array:`, items);
            return;
          }

          // Render setiap item dengan support filter dan penomoran
          result = items
            .map((item, index) => {
              let itemTemplate = template;

              // Gunakan paginationInfo untuk perhitungan nomor
              const startNumber =
                (this.paginationInfo.currentPage - 1) *
                  this.paginationInfo.pageLimit +
                1;
              const itemWithNumber = {
                ...item,
                no: startNumber + index,
              };

              // Replace placeholder dengan nilai dan proses filter
              Object.keys(itemWithNumber).forEach((prop) => {
                const value = itemWithNumber[prop] ?? "";

                // Support untuk format {set.property|filter1|filter2}, {row.no}, dan {extractor.property}
                const pattern = new RegExp(
                  `{(?:${key}\\.|row\\.|${key}\\.)(${prop})(?:\\|[^}]+)?}`,
                  "g"
                );

                itemTemplate = itemTemplate.replace(pattern, (match) => {
                  try {
                    const parts = match.slice(1, -1).split("|");
                    const propPath = parts[0];
                    const filters = parts.slice(1);

                    let processedValue = value;

                    if (filters.length > 0) {
                      filters.forEach((filterStr) => {
                        const [filterName, ...args] = filterStr.split(":");
                        if (
                          this.filter &&
                          typeof this.filter.applyFilter === "function"
                        ) {
                          processedValue = this.filter.applyFilter(
                            processedValue,
                            filterName,
                            args
                          );
                        }
                      });
                    }

                    return processedValue;
                  } catch (error) {
                    console.error("Error processing template:", error);
                    return value;
                  }
                });
              });

              return itemTemplate;
            })
            .join("");
        });

        return result;
      } catch (error) {
        console.error("Error dalam render:", error);
        return "";
      }
    }.bind(this);

    /**
     * Parse string template menjadi DOM elements
     * @param {string} template - Template string
     * @returns {DocumentFragment}
     */
    this.parse = function (template) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(template, "text/html");
      const fragment = document.createDocumentFragment();

      while (doc.body.firstChild) {
        fragment.appendChild(doc.body.firstChild);
      }

      return fragment;
    };

    /**
     * Sanitize string untuk mencegah XSS
     * @param {string} str - String yang akan disanitize
     * @returns {string}
     */
    this.sanitize = function (str) {
      const div = document.createElement("div");
      div.textContent = str;
      return div.innerHTML;
    };
  }
}
