export class Sortable {
  constructor() {
    if (!document.querySelector(".nx-sortable")) {
      return;
    }

    this.dbName = "sortableDB";
    this.dbVersion = 1;
    this.db = null;
    this.init();
  }

  init() {
    const request = indexedDB.open(this.dbName, this.dbVersion);

    request.onerror = (event) => {
      console.error("Database error: " + event.target.error);
    };

    request.onupgradeneeded = (event) => {
      this.db = event.target.result;
      if (!this.db.objectStoreNames.contains("sortableState")) {
        this.db.createObjectStore("sortableState", { keyPath: "id" });
      }
    };

    request.onsuccess = (event) => {
      this.db = event.target.result;
      this.restoreState();
      this.initializeSortables();
    };
  }

  saveState(id, items) {
    const transaction = this.db.transaction(["sortableState"], "readwrite");
    const store = transaction.objectStore("sortableState");
    store.put({
      id: id,
      items: items,
      timestamp: new Date().getTime(),
    });
  }

  restoreState() {
    const transaction = this.db.transaction(["sortableState"], "readonly");
    const store = transaction.objectStore("sortableState");

    ["basic-demo", "handle-demo", "nested-demo", "grid-demo"].forEach((id) => {
      const request = store.get(id);
      request.onsuccess = (event) => {
        const data = event.target.result;
        if (data) {
          const container = document.getElementById(id);
          if (container) {
            container.innerHTML = "";
            const items = data.items;
            items.forEach((itemHtml) => {
              const temp = document.createElement("div");
              temp.innerHTML = itemHtml;
              container.appendChild(temp.firstElementChild);
            });
          }
        }
      };
    });
  }

  getSortableItems(container) {
    return Array.from(container.children).map((item) => item.outerHTML);
  }

  initializeSortables() {
    // Basic sortable
    const basicDemo = document.getElementById("basic-demo");
    if (basicDemo) {
      new window.Sortable(basicDemo, {
        animation: 150,
        ghostClass: "sortable-dragging",
        dragClass: "sortable-dragging",
        onEnd: (evt) => {
          const items = this.getSortableItems(evt.to);
          this.saveState("basic-demo", items);
        },
      });
    }

    // Handle sortable
    const handleDemo = document.getElementById("handle-demo");
    if (handleDemo) {
      new window.Sortable(handleDemo, {
        handle: ".handle",
        animation: 150,
        ghostClass: "sortable-dragging",
        dragClass: "sortable-dragging",
        onEnd: (evt) => {
          const items = this.getSortableItems(evt.to);
          this.saveState("handle-demo", items);
        },
      });
    }

    // Nested sortable
    const nestedSortables = document.querySelectorAll(
      "#nested-demo .nx-sortable"
    );
    if (nestedSortables.length > 0) {
      nestedSortables.forEach((el) => {
        new window.Sortable(el, {
          group: "nested",
          animation: 150,
          fallbackOnBody: true,
          ghostClass: "sortable-dragging",
          dragClass: "sortable-dragging",
          onEnd: (evt) => {
            const items = this.getSortableItems(
              document.getElementById("nested-demo")
            );
            this.saveState("nested-demo", items);
          },
        });
      });
    }

    // Grid sortable
    const gridDemo = document.getElementById("grid-demo");
    if (gridDemo) {
      new window.Sortable(gridDemo, {
        animation: 150,
        ghostClass: "sortable-dragging",
        dragClass: "sortable-dragging",
        grid: 3,
        swapThreshold: 0.65,
        onEnd: (evt) => {
          const items = this.getSortableItems(evt.to);
          this.saveState("grid-demo", items);
        },
      });
    }
  }
}
