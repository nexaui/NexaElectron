export class Carousel {
  constructor(element) {
    this.carousel = element;
    this.items = this.carousel.querySelectorAll(".nx-carousel-item");
    this.totalItems = this.items.length;
    this.currentIndex = 0;
    this.isPlaying = true;
    this.touchStartX = 0;
    this.touchEndX = 0;
    this.interval = null;
    this.autoplayDuration = parseInt(this.carousel.dataset.interval) || 7000;
    this.transitionDuration = 1000;

    this.init();
  }

  init() {
    this.setupControls();
    this.setupEventListeners();
    if (this.isPlaying) {
      this.startAutoplay();
    }
  }

  setupControls() {
    // Setup navigasi prev/next
    const prevBtn = this.carousel.querySelector(".nx-carousel-prev");
    const nextBtn = this.carousel.querySelector(".nx-carousel-next");

    if (prevBtn) prevBtn.addEventListener("click", () => this.prev());
    if (nextBtn) nextBtn.addEventListener("click", () => this.next());

    // Setup indikator
    const indicators = this.carousel.querySelectorAll(
      ".nx-carousel-indicators button"
    );
    indicators.forEach((indicator, index) => {
      indicator.addEventListener("click", () => this.goToSlide(index));
    });

    // Setup tombol play/pause
    const playToggle = this.carousel.querySelector(".nx-carousel-play-toggle");
    if (playToggle) {
      playToggle.addEventListener("click", () => this.togglePlay());
    }
  }

  setupEventListeners() {
    // Pause on hover
    if (this.carousel.classList.contains("nx-carousel-pause-hover")) {
      this.carousel.addEventListener("mouseenter", () => this.pause());
      this.carousel.addEventListener("mouseleave", () => this.play());
    }

    // Touch events untuk mobile
    if (this.carousel.classList.contains("nx-carousel-mobile")) {
      this.carousel.addEventListener(
        "touchstart",
        (e) => this.handleTouchStart(e),
        { passive: true }
      );
      this.carousel.addEventListener(
        "touchmove",
        (e) => this.handleTouchMove(e),
        { passive: true }
      );
      this.carousel.addEventListener("touchend", () => this.handleTouchEnd());
    }

    // Keyboard controls
    document.addEventListener("keydown", (e) => this.handleKeyboard(e));
  }

  next() {
    this.goToSlide((this.currentIndex + 1) % this.totalItems);
  }

  prev() {
    this.goToSlide(
      this.currentIndex === 0 ? this.totalItems - 1 : this.currentIndex - 1
    );
  }

  goToSlide(index) {
    // Hapus kelas active dari slide saat ini
    const currentSlide = this.items[this.currentIndex];
    const nextSlide = this.items[index];

    // Tambahkan kelas untuk animasi fade out pada slide saat ini
    currentSlide.classList.remove("active");
    currentSlide.classList.add("fade-out");

    // Siapkan slide berikutnya
    nextSlide.classList.add("preparing");

    // Tunggu animasi fade out selesai
    setTimeout(() => {
      // Hapus kelas fade-out dari slide sebelumnya
      currentSlide.classList.remove("fade-out");

      // Aktifkan slide baru dengan animasi fade in
      nextSlide.classList.remove("preparing");
      nextSlide.classList.add("active", "fade-in");

      // Update indikator
      const indicators = this.carousel.querySelectorAll(
        ".nx-carousel-indicators button"
      );
      if (indicators.length) {
        indicators[this.currentIndex].classList.remove("active");
        indicators[index].classList.add("active");
      }

      // Update index
      this.currentIndex = index;

      // Hapus kelas fade-in setelah animasi selesai
      setTimeout(() => {
        nextSlide.classList.remove("fade-in");
      }, this.transitionDuration);

      // Reset progress bar
      this.resetProgressBar();
    }, this.transitionDuration / 2);
  }

  startAutoplay() {
    if (this.interval) clearInterval(this.interval);
    setTimeout(() => {
      this.interval = setInterval(() => this.next(), this.autoplayDuration);
      this.updateProgressBar();
    }, 1000);
  }

  play() {
    if (!this.isPlaying) {
      this.isPlaying = true;
      this.startAutoplay();
      this.updatePlayToggleButton();
    }
  }

  pause() {
    if (this.isPlaying) {
      this.isPlaying = false;
      clearInterval(this.interval);
      this.pauseProgressBar();
      this.updatePlayToggleButton();
    }
  }

  togglePlay() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  handleTouchStart(e) {
    this.touchStartX = e.touches[0].clientX;
    this.pause();
  }

  handleTouchMove(e) {
    if (!this.touchStartX) return;
    this.touchEndX = e.touches[0].clientX;
  }

  handleTouchEnd() {
    if (!this.touchStartX || !this.touchEndX) return;

    const diff = this.touchStartX - this.touchEndX;
    const threshold = this.carousel.offsetWidth * 0.2;

    if (Math.abs(diff) > threshold) {
      if (diff > 0) {
        this.next();
      } else {
        this.prev();
      }
    }

    this.touchStartX = 0;
    this.touchEndX = 0;
    this.play();
  }

  handleKeyboard(e) {
    if (
      document.activeElement === this.carousel ||
      this.carousel.contains(document.activeElement)
    ) {
      switch (e.key) {
        case "ArrowLeft":
          this.prev();
          break;
        case "ArrowRight":
          this.next();
          break;
        case " ":
          this.togglePlay();
          e.preventDefault();
          break;
      }
    }
  }

  updateProgressBar() {
    const progressBar = this.carousel.querySelector(".progress-bar");
    if (progressBar) {
      progressBar.style.transition = `width ${
        this.autoplayDuration - this.transitionDuration
      }ms linear`;
      progressBar.style.width = "100%";
    }
  }

  resetProgressBar() {
    const progressBar = this.carousel.querySelector(".progress-bar");
    if (progressBar) {
      progressBar.style.transition = "none";
      progressBar.style.width = "0";
      progressBar.offsetHeight; // Force reflow
      this.updateProgressBar();
    }
  }

  pauseProgressBar() {
    const progressBar = this.carousel.querySelector(".progress-bar");
    if (progressBar) {
      const width = progressBar.offsetWidth;
      progressBar.style.transition = "none";
      progressBar.style.width = `${width}px`;
    }
  }

  updatePlayToggleButton() {
    const playToggle = this.carousel.querySelector(".nx-carousel-play-toggle");
    if (playToggle) {
      const pauseIcon = playToggle.querySelector(".pause-icon");
      const playIcon = playToggle.querySelector(".play-icon");

      if (this.isPlaying) {
        pauseIcon.style.display = "";
        playIcon.style.display = "none";
      } else {
        pauseIcon.style.display = "none";
        playIcon.style.display = "";
      }
    }
  }
}

export function initCarousels() {
  const carousels = document.querySelectorAll(".nx-carousel");
  carousels.forEach((carousel) => {
    new Carousel(carousel);
  });
}