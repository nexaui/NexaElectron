import { NexaFilePreview } from "./NexaFilePreview.js";

export function createForm(ret, callback) {
  const formSelector = ret.formid;
  const submitSelector = ret.submitid;
  const fileInput = ret.fileInput;
  const validasi = ret.validasi || {}; // Get validation rules if they exist

  // Helper function to get element by selector
  const getElement = (selector) => {
    if (!selector) return null;

    // Try querySelector first
    const element = document.querySelector(selector);
    if (element) return element;

    // If not found and selector doesn't start with # or ., try as ID
    if (!selector.startsWith("#") && !selector.startsWith(".")) {
      const elementById = document.getElementById(selector);
      if (elementById) return elementById;
    }

    return null;
  };

  // Get form element using the new helper
  const form = getElement(formSelector);
  if (!form) {
    console.error(`Form with selector "${formSelector}" not found`);
    return Promise.reject(
      new Error(`Form with selector "${formSelector}" not found`)
    );
  }

  // Get submit button using the new helper
  const submitButton = getElement(submitSelector);
  if (!submitButton) {
    console.error(`Submit button with selector "${submitSelector}" not found`);
    return Promise.reject(
      new Error(`Submit button with selector "${submitSelector}" not found`)
    );
  }

  // formInput,submitForm
  if (fileInput) {
    initFileInput();
  }

  // Add file preview initialization
  const initFilePreview = () => {
    const filePreview = new NexaFilePreview();
    return filePreview;
  };

  // Initialize file preview if there are file inputs
  const fileInputs = form.querySelectorAll('input[type="file"]');
  if (fileInputs.length > 0) {
    initFilePreview();
  }

  // Fungsi untuk menginisialisasi file input
  const initFileInput = () => {
    const fileInputs = form.querySelectorAll(".form-nexa-file-input");

    fileInputs.forEach((input) => {
      const container = input.closest(".form-nexa");
      const dragDropArea = container.querySelector(".form-nexa-file-dragdrop");
      const preview = container.querySelector(".form-nexa-file-preview");
      const fileList = container.querySelector(".form-nexa-file-list");
      const errorMessage = container.querySelector(".error-message");

      // Inisialisasi NexaFilePreview jika preview tersedia
      if (preview) {
        const filePreview = new NexaFilePreview();
      }

      // Handle Drag & Drop events
      if (dragDropArea) {
        ["dragenter", "dragover", "dragleave", "drop"].forEach((eventName) => {
          dragDropArea.addEventListener(eventName, preventDefaults, false);
        });

        function preventDefaults(e) {
          e.preventDefault();
          e.stopPropagation();
        }

        ["dragenter", "dragover"].forEach((eventName) => {
          dragDropArea.addEventListener(eventName, () => {
            dragDropArea.classList.add("highlight");
          });
        });

        ["dragleave", "drop"].forEach((eventName) => {
          dragDropArea.addEventListener(eventName, () => {
            dragDropArea.classList.remove("highlight");
          });
        });

        dragDropArea.addEventListener("drop", (e) => {
          const dt = e.dataTransfer;
          const files = dt.files;
          input.files = files;

          // Trigger change event untuk memicu validasi dan preview
          const changeEvent = new Event("change");
          input.dispatchEvent(changeEvent);
        });
      }

      // Handle file validation
      input.addEventListener("change", () => {
        const maxSize = input.dataset.maxSize;
        const maxFiles = parseInt(input.dataset.maxFiles);
        const files = Array.from(input.files);

        // Reset error message
        errorMessage.textContent = "";

        // Validate number of files
        if (input.multiple && files.length > maxFiles) {
          errorMessage.textContent = `Maksimal ${maxFiles} file yang dapat diunggah`;
          input.value = "";
          return;
        }

        // Validate file size
        const maxSizeBytes = parseFileSize(maxSize);
        const totalSize = files.reduce((sum, file) => sum + file.size, 0);

        if (totalSize > maxSizeBytes) {
          errorMessage.textContent = `Total ukuran file tidak boleh lebih dari ${maxSize}`;
          input.value = "";
          return;
        }

        // Update file list
        if (fileList) {
          fileList.innerHTML = files
            .map(
              (file) => `
            <div class="file-item">
              <span class="file-name">${file.name}</span>
              <span class="file-size">(${formatFileSize(file.size)})</span>
            </div>
          `
            )
            .join("");
        }
      });
    });
  };

  // Helper function untuk parse ukuran file
  function parseFileSize(size) {
    const units = {
      B: 1,
      KB: 1024,
      MB: 1024 * 1024,
      GB: 1024 * 1024 * 1024,
    };

    const match = size.match(/^(\d+)\s*(B|KB|MB|GB)$/i);
    if (match) {
      const [, value, unit] = match;
      return parseInt(value) * units[unit.toUpperCase()];
    }
    return parseInt(size);
  }

  // Helper function untuk format ukuran file
  function formatFileSize(bytes) {
    const sizes = ["B", "KB", "MB", "GB"];
    if (bytes === 0) return "0 B";
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    return Math.round(bytes / Math.pow(1024, i), 2) + " " + sizes[i];
  }

  // Tambahkan fungsi untuk mengisi nilai input
  const setFormValues = (values) => {
    if (!values || typeof values !== "object") return;

    Object.entries(values).forEach(([name, value]) => {
      const elements = form.querySelectorAll(`[name="${name}"]`);

      elements.forEach((element) => {
        switch (element.type) {
          case "file":
            // File input tidak bisa diisi secara langsung karena alasan keamanan
            console.warn("File input values cannot be set programmatically");
            break;

          case "checkbox":
          case "radio":
            element.checked = Array.isArray(value)
              ? value.includes(element.value)
              : element.value === value;
            break;

          case "select-one":
          case "select-multiple":
            if (Array.isArray(value)) {
              Array.from(element.options).forEach((option) => {
                option.selected = value.includes(option.value);
              });
            } else {
              element.value = value;
            }
            break;

          default:
            element.value = value;
        }

        // Trigger change event untuk memicu validasi
        const event = new Event("change", { bubbles: true });
        element.dispatchEvent(event);
      });
    });
  };

  // Jika ada nilai awal di ret.value, set nilai form
  if (ret.value) {
    setFormValues(ret.value);
  }

  // Mengembalikan Promise untuk menangani data form
  return new Promise((resolve) => {
    // Fungsi untuk menghapus class error
    const removeErrorClass = (element) => {
      const formGroup = element.closest(".form-nexa");
      if (formGroup) {
        formGroup.classList.remove("form-error");
        const errorMessage = formGroup.querySelector(".error-message");
        if (errorMessage) {
          errorMessage.remove();
        }
      }
    };

    // Fungsi validasi berdasarkan tipe input
    const validateInput = (element) => {
      const type = element.type;
      const name = element.name;
      const placeholder = element.placeholder;

      // Check custom validation rules first
      if (validasi[name]) {
        if (Array.isArray(validasi[name])) {
          const [minLength, maxLength] = validasi[name];
          if (element.value.length < minLength) {
            if (type === "file") {
              return `${placeholder} minimal ${minLength}MB`;
            } else {
              return `${placeholder} minimal ${minLength} karakter`;
            }
          }
          if (maxLength && element.value.length > maxLength) {
            return `${placeholder} tidak boleh lebih dari ${maxLength} karakter`;
          }
        } else {
          const minLength = validasi[name];
          if (element.value.length < minLength) {
            return `${name} minimal ${minLength} karakter`;
          }
        }
      }

      switch (type) {
        case "email":
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(element.value)) {
            return `${name} harus berupa email yang valid`;
          }
          break;

        case "tel":
          const cleanNumber = element.value.replace(/[^\d]/g, "");
          const isStartWith08 = /^08\d{8,11}$/.test(cleanNumber);
          const isStartWith62 = /^62\d{9,12}$/.test(cleanNumber);
          const isStartWithArea = /^[2-3]\d{8,11}$/.test(cleanNumber);

          if (!element.value) {
            return `${name} tidak boleh kosong`;
          }

          if (!isStartWith08 && !isStartWith62 && !isStartWithArea) {
            return `${name} tidak valid. Gunakan format: 08xx, +62xx, 02x, atau 03x`;
          }

          if (cleanNumber.length < 8 || cleanNumber.length > 13) {
            return `${name} harus antara 8-13 digit`;
          }
          break;

        case "radio":
          const radioGroup = document.querySelectorAll(`input[name="${name}"]`);
          const isChecked = Array.from(radioGroup).some(
            (radio) => radio.checked
          );
          if (!isChecked) {
            return `${name} harus dipilih`;
          }
          break;

        case "checkbox":
          const checkboxGroup = document.querySelectorAll(
            `input[name="${name}"]:checked`
          );
          if (checkboxGroup.length === 0) {
            return `${name} minimal pilih satu`;
          }
          break;

        case "select-one":
          if (!element.value) {
            return `${name} harus dipilih`;
          }
          break;

        case "file":
          if (element.required && element.files.length === 0) {
            return `${placeholder} tidak boleh kosong`;
          }

          if (element.files.length > 0) {
            // Check total size of all files
            const totalSize = Array.from(element.files).reduce(
              (sum, file) => sum + file.size,
              0
            );

            // Get max size from validasi or data attribute
            const maxSizeMB = validasi[name]
              ? validasi[name][0]
              : element.dataset.maxSize
              ? parseInt(element.dataset.maxSize)
              : 15;
            const maxSizeBytes = maxSizeMB * 1024 * 1024;

            if (totalSize > maxSizeBytes) {
              return `${placeholder} minimal ${maxSizeMB}MB`;
            }

            // Check number of files if multiple
            if (element.multiple) {
              const maxFiles = element.dataset.maxFiles
                ? parseInt(element.dataset.maxFiles)
                : 5;
              if (element.files.length > maxFiles) {
                return `${placeholder} minimal ${maxFiles} file yang dapat diunggah`;
              }
            }

            // Check file types
            if (element.accept) {
              const allowedTypes = element.accept
                .split(",")
                .map((type) => type.trim());
              const fileType = element.files[0].type;
              const fileExtension =
                "." + element.files[0].name.split(".").pop().toLowerCase();

              const isValidType = allowedTypes.some((type) => {
                if (type.startsWith(".")) {
                  // Check file extension
                  return type.toLowerCase() === fileExtension;
                } else {
                  // Check mime type
                  return fileType.match(new RegExp(type.replace("*", ".*")));
                }
              });

              if (!isValidType) {
                return `${placeholder} tidak didukung. Gunakan: ${element.accept}`;
              }
            }
          }
          break;

        default:
          if (!element.value.trim()) {
            return `${name} tidak boleh kosong`;
          }
      }
      return null;
    };

    const addErrorClass = (element, message) => {
      const formGroup = element.closest(".form-nexa");
      if (formGroup) {
        formGroup.classList.add("form-error");
        const existingError = formGroup.querySelector(".error-message");
        if (existingError) {
          existingError.remove();
        }
        const errorDiv = document.createElement("div");
        errorDiv.className = "error-message";
        errorDiv.textContent = message;
        formGroup.appendChild(errorDiv);
      }
    };

    // Event listeners untuk validasi real-time
    form.querySelectorAll("[name]").forEach((element) => {
      const events = ["input", "change", "blur"];
      events.forEach((eventType) => {
        element.addEventListener(eventType, () => {
          const errorMessage = validateInput(element);
          if (errorMessage) {
            addErrorClass(element, errorMessage);
          } else {
            removeErrorClass(element);
          }
        });
      });
    });

    // Tambahkan event listener untuk input file
    form.querySelectorAll('input[type="file"]').forEach((element) => {
      const events = ["input", "change", "blur"];
      events.forEach((eventType) => {
        element.addEventListener(eventType, () => {
          // Validasi file
          const errorMessage = validateInput(element);
          if (errorMessage) {
            addErrorClass(element, errorMessage);
          } else {
            removeErrorClass(element);
          }

          // Preview akan ditangani oleh NexaFilePreview secara otomatis
        });
      });
    });

    // Tangani submit form
    submitButton.addEventListener("click", async (e) => {
      e.preventDefault();

      // Create data object to store form values
      const dataObject = {
        // Include initial values from ret.value if they exist
        ...(ret.value || {}),
      };

      // Get all input elements from the form
      const inputs = form.querySelectorAll("[name]");

      // Collect form data manually instead of using FormData
      for (const input of inputs) {
        if (input.type === "file") {
          // Handle file inputs separately
          if (input.files.length > 0) {
            if (input.multiple) {
              // Handle multiple files
              dataObject[input.name] = await Promise.all(
                Array.from(input.files).map(async (file) => ({
                  name: file.name,
                  size: file.size,
                  type: file.type,
                  content: await convertToBase64(file),
                }))
              );
            } else {
              // Handle single file
              const file = input.files[0];
              dataObject[input.name] = {
                name: file.name,
                size: file.size,
                type: file.type,
                content: await convertToBase64(file),
              };
            }
          }
        } else {
          // Handle regular inputs
          // Only override if input has a value
          if (input.value) {
            dataObject[input.name] = input.value;
          }
        }
      }

      // Validasi semua field sebelum submit
      let isValid = true;
      form.querySelectorAll("[name]").forEach((element) => {
        const errorMessage = validateInput(element);
        if (errorMessage) {
          addErrorClass(element, errorMessage);
          isValid = false;
        }
      });

      if (isValid && callback) {
        callback({
          response: {
            status: "success",
            message: "Form berhasil dikirim",
            data: dataObject, // Now includes both form values and initial values
          },
        });

        // Reset all form inputs manually
        inputs.forEach((input) => {
          if (input.type === "file") {
            input.value = "";
          } else {
            input.value = "";
          }
        });

        // Clear file preview if exists
        const formResponse = document.querySelector(".form-nexa-file-preview");
        if (formResponse) {
          formResponse.innerHTML = "";
        }
      }
    });

    resolve({
      setValues: setFormValues, // Ekspos fungsi setValues
    });
  });
}

// Tambahkan fungsi untuk konversi file ke base64
const convertToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      // Hapus prefix data URL (contoh: "data:image/png;base64,")
      const base64String = reader.result.split(",")[1];
      resolve(base64String);
    };
    reader.onerror = (error) => {
      console.error("Error converting file to base64:", error);
      reject(error);
    };
  });
};
