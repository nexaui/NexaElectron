export class NexaFilePreview {
  constructor() {
    this.initWhenReady();
    this.supportedTypes = {
      "application/pdf": { icon: "fa-file-pdf", color: "#dc3545" },
      "application/vnd.ms-powerpoint": {
        icon: "fa-file-powerpoint",
        color: "#fd7e14",
      },
      "application/vnd.openxmlformats-officedocument.presentationml.presentation":
        { icon: "fa-file-powerpoint", color: "#fd7e14" },
      "application/msword": { icon: "fa-file-word", color: "#0d6efd" },
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        { icon: "fa-file-word", color: "#0d6efd" },
      "text/csv": { icon: "fa-file-csv", color: "#198754" },
      "application/vnd.ms-excel": { icon: "fa-file-excel", color: "#198754" },
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": {
        icon: "fa-file-excel",
        color: "#198754",
      },
      "application/json": { icon: "fa-file-code", color: "#6c757d" },
      "image/jpeg": { icon: "fa-file-image", color: "#0dcaf0" },
      "image/png": { icon: "fa-file-image", color: "#0dcaf0" },
      "image/gif": { icon: "fa-file-image", color: "#0dcaf0" },
      "image/webp": { icon: "fa-file-image", color: "#0dcaf0" },
    };
  }

  initWhenReady() {
    // Tunggu beberapa saat untuk memastikan DOM sudah dirender
    setTimeout(() => {
      this.fileInput = document.querySelector(".form-nexa-file-input");
      this.preview = document.querySelector(".form-nexa-file-preview");
      this.listpreview = document.querySelector(".form-nexa-file-list");

      if (!this.fileInput || !this.preview) {
        console.error("Elemen form tidak ditemukan, mencoba lagi...");
        // Coba lagi jika elemen belum ditemukan
        this.initWhenReady();
        return;
      }

      // console.log("Elemen form ditemukan:", {
      //   fileInput: this.fileInput,
      //   preview: this.preview,
      // });

      this.init();
    }, 100);
  }

  init() {
    this.fileInput.addEventListener("change", (event) => {
      const file = event.target.files[0];
      if (file) {
        this.handleFile(file);
      }
    });

    console.log("File preview initialized");
  }

  handleFile(file) {
    if (this.isFileTypeSupported(file.type)) {
      this.previewLocally(file);
      console.log("Handling file:", file.name, file.type);

      const reader = new FileReader();
      reader.onload = (e) => {
        const base64Content = e.target.result.split(",")[1];
        console.log("Sending file to server...");
      };

      reader.onerror = (error) => {
        console.error("Error reading file:", error);
      };

      reader.readAsDataURL(file);
    } else {
      console.log("File type not supported:", file.type);
      this.preview.innerHTML = `<div class="unsupported-file">
        <p>File type not supported</p>
        <small>Supported types: PDF, PPT, DOC, CSV, Excel, JSON</small>
      </div>`;
    }
  }

  isFileTypeSupported(fileType) {
    return (
      this.supportedTypes.hasOwnProperty(fileType) ||
      fileType.startsWith("image/")
    );
  }

  previewLocally(file) {
    console.log("Previewing file locally:", file.type);

    const fileInfo = this.supportedTypes[file.type] || {
      icon: "fa-file",
      color: "#6c757d",
    };
    const fileSize = this.formatFileSize(file.size);

    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.preview.innerHTML = `
          <div class="file-info" style="display: flex; align-items: center; padding: 15px; border: 1px solid #dee2e6; border-radius: 4px;">
            <div class="file-thumbnail" style="width: 60px; height: 60px; margin-right: 15px; border-radius: 4px; overflow: hidden;">
              <img src="${
                e.target.result
              }" style="width: 100%; height: 100%; object-fit: cover;">
            </div>
            <div class="file-details">
              <div class="file-name" style="font-weight: bold; margin-bottom: 5px;">${
                file.name
              }</div>
              <div class="file-meta" style="color: #6c757d; font-size: 0.9em;">
                ${this.getFileExtension(file.name).toUpperCase()} • ${fileSize}
              </div>
            </div>
          </div>
        `;
      };
      reader.readAsDataURL(file);
    } else {
      // Untuk file lainnya, tampilkan info file dengan icon
      this.preview.innerHTML = `
        <div class="file-info" style="display: flex; align-items: center; padding: 15px; border: 1px solid #dee2e6; border-radius: 4px;">
          <div class="file-icon" style="font-size: 2.5em; margin-right: 15px; color: ${
            fileInfo.color
          };">
            <i class="fas ${fileInfo.icon}"></i>
          </div>
          <div class="file-details">
            <div class="file-name" style="font-weight: bold; margin-bottom: 5px;">${
              file.name
            }</div>
            <div class="file-meta" style="color: #6c757d; font-size: 0.9em;">
              ${this.getFileExtension(file.name).toUpperCase()} • ${fileSize}
            </div>
          </div>
        </div>
      `;
    }
  }

  getFileExtension(filename) {
    return filename.slice(((filename.lastIndexOf(".") - 1) >>> 0) + 2);
  }

  formatFileSize(bytes) {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }
}
