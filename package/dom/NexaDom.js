
const nexaUi = new NexaUI();
// Konfigurasi awal
const inisialisasi = {
  elementById: "row",
  sortOrder: "DESC",
  sortBy: "id",
  search: "searchInput",
  virtualScroll: true,
  chunkSize: 1000,
  pagination: "pagination",
  order: 2,
  searchableFields: ["title", "category"],
};
// Data untuk list content
const data = [
  {
    id: 1,
    title: "Item 1",
    updated_at: "2024-03-20",
    category: "news",
  },
  {
    id: 2,
    title: "Item 2",
    updated_at: "2024-03-21",
    category: "article",
  },
  {
    id: 3,
    title: "Item 3",
    updated_at: "2024-03-20",
    category: "news",
  },
  {
    id: 4,
    title: "Item 4",
    updated_at: "2024-03-21",
    category: "article",
  },
  {
    id: 3,
    title: "Item 1",
    updated_at: "2024-03-20",
    category: "news",
  },
  {
    id:4,
    title: "Item 2",
    updated_at: "2024-03-21",
    category: "article",
  },
  {
    id: 5,
    title: "Item 3",
    updated_at: "2024-03-20",
    category: "news",
  },
 {
    id: 6,
    title: "Item 4",
    updated_at: "2024-03-21",
    category: "article",
  },
  {
    id: 7,
    title: "Item 4",
    updated_at: "2024-03-21",
    category: "article",
  },
];

// Inisialisasi NexaDom
const dom = nexaUi.NexaDom(inisialisasi);
dom.setData(data);

