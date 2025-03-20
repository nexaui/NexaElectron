export function NexaModal(callback) {
  const originalNxModal = window.nxModal;
}

export function nxModalShow(modalId, order = "") {
  const modal = document.getElementById(modalId);
  if (!modal) return;
  // Reset any previous styles
  const modalContent = modal.querySelector(".nx-modal-content");
  const modalBody = modal.querySelector(".nx-modal-body");
  const modalFooter = modal.querySelector(".nx-modal-footer");

  if (modalContent) {
    modalContent.style.cssText = ""; // Reset inline styles
  }

  if (modalBody) {
    modalBody.style.cssText = ""; // Reset inline styles
  }

  if (modalFooter) {
    modalFooter.style.cssText = ""; // Reset inline styles
  }

  modal.style.display = "flex"; // Use flex instead of block
  modal.classList.add("show");
  const restoreFocus = trapFocus(modal);

  modal.style.display = "block";
  modal.setAttribute("aria-modal", "true");

  // Khusus untuk modal fullscreen
  if (modal.classList.contains("nx-modal-fullscreen")) {
    document.body.style.overflow = "hidden"; // Mencegah scroll pada body
    modal.style.padding = "0";

    const modalContent = modal.querySelector(".nx-modal-content");
    if (modalContent) {
      // Reset style yang mungkin diset sebelumnya
      Object.assign(modalContent.style, {
        width: "100vw",
        height: "100vh",
        margin: "0",
        padding: "0",
        border: "0",
        borderRadius: "0",
        position: "fixed",
        top: "0",
        left: "0",
        right: "0",
        bottom: "0",
        transform: "none",
      });

      // Atur tinggi body modal
      const modalBody = modalContent.querySelector(".nx-modal-body");
      const modalHeader = modalContent.querySelector(".nx-modal-header");
      const modalFooter = modalContent.querySelector(".nx-modal-footer");

      if (modalBody && modalHeader && modalFooter) {
        const headerHeight = modalHeader.offsetHeight;
        const footerHeight = modalFooter.offsetHeight;
        modalBody.style.height = `calc(100vh - ${
          headerHeight + footerHeight
        }px)`;
        modalBody.style.overflowY = "auto";
      }
    }
  }

  // Inisialisasi fitur interaksi
  if (modal.classList.contains("nx-modal-draggable")) {
    makeDraggable(modalId);
  }

  if (modal.classList.contains("nx-modal-resizable")) {
    makeResizable(modalId);
  }

  if (modal.classList.contains("nx-modal-stacking")) {
    handleModalStacking(modalId);
  }

  // Simpan fungsi restore focus
  modal.restoreFocus = restoreFocus;

  // ARIA attributes
  modal.setAttribute("role", "dialog");
  modal.setAttribute("aria-labelledby", `${modalId}-title`);

  // Center modal jika perlu
  if (modal.classList.contains("nx-modal-centered")) {
    centerModal(modalId);
    // Tambahkan event listener untuk resize
    window.addEventListener("resize", () => centerModal(modalId));
  }

  // Animasi
  requestAnimationFrame(() => {
    modal.classList.add("show");
  });

  // Check overflow untuk modal scrollable
  if (modal.classList.contains("nx-modal-scrollable")) {
    checkModalOverflow(modalId);
  }

  // Center modal if needed
  centerModal(modalId);

  // Trap focus
  trapFocus(modal);

  // Disable scroll pada body kecuali untuk modal scrollable
  if (!modal.classList.contains("nx-modal-scrollable")) {
    document.body.style.overflow = "hidden";
  }

  // Handle custom animations
  if (modal.classList.contains("nx-modal-custom-animation")) {
    modal.addEventListener(
      "animationend",
      () => {
        modal.classList.add("animation-completed");
      },
      { once: true }
    );
  }

  // Handle transition timing
  if (modal.classList.contains("nx-modal-transition-timing")) {
    const timing = modal.getAttribute("data-timing") || "ease";
    setModalTiming(modalId, timing);
  }

  // Handle effects
  if (modal.classList.contains("nx-modal-effects")) {
    const effect = modal.getAttribute("data-effect") || "blur";
    setModalEffect(modalId, effect);
  }

  // Add mobile optimizations
  if ("ontouchstart" in window) {
    optimizeForMobile(modalId);
    const cleanup = enableTouchGestures(modalId);
    modal.addEventListener("modal:afterClose", cleanup, { once: true });
  }

  // Add responsive behavior
  const cleanupResponsive = handleResponsiveBehavior(modalId);
  modal.addEventListener("modal:afterClose", cleanupResponsive, {
    once: true,
  });

  // Tambahkan window controls jika modal draggable
  if (modal.classList.contains("nx-modal-draggable")) {
    const originalSize = addWindowControls(modalId);
    modal.originalSize = originalSize;
  }

  $(".nx-modal-content").draggable({
    handle: ".nx-modal-header",
    scroll: false,
    start: function () {
      $(this).css({
        transform: "none",
      });
    },
  });

  // Prevent form submission
  const form = modal.querySelector("form");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    });

    // Prevent button clicks from submitting form
    const buttons = form.querySelectorAll("button");
    buttons.forEach((button) => {
      if (!button.hasAttribute("type")) {
        button.setAttribute("type", "button");
      }
      button.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
      });
    });
  }

  // Dispatch event untuk modal aktif
  window.dispatchEvent(
    new CustomEvent("modalactiv", {
      detail: {
        modalId: modalId,
        order: order,
        element: modal,
        timestamp: Date.now(),
      },
    })
  );
}

// Event handler untuk click di luar modal
window.onclick = function (event) {
  // if (event.target.className.includes("nx-modal")) {
  //   const modal = event.target;
  //   const modalId = modal.id;
  //   // Jika bukan modal static, tutup modal
  //   if (!modal.classList.contains("nx-modal-static")) {
  //     nxMdClose(modalId);
  //   } else {
  //     // Animasi shake untuk modal static
  //     const modalContent = modal.querySelector(".nx-modal-content");
  //     if (modalContent) {
  //       modalContent.style.animation = "none";
  //       setTimeout(() => {
  //         modalContent.style.animation = "modalShake 0.3s ease-in-out";
  //       }, 10);
  //     }
  //   }
  // }
};

// Keyboard navigation
document.addEventListener("keydown", function (event) {
  if (event.key === "Escape") {
    const nxModals = document.querySelectorAll(
      '.nx-modal[style*="display: block"]'
    );
    nxModals.forEach((modal) => {
      nxMdClose(modal.id);
    });
  }
});

// Function untuk trap focus di dalam modal
function trapFocus(modal) {
  const focusableElements = modal.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );

  const firstFocusable = focusableElements[0];
  const lastFocusable = focusableElements[focusableElements.length - 1];

  // Simpan elemen yang sebelumnya difokus
  const previouslyFocused = document.activeElement;

  firstFocusable.focus();

  modal.addEventListener("keydown", function (e) {
    if (e.key === "Tab") {
      if (e.shiftKey) {
        if (document.activeElement === firstFocusable) {
          e.preventDefault();
          lastFocusable.focus();
        }
      } else {
        if (document.activeElement === lastFocusable) {
          e.preventDefault();
          firstFocusable.focus();
        }
      }
    }
  });

  // Kembalikan fokus saat modal ditutup
  return function restoreFocus() {
    previouslyFocused.focus();
  };
}

// Centered modal handling
function centerModal(modalId) {
  const modal = document.getElementById(modalId);
  const modalContent = modal.querySelector(".nx-modal-content");

  if (modal.classList.contains("nx-modal-centered")) {
    // Reset margin yang mungkin diset sebelumnya
    modalContent.style.margin = "0";

    // Pastikan modal tidak melebihi viewport
    const windowHeight = window.innerHeight;
    const modalHeight = modalContent.offsetHeight;

    if (modalHeight > windowHeight * 0.9) {
      modalContent.style.height = "90vh";
      modalContent.style.overflowY = "auto";
    } else {
      modalContent.style.height = "auto";
      modalContent.style.overflowY = "visible";
    }
  }
}

// Handle window resize for centered modals
window.addEventListener("resize", function () {
  const nxModals = document.querySelectorAll(
    '.nx-modal-centered[style*="display: block"]'
  );
  nxModals.forEach((modal) => {
    centerModal(modal.id);
  });
});

// Tambahkan fungsi untuk mengecek overflow
function checkModalOverflow(modalId) {
  const modal = document.getElementById(modalId);
  const modalBody = modal.querySelector(".nx-modal-body");

  if (modalBody.scrollHeight > modalBody.clientHeight) {
    modal.classList.add("has-scroll");
  } else {
    modal.classList.remove("has-scroll");
  }
}

// Helper function untuk mendapatkan durasi transisi
function getTransitionDuration(element) {
  const style = window.getComputedStyle(element);
  const duration = style.transitionDuration;
  return parseFloat(duration) * 1000; // Convert to milliseconds
}

// Modal Events & Callbacks
function nxModalWithCallback(modalId) {
  nxModal(modalId);
  const status = document.getElementById("callback-status");
  if (status) {
    status.innerHTML =
      '<div class="alert alert-success">Modal telah dibuka!</div>';
  }
}

function nxMdCloseWithCallback(modalId) {
  const status = document.getElementById("callback-status");
  if (status) {
    status.innerHTML =
      '<div class="alert alert-info">Modal akan ditutup...</div>';
  }

  setTimeout(() => {
    nxMdClose(modalId);
  }, 1000);
}

// Event Listeners
document.addEventListener("DOMContentLoaded", function () {
  // Tambahkan event listener untuk semua modal
  const modals = document.querySelectorAll(".nx-modal");

  modals.forEach((modal) => {
    // Before Open Event
    modal.addEventListener("modal:beforeOpen", function (e) {
      console.log("Modal akan dibuka:", e.target.id);
    });

    // After Open Event
    modal.addEventListener("modal:afterOpen", function (e) {
      console.log("Modal telah dibuka:", e.target.id);
    });

    // Before Close Event
    modal.addEventListener("modal:beforeClose", function (e) {
      console.log("Modal akan ditutup:", e.target.id);
    });

    // After Close Event
    modal.addEventListener("modal:afterClose", function (e) {
      console.log("Modal telah ditutup:", e.target.id);
    });
  });
});

// Update fungsi nxModal dan nxMdClose untuk trigger events
function triggerModalEvent(modal, eventName) {
  const event = new CustomEvent(eventName, {
    bubbles: true,
    cancelable: true,
  });
  modal.dispatchEvent(event);
}

// Event Modal Functions
window.nxModalWithCallback = function (modalId) {
  nxModal(modalId);
  const status = document.getElementById("callback-status");
  if (status) {
    status.innerHTML =
      '<div class="alert alert-success">Modal telah dibuka!</div>';
  }
};

window.nxMdCloseWithCallback = function (modalId) {
  const status = document.getElementById("callback-status");
  if (status) {
    status.innerHTML =
      '<div class="alert alert-info">Modal akan ditutup...</div>';
  }

  setTimeout(() => {
    nxMdClose(modalId);
  }, 1000);
};

// Method Modal Functions
window.openMethodModal = function (modalId) {
  nxModal(modalId);
  // Tambahkan inisialisasi khusus untuk method modal jika diperlukan
};

// Draggable Modal dengan jQuery UI dan snap to edges
function makeDraggable(modalId) {
  const modal = document.getElementById(modalId);
  const modalContent = modal.querySelector(".nx-modal-content");

  // Posisikan modal di tengah saat pertama dibuka
  const centerModal = () => {
    const windowWidth = $(window).width();
    const windowHeight = $(window).height();
    const modalWidth = $(modalContent).outerWidth();
    const modalHeight = $(modalContent).outerHeight();

    $(modalContent).css({
      position: "fixed",
      left: (windowWidth - modalWidth) / 2,
      top: (windowHeight - modalHeight) / 2,
    });
  };

  // Panggil centerModal saat pertama kali
  centerModal();

  // Inisialisasi draggable dengan jQuery UI
  $(modalContent).draggable({
    handle: ".nx-modal-header",
    cursor: "move",
    snap: true,
    snapTolerance: 20,

    start: function (event, ui) {
      $(this).addClass("dragging");
    },

    drag: function (event, ui) {
      // Batasi area drag
      const windowWidth = $(window).width();
      const windowHeight = $(window).height();
      const modalWidth = $(this).outerWidth();
      const modalHeight = $(this).outerHeight();

      ui.position.left = Math.max(
        0,
        Math.min(ui.position.left, windowWidth - modalWidth)
      );
      ui.position.top = Math.max(
        0,
        Math.min(ui.position.top, windowHeight - modalHeight)
      );
    },

    stop: function (event, ui) {
      $(this).removeClass("dragging");
    },
  });

  // Update posisi saat window resize
  $(window).on("resize", centerModal);

  // Cleanup function
  return () => {
    try {
      $(modalContent).draggable("destroy");
      $(window).off("resize", centerModal);
    } catch (e) {
      console.warn("Error destroying draggable:", e);
    }
  };
}

// Modal Stacking
let currentZIndex = 1050;

function handleModalStacking(modalId) {
  const modal = document.getElementById(modalId);
  const allModals = document.querySelectorAll(".nx-modal-stacking");

  allModals.forEach((m) => m.classList.remove("active"));
  modal.classList.add("active");
  modal.style.zIndex = ++currentZIndex;
}

// Resizable Modal
function makeResizable(modalId) {
  const modal = document.getElementById(modalId);
  const modalContent = modal.querySelector(".nx-modal-content");

  // ResizeObserver untuk memantau perubahan ukuran
  const resizeObserver = new ResizeObserver((entries) => {
    for (let entry of entries) {
      const { width, height } = entry.contentRect;
      // Trigger event saat ukuran berubah
      const event = new CustomEvent("modal:resize", {
        detail: { width, height },
      });
      modal.dispatchEvent(event);
    }
  });

  resizeObserver.observe(modalContent);
}

// Event listener untuk modal resize
document.addEventListener("modal:resize", function (e) {
  const { width, height } = e.detail;
  console.log(`Modal resized to: ${width}x${height}`);
});

// Custom Animation Controller
function setModalAnimation(modalId, animationType) {
  const modal = document.getElementById(modalId);
  const currentAnimation = modal.getAttribute("data-animation");

  // Remove current animation class if exists
  if (currentAnimation) {
    modal.classList.remove(currentAnimation);
  }

  // Add new animation class
  modal.classList.add(animationType);
  modal.setAttribute("data-animation", animationType);
}

// Transition Timing Controller
function setModalTiming(modalId, timing) {
  const modal = document.getElementById(modalId);
  const modalContent = modal.querySelector(".nx-modal-content");

  modalContent.style.setProperty("--animation-timing", timing);
}

// Special Effects Controller
function setModalEffect(modalId, effect) {
  const modal = document.getElementById(modalId);
  const currentEffect = modal.getAttribute("data-effect");

  if (currentEffect) {
    modal.classList.remove(currentEffect);
  }

  modal.classList.add(effect);
  modal.setAttribute("data-effect", effect);
}

// Animation Control Functions
window.flipModal = function (modalId) {
  setModalAnimation(modalId, "flip");
};

window.swingModal = function (modalId) {
  setModalAnimation(modalId, "swing");
};

window.bounceModal = function (modalId) {
  setModalAnimation(modalId, "bounce");
};

// Timing Control Functions
window.setModalTiming = function (modalId, timing) {
  const timings = {
    slow: "0.8s",
    normal: "0.5s",
    fast: "0.3s",
  };

  setModalTiming(modalId, timings[timing] || timing);
};

// Effect Control Functions
window.setModalEffect = function (modalId, effect) {
  const effects = {
    blur: "blur",
    glass: "glass",
    neon: "neon",
    "shadow-pulse": "shadow-pulse",
  };

  setModalEffect(modalId, effects[effect] || effect);
};

// Mobile & Touch Functions

// Touch Gesture Controller
function enableTouchGestures(modalId) {
  const modal = document.getElementById(modalId);
  const content = modal.querySelector(".nx-modal-content");
  let startY = 0;
  let currentY = 0;
  let isDragging = false;

  // Touch event handlers
  function handleTouchStart(e) {
    const touch = e.touches[0];
    startY = touch.clientY;
    isDragging = true;
    modal.classList.add("swiping");

    // Capture initial position
    const transform = window.getComputedStyle(content).transform;
    currentY = transform !== "none" ? parseInt(transform.split(",")[5]) : 0;
  }

  function handleTouchMove(e) {
    if (!isDragging) return;

    const touch = e.touches[0];
    const deltaY = touch.clientY - startY;

    // Only allow swipe down
    if (deltaY < 0) return;

    // Add resistance to swipe
    const resistance = 0.4;
    const newY = currentY + deltaY * resistance;

    content.style.transform = `translateY(${newY}px)`;

    // Add opacity effect
    const opacity = 1 - newY / (window.innerHeight * 0.5);
    modal.style.backgroundColor = `rgba(0,0,0,${opacity * 0.5})`;
  }

  function handleTouchEnd(e) {
    if (!isDragging) return;

    isDragging = false;
    modal.classList.remove("swiping");

    const transform = window.getComputedStyle(content).transform;
    const finalY = transform !== "none" ? parseInt(transform.split(",")[5]) : 0;

    // If swipe distance is greater than threshold, close modal
    if (finalY > window.innerHeight * 0.25) {
      modal.classList.add("swipe-close");
      setTimeout(() => nxMdClose(modalId), 300);
    } else {
      // Reset position
      content.style.transform = "";
      modal.style.backgroundColor = "";
    }
  }

  // Add touch event listeners
  content.addEventListener("touchstart", handleTouchStart, { passive: true });
  content.addEventListener("touchmove", handleTouchMove, { passive: false });
  content.addEventListener("touchend", handleTouchEnd);

  // Clean up function
  return () => {
    content.removeEventListener("touchstart", handleTouchStart);
    content.removeEventListener("touchmove", handleTouchMove);
    content.removeEventListener("touchend", handleTouchEnd);
  };
}

// Mobile Optimization Controller
function optimizeForMobile(modalId) {
  const modal = document.getElementById(modalId);

  // Add mobile-specific classes
  modal.classList.add("nx-modal-touch");

  // Enable bottom sheet behavior on mobile
  if (window.innerWidth <= 576) {
    modal.classList.add("nx-modal-bottom-sheet");
  }

  // Handle orientation changes
  window.addEventListener("orientationchange", () => {
    setTimeout(() => {
      centerModal(modalId);
    }, 100);
  });

  // Handle keyboard appearance on iOS
  if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
    const inputs = modal.querySelectorAll("input, textarea");
    inputs.forEach((input) => {
      input.addEventListener("focus", () => {
        modal.classList.add("keyboard-open");
      });
      input.addEventListener("blur", () => {
        modal.classList.remove("keyboard-open");
      });
    });
  }

  // Add fastclick for better touch response
  if ("addEventListener" in document) {
    document.addEventListener(
      "DOMContentLoaded",
      function () {
        FastClick.attach(modal);
      },
      false
    );
  }
}

// Responsive Behavior Controller
function handleResponsiveBehavior(modalId) {
  const modal = document.getElementById(modalId);
  const content = modal.querySelector(".nx-modal-content");

  // Handle resize events
  const resizeObserver = new ResizeObserver((entries) => {
    for (let entry of entries) {
      const { width } = entry.contentRect;

      // Adjust modal based on screen size
      if (width <= 576) {
        content.style.width = "100%";
        modal.classList.add("mobile-view");
      } else {
        content.style.width = "";
        modal.classList.remove("mobile-view");
      }
    }
  });

  resizeObserver.observe(document.body);

  // Return cleanup function
  return () => resizeObserver.disconnect();
}

// Tambahkan fungsi untuk minimize/maximize
function addWindowControls(modalId) {
  const modal = document.getElementById(modalId);
  const modalContent = modal.querySelector(".nx-modal-content");
  const header = modal.querySelector(".nx-modal-header");

  // Cek apakah controls sudah ada
  if (header.querySelector(".nx-modal-controls")) {
    return; // Jika sudah ada, jangan tambahkan lagi
  }

  // Simpan ukuran asli untuk restore
  let originalSize = {
    width: modalContent.style.width,
    height: modalContent.style.height,
    top: modalContent.style.top,
    left: modalContent.style.left,
  };

  // Tambahkan tombol controls
  const controls = document.createElement("div");
  controls.className = "nx-modal-controls";
  controls.innerHTML = `
    <button class="nx-btn-minimize" title="Minimize">─</button>
    <button class="nx-btn-maximize" title="Maximize">□</button>
    <button class="nx-btn-restore" title="Restore" style="display:none">❐</button>
  `;

  header.insertBefore(controls, header.querySelector(".nx-close"));

  // Event handlers
  controls.querySelector(".nx-btn-minimize").onclick = (e) => {
    e.stopPropagation(); // Prevent event bubbling
    minimizeModal(modalId);
  };

  controls.querySelector(".nx-btn-maximize").onclick = (e) => {
    e.stopPropagation(); // Prevent event bubbling
    maximizeModal(modalId);
  };

  controls.querySelector(".nx-btn-restore").onclick = (e) => {
    e.stopPropagation(); // Prevent event bubbling
    restoreModal(modalId);
  };

  return originalSize;
}

// Minimize Modal
function minimizeModal(modalId) {
  const modal = document.getElementById(modalId);
  const btnMinimize = modal.querySelector(".nx-btn-minimize");
  const btnMaximize = modal.querySelector(".nx-btn-maximize");
  const btnRestore = modal.querySelector(".nx-btn-restore");

  modal.classList.add("minimized");
  modal.classList.remove("maximized");

  btnMinimize.style.display = "none";
  btnMaximize.style.display = "block";
  btnRestore.style.display = "block";
}

// Maximize Modal
function maximizeModal(modalId) {
  const modal = document.getElementById(modalId);
  const modalContent = modal.querySelector(".nx-modal-content");
  const btnMinimize = modal.querySelector(".nx-btn-minimize");
  const btnMaximize = modal.querySelector(".nx-btn-maximize");
  const btnRestore = modal.querySelector(".nx-btn-restore");

  // Simpan posisi dan ukuran sebelum maximize
  if (!modal.originalState) {
    modal.originalState = {
      width: modalContent.style.width,
      height: modalContent.style.height,
      top: modalContent.style.top,
      left: modalContent.style.left,
      transform: modalContent.style.transform,
      margin: modalContent.style.margin,
      padding: modalContent.style.padding,
      borderRadius: modalContent.style.borderRadius,
      position: modalContent.style.position,
    };
  }

  // Set fullscreen styles
  Object.assign(modalContent.style, {
    position: "fixed",
    top: "0",
    left: "0",
    right: "0",
    bottom: "0",
    width: "100%",
    height: "100%",
    maxWidth: "100%",
    maxHeight: "100%",
    margin: "0",
    padding: "0",
    borderRadius: "0",
    transform: "none",
    transition: "all 0.3s ease-in-out",
  });

  // Adjust body height for scrolling
  const modalBody = modalContent.querySelector(".nx-modal-body");
  if (modalBody) {
    const headerHeight =
      modalContent.querySelector(".nx-modal-header")?.offsetHeight || 0;
    const footerHeight =
      modalContent.querySelector(".nx-modal-footer")?.offsetHeight || 0;
    modalBody.style.height = `calc(100vh - ${headerHeight + footerHeight}px)`;
    modalBody.style.overflowY = "auto";
  }

  modal.classList.add("maximized");
  modal.classList.remove("minimized");

  btnMinimize.style.display = "block";
  btnMaximize.style.display = "none";
  btnRestore.style.display = "block";

  // Disable draggable when maximized
  if ($(modalContent).hasClass("ui-draggable")) {
    $(modalContent).draggable("disable");
  }
}

// Restore Modal
function restoreModal(modalId) {
  const modal = document.getElementById(modalId);
  const modalContent = modal.querySelector(".nx-modal-content");
  const btnMinimize = modal.querySelector(".nx-btn-minimize");
  const btnMaximize = modal.querySelector(".nx-btn-maximize");
  const btnRestore = modal.querySelector(".nx-btn-restore");

  // Reset semua style yang mungkin ditambahkan
  modalContent.style.cssText = "";

  // Set style default
  Object.assign(modalContent.style, {
    position: "fixed",
    width: "50%",
    height: "auto",
    maxWidth: "90%",
    maxHeight: "90vh",
    transform: "translate(-50%, -50%)",
    top: "50%",
    left: "50%",
    transition: "all 0.3s ease-in-out",
  });

  // Reset modal body
  const modalBody = modalContent.querySelector(".nx-modal-body");
  if (modalBody) {
    modalBody.style.height = "auto";
    modalBody.style.maxHeight = "calc(90vh - 120px)";
    modalBody.style.overflowY = "auto";
  }

  // Reset modal footer
  const modalFooter = modalContent.querySelector(".nx-modal-footer");
  if (modalFooter) {
    modalFooter.style.position = "relative";
    modalFooter.style.bottom = "auto";
  }

  modal.classList.remove("minimized", "maximized");

  btnMinimize.style.display = "block";
  btnMaximize.style.display = "block";
  btnRestore.style.display = "none";

  // Re-enable draggable
  if ($(modalContent).hasClass("ui-draggable")) {
    $(modalContent).draggable("enable");

    // Reset draggable position
    $(modalContent).draggable("option", "position", {
      my: "center",
      at: "center",
      of: window,
    });
  }
}

// Tambahkan fungsi untuk mengelola multiple modals
let modalStack = [];

window.openMultiModal = function (modalId) {
  const modal = document.getElementById(modalId);
  const zIndex = 1050 + modalStack.length;

  modal.style.zIndex = zIndex;
  modal.style.display = "block";

  // Add backdrop for each modal
  const backdrop = document.createElement("div");
  backdrop.className = "nx-modal-backdrop";
  backdrop.style.zIndex = zIndex - 1;
  document.body.appendChild(backdrop);

  modalStack.push({
    modal: modal,
    backdrop: backdrop,
  });

  requestAnimationFrame(() => {
    modal.classList.add("show");
    backdrop.classList.add("show");
  });
};
window.closeMultiModal = function (modalId) {
  const modalData = modalStack.pop();
  if (!modalData) return;

  const { modal, backdrop } = modalData;

  modal.classList.remove("show");
  backdrop.classList.remove("show");

  setTimeout(() => {
    modal.style.display = "none";
    backdrop.remove();
  }, 300);
};

// Tambahkan tracking untuk modal yang sedang aktif
const activeModals = new Map(); // Menggunakan Map untuk menyimpan data modal

window.addEventListener("modalLogged", (event) => {
  const { timestamp, modals } = event.detail;

  modals.forEach((modal) => {
    const modalId = modal.id;
    const order = modal.order;

    // Cek apakah modal sudah ada dan masih terbuka
    const existingModal = activeModals.get(modalId);
    const modalElement = document.getElementById(modalId);

    if (
      !existingModal ||
      !modalElement ||
      modalElement.style.display !== "block"
    ) {
      // Simpan data modal dan tampilkan
      activeModals.set(modalId, {
        order: order,
        timestamp: timestamp,
      });

      // Tampilkan modal dengan timer untuk memastikan tetap terbuka
      const showModal = () => {
        const element = document.getElementById(modalId);
        if (element) {
          nxModalShow(modalId, order);

          // Set interval untuk memastikan modal tetap terbuka
          const keepAliveInterval = setInterval(() => {
            if (activeModals.has(modalId)) {
              const modalEl = document.getElementById(modalId);
              if (modalEl && modalEl.style.display !== "block") {
                nxModalShow(modalId, order);
              }
            } else {
              clearInterval(keepAliveInterval);
            }
          }, 100);

          // Simpan interval ID ke dalam Map
          activeModals.set(modalId, {
            ...activeModals.get(modalId),
            intervalId: keepAliveInterval,
          });
        }
      };

      // Delay sedikit untuk memastikan DOM sudah siap
      setTimeout(showModal, 50);
    } else {
      // Update order jika perlu
      modalElement.setAttribute("data-order", order);
    }
  });
});

// Single nxMdClose function definition
window.nxMdClose = function (modalId) {
  const modalData = activeModals.get(modalId);
  if (modalData && modalData.intervalId) {
    clearInterval(modalData.intervalId);
  }
  activeModals.delete(modalId);

  const modalElement = document.getElementById(modalId);
  if (modalElement) {
    modalElement.style.display = "none";
    modalElement.classList.remove("show");

    // Reset body style to remove overflow: hidden
    document.body.removeAttribute("style");

    // Reset styles
    const modalContent = modalElement.querySelector(".nx-modal-content");
    if (modalContent) {
      modalContent.style.cssText = "";
    }

    // Trigger event
    window.dispatchEvent(
      new CustomEvent("modalClosed", {
        detail: { modalId },
      })
    );
  }
};

// Cleanup saat halaman unload
window.addEventListener("unload", () => {
  activeModals.forEach((data, modalId) => {
    if (data.intervalId) {
      clearInterval(data.intervalId);
    }
  });
  activeModals.clear();
});

// Tambahkan fungsi nxModal ke window object
window.nxModal = function (modalId, order = "") {
  nxModalShow(modalId, order);
};
