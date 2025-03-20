/**
 * @class NexaDate
 * @description Kelas untuk menangani manipulasi dan format tanggal dalam bahasa Indonesia
 */
export class NexaDate {
  /**
   * @description Mendapatkan nama bulan dalam bahasa Indonesia
   * @param {Number} bulan - Angka bulan (1-12)
   * @param {Boolean} singkat - Format singkat atau lengkap
   * @returns {String} Nama bulan dalam bahasa Indonesia
   */
  static getNamaBulan(bulan, singkat = false) {
    // Pastikan bulan adalah angka
    const nomorBulan = parseInt(bulan, 10);

    if (isNaN(nomorBulan) || nomorBulan < 1 || nomorBulan > 12) {
      console.error("Nomor bulan tidak valid:", bulan);
      return singkat ? "???" : "?????";
    }

    const daftarBulan = {
      1: ["Januari", "Jan"],
      2: ["Februari", "Feb"],
      3: ["Maret", "Mar"],
      4: ["April", "Apr"],
      5: ["Mei", "Mei"],
      6: ["Juni", "Jun"],
      7: ["Juli", "Jul"],
      8: ["Agustus", "Agt"],
      9: ["September", "Sep"],
      10: ["Oktober", "Okt"],
      11: ["November", "Nov"],
      12: ["Desember", "Des"],
    };
    return daftarBulan[nomorBulan][singkat ? 1 : 0];
  }

  /**
   * @description Mendapatkan nama hari dalam bahasa Indonesia
   * @param {Number} hari - Angka hari (0-6, 0 = Minggu)
   * @param {Boolean} singkat - Format singkat atau lengkap
   * @returns {String} Nama hari dalam bahasa Indonesia
   */
  static getNamaHari(hari, singkat = false) {
    const daftarHari = {
      0: ["Minggu", "Min"],
      1: ["Senin", "Sen"],
      2: ["Selasa", "Sel"],
      3: ["Rabu", "Rab"],
      4: ["Kamis", "Kam"],
      5: ["Jumat", "Jum"],
      6: ["Sabtu", "Sab"],
    };
    return daftarHari[hari][singkat ? 1 : 0];
  }

  /**
   * @description Format tanggal ke dalam bentuk string bahasa Indonesia
   * @param {Date} tanggal - Objek Date
   * @param {String} format - Format yang diinginkan
   * @returns {String} Tanggal yang sudah diformat
   */
  static format(tanggal, format = "DD MMMM YYYY") {
    // Konversi ke timezone Indonesia dengan cara yang lebih aman
    const localDate = new Date(
      tanggal.toLocaleString("en-US", {
        timeZone: "Asia/Makassar",
      })
    );

    const hari = localDate.getDate();
    const bulan = localDate.getMonth() + 1;
    const tahun = localDate.getFullYear();
    const jam = localDate.getHours();
    const menit = localDate.getMinutes();
    const detik = localDate.getSeconds();

    // Pastikan bulan valid sebelum mengambil nama
    if (bulan < 1 || bulan > 12) {
      console.error("Invalid month:", bulan);
      return format;
    }

    const namaHari = this.getNamaHari(localDate.getDay());
    const namaBulan = this.getNamaBulan(bulan);
    const namaBulanSingkat = this.getNamaBulan(bulan, true);

    // Buat temporary placeholder yang tidak mengandung karakter yang akan di-replace
    const MONTH_PLACEHOLDER = "@@BULAN_PANJANG@@";
    const SHORT_MONTH_PLACEHOLDER = "@@BULAN_PENDEK@@";

    return (
      format
        // Ganti nama bulan dengan placeholder dulu
        .replace(/MMMM/g, MONTH_PLACEHOLDER)
        .replace(/MMM/g, SHORT_MONTH_PLACEHOLDER)
        // Ganti format numerik bulan
        .replace(/MM/g, bulan.toString().padStart(2, "0"))
        .replace(/M/g, bulan)
        // Ganti format lainnya
        .replace(/YYYY/g, tahun)
        .replace(/YY/g, tahun.toString().slice(-2))
        .replace(/DD/g, hari.toString().padStart(2, "0"))
        .replace(/D/g, hari)
        .replace(/HH/g, jam.toString().padStart(2, "0"))
        .replace(/H/g, jam)
        .replace(/mm/g, menit.toString().padStart(2, "0"))
        .replace(/m/g, menit)
        .replace(/ss/g, detik.toString().padStart(2, "0"))
        .replace(/s/g, detik)
        .replace(/dddd/g, namaHari)
        .replace(/ddd/g, this.getNamaHari(localDate.getDay(), true))
        // Terakhir, ganti placeholder dengan nama bulan
        .replace(new RegExp(MONTH_PLACEHOLDER, "g"), namaBulan)
        .replace(new RegExp(SHORT_MONTH_PLACEHOLDER, "g"), namaBulanSingkat)
    );
  }

  /**
   * @description Mengubah tanggal menjadi string relatif (mis: "2 hari yang lalu")
   * @param {Date} tanggal - Objek Date
   * @returns {String} Teks waktu relatif
   */
  static keWaktuRelatif(tanggal) {
    const sekarang = new Date();
    const selisihWaktu = sekarang - tanggal;
    const detik = Math.floor(selisihWaktu / 1000);
    const menit = Math.floor(detik / 60);
    const jam = Math.floor(menit / 60);
    const hari = Math.floor(jam / 24);
    const bulan = Math.floor(hari / 30);
    const tahun = Math.floor(bulan / 12);

    if (detik < 60) return "baru saja";
    if (menit < 60) return `${menit} menit yang lalu`;
    if (jam < 24) return `${jam} jam yang lalu`;
    if (hari < 30) return `${hari} hari yang lalu`;
    if (bulan < 12) return `${bulan} bulan yang lalu`;
    return `${tahun} tahun yang lalu`;
  }

  /**
   * @description Menambah hari ke tanggal
   * @param {Date} tanggal - Objek Date
   * @param {Number} jumlahHari - Jumlah hari yang akan ditambahkan
   * @returns {Date} Tanggal baru
   */
  static tambahHari(tanggal, jumlahHari) {
    const hasil = new Date(tanggal);
    hasil.setDate(hasil.getDate() + jumlahHari);
    return hasil;
  }

  /**
   * @description Mengecek apakah tanggal valid
   * @param {String} tanggal - String tanggal (format: YYYY-MM-DD)
   * @returns {Boolean} True jika tanggal valid
   */
  static isTanggalValid(tanggal) {
    const date = new Date(tanggal);
    return date instanceof Date && !isNaN(date);
  }
}
