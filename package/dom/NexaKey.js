const nexaUi = new NexaUI();
const nexaKey = nexaUi.NexaKey();


  const rawData2 = {
    data: {
       title: "Hello World Dantrik ",
       content: "This is some content",
       date: "2024-03-14",
       price: 150000,
     },
    extractor: "row",
  };
  nexaKey.Render(rawData2);