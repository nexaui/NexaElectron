// Menambahkan event listener untuk list items yang dapat diklik
export class ListGroup {
  constructor() {
    this.init();
  }

  init() {
    const listItems = document.querySelectorAll(".nx-list-item");

    listItems.forEach((item) => {
      if (item.tagName === "A") {
        item.addEventListener("click", (e) => this.handleClick(e, item));
      }
    });
  }

  handleClick(e, item) {
    if (!item.classList.contains("disabled")) {
      const parent = item.closest(".nx-list-group");
      parent.querySelectorAll(".nx-list-item").forEach((el) => {
        el.classList.remove("active");
      });
      item.classList.add("active");
    }
  }
}






