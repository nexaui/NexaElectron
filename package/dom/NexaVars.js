const nexaUi = new NexaUI();
// Buat dan inisialisasi instance langsung
const nexaVars = nexaUi.NexaVars({
  data: {
    title: "Hello World Dantrik ",
    content: "This is some content",
    date: "2024-03-14",
    price: 150000,
  },

});
nexaVars.initTemplates();