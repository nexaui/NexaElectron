export function Toast() {
  window.showBasicToast = function () {
    const toast = document.getElementById("basicToast");
    toast.classList.add("show");
    setTimeout(() => {
      toast.classList.remove("show");
    }, 3000);
  };

  // Fungsi untuk varian toast
  window.showToast = function (toastId) {
    const toast = document.getElementById(toastId);
    toast.classList.add("show");
    setTimeout(() => {
      toast.classList.remove("show");
    }, 3000);
  };

  // Fungsi untuk menutup toast
  function closeToast(toastId) {
    const toast = document.getElementById(toastId);
    toast.classList.remove("show");
  }

  // Fungsi untuk toast dengan posisi
  window.showPositionedToast = function (position) {
    const toast = document.getElementById(position);
    const toastElement = toast.querySelector(".nx-toast");
    toastElement.classList.add("show");
    setTimeout(() => {
      toastElement.classList.remove("show");
    }, 3000);
  };

  // Fungsi untuk toast dengan animasi
  window.showAnimatedToast = function (toastId) {
    const toast = document.getElementById(toastId);
    toast.classList.add("show");

    if (toastId === "slideToast") {
      // Tambahkan class slide khusus
      toast.classList.add("slide-animation");
    }

    setTimeout(() => {
      toast.classList.remove("show");
      if (toastId === "slideToast") {
        toast.classList.remove("slide-animation");
      }
    }, 3000);
  };

  // Fungsi untuk toast dengan progress bar
  window.showProgressToast = function () {
    const toast = document.getElementById("progressToast");
    const progressBar = toast.querySelector(".toast-progress");

    toast.classList.add("show");
    progressBar.style.width = "0%";

    let width = 0;
    const interval = setInterval(() => {
      width += 1;
      progressBar.style.width = width + "%";

      if (width >= 100) {
        clearInterval(interval);
        toast.classList.remove("show");
      }
    }, 30); // 3000ms / 100 = 30ms per 1%
  };

  // Fungsi untuk multiple toasts
  function showMultipleToasts() {
    const messages = ["Toast Pertama", "Toast Kedua", "Toast Ketiga"];

    messages.forEach((message, index) => {
      setTimeout(() => {
        const toast = createToast(message, index);
        document.querySelector(".toast-container").appendChild(toast);

        setTimeout(() => {
          toast.classList.add("show");
        }, 100);

        setTimeout(() => {
          toast.classList.remove("show");
          setTimeout(() => {
            toast.remove();
          }, 300);
        }, 3000);
      }, index * 500);
    });
  }

  // Helper function untuk membuat toast
  function createToast(message, index) {
    const toast = document.createElement("div");
    toast.className = "nx-toast toast-stack";
    toast.style.transform = `translateY(${index * 10}px)`;

    toast.innerHTML = `
    <div class="toast-body">
      ${message}
    </div>
  `;

    return toast;
  }
  window.showNotifikasiToast = function () {
    const toast = document.getElementById("notifikasiToast");
    toast.classList.add("show");

    // Animasi masuk dari kanan
    toast.style.transform = "translateX(100%)";
    setTimeout(() => {
      toast.style.transform = "translateX(0)";
    }, 100);

    // Auto hide setelah 5 detik
    setTimeout(() => {
      toast.style.transform = "translateX(100%)";
      setTimeout(() => {
        toast.classList.remove("show");
        toast.style.transform = "";
      }, 300);
    }, 5000);
  };
}

