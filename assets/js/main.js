// Form handling for medical records
document.addEventListener("DOMContentLoaded", function () {
  // Generate Nomor RM otomatis
  const noRM = document.getElementById("noRM");
  if (noRM) {
    const today = new Date();
    const year = today.getFullYear().toString().substr(-2);
    const month = (today.getMonth() + 1).toString().padStart(2, "0");
    const randomNum = Math.floor(Math.random() * 9999)
      .toString()
      .padStart(4, "0");
    noRM.value = `RM${year}${month}${randomNum}`;
  }

  // Tambah Obat Button Handler
  const tambahObatBtn = document.getElementById("tambahObat");
  const resepContainer = document.getElementById("resepContainer");

  if (tambahObatBtn && resepContainer) {
    tambahObatBtn.addEventListener("click", function () {
      const resepItem = document.createElement("div");
      resepItem.className = "resep-item";
      resepItem.innerHTML = `
                <div class="nx-row">
                    <div class="nx-col-4">
                        <div class="form-group">
                            <label for="namaObat">Nama Obat</label>
                            <input type="text" name="namaObat[]" class="form-control" required>
                        </div>
                    </div>
                    <div class="nx-col-2">
                        <div class="form-group">
                            <label for="jumlah">Jumlah</label>
                            <input type="number" name="jumlah[]" class="form-control" required>
                        </div>
                    </div>
                    <div class="nx-col-3">
                        <div class="form-group">
                            <label for="aturanPakai">Aturan Pakai</label>
                            <input type="text" name="aturanPakai[]" class="form-control" placeholder="3x1" required>
                        </div>
                    </div>
                    <div class="nx-col-3">
                        <div class="form-group">
                            <label for="keterangan">Keterangan</label>
                            <input type="text" name="keterangan[]" class="form-control" placeholder="Setelah makan">
                            <button type="button" class="btn-danger remove-obat" style="margin-top: 5px;">Hapus</button>
                        </div>
                    </div>
                </div>
            `;
      resepContainer.appendChild(resepItem);

      // Add event listener to remove button
      const removeBtn = resepItem.querySelector(".remove-obat");
      removeBtn.addEventListener("click", function () {
        resepItem.remove();
      });
    });
  }

  // Form Submission Handler
  const medicalForm = document.getElementById("medicalRecordForm");
  if (medicalForm) {
    medicalForm.addEventListener("submit", function (e) {
      e.preventDefault();

      // Basic form validation
      const requiredFields = medicalForm.querySelectorAll("[required]");
      let isValid = true;

      requiredFields.forEach((field) => {
        if (!field.value.trim()) {
          isValid = false;
          field.classList.add("error");
        } else {
          field.classList.remove("error");
        }
      });

      if (!isValid) {
        alert("Mohon lengkapi semua field yang wajib diisi");
        return;
      }

      // Collect form data
      const formData = new FormData(medicalForm);
      const medicalRecord = {
        noRM: formData.get("noRM"),
        namaPasien: formData.get("namaPasien"),
        tanggalPeriksa: formData.get("tanggalPeriksa"),
        waktuPeriksa: formData.get("waktuPeriksa"),
        dokter: formData.get("dokter"),
        vitalSigns: {
          tekananDarah: formData.get("tekananDarah"),
          suhu: formData.get("suhu"),
          beratBadan: formData.get("beratBadan"),
          tinggiBadan: formData.get("tinggiBadan"),
        },
        pemeriksaan: {
          keluhanUtama: formData.get("keluhanUtama"),
          riwayatPenyakit: formData.get("riwayatPenyakit"),
          diagnosa: formData.get("diagnosa"),
          tindakan: formData.get("tindakan"),
        },
        resepObat: [],
        catatan: formData.get("catatan"),
      };

      // Collect medicine prescriptions
      const namaObat = formData.getAll("namaObat[]");
      const jumlah = formData.getAll("jumlah[]");
      const aturanPakai = formData.getAll("aturanPakai[]");
      const keterangan = formData.getAll("keterangan[]");

      for (let i = 0; i < namaObat.length; i++) {
        medicalRecord.resepObat.push({
          namaObat: namaObat[i],
          jumlah: jumlah[i],
          aturanPakai: aturanPakai[i],
          keterangan: keterangan[i],
        });
      }

      // Here you would typically send the data to your backend
      console.log("Data Rekam Medis:", medicalRecord);

      // Show success message
      alert("Data rekam medis berhasil disimpan!");

      // Optional: Reset form
      medicalForm.reset();

      // Regenerate new RM number
      const today = new Date();
      const year = today.getFullYear().toString().substr(-2);
      const month = (today.getMonth() + 1).toString().padStart(2, "0");
      const randomNum = Math.floor(Math.random() * 9999)
        .toString()
        .padStart(4, "0");
      noRM.value = `RM${year}${month}${randomNum}`;
    });
  }

  // Add error class styling
  const style = document.createElement("style");
  style.textContent = `
        .error {
            border-color: var(--danger-color) !important;
        }
        .btn-danger {
            background-color: var(--danger-color);
            color: white;
            border: none;
            padding: 5px 10px;
            border-radius: 3px;
            cursor: pointer;
        }
        .btn-danger:hover {
            opacity: 0.9;
        }
    `;
  document.head.appendChild(style);
});
