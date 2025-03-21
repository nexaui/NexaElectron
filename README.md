# NexaElectron

NexaElectron adalah framework aplikasi desktop yang dibangun dengan Electron dan Express, dirancang untuk membuat aplikasi desktop modern dengan teknologi web. Framework ini mengintegrasikan sistem transformasi HTML yang canggih untuk pengembangan UI berbasis komponen.

## Ikhtisar

NexaElectron terdiri dari dua komponen utama:

1. **Aplikasi Electron (main.js)** - Mengelola jendela desktop dan siklus hidup aplikasi
2. **Server NexaExpress (NexaExpress.js)** - Menangani fungsionalitas backend dan transformasi HTML

## Fitur

- 🔄 Reload otomatis selama pengembangan
- 🎨 Pengembangan UI berbasis komponen
- 🌍 Sistem transformasi HTML (NexaTextInput, NexaButton, NexaModal, dll.)
- 📄 Navigasi dinamis dengan penanganan URL cerdas
- 🔗 Pemasukan komponen dengan mudah melalui tag require
- 🌐 Manajemen konfigurasi lingkungan

## Arsitektur

### Aplikasi Electron (main.js)

Aplikasi Electron mengelola jendela desktop dan berintegrasi dengan server NexaExpress:

- Membuat jendela browser utama dengan dimensi yang ditentukan
- Mengkonfigurasi menu konteks untuk mode pengembangan dan produksi
- Menangani event siklus hidup aplikasi
- Auto-reload selama pengembangan untuk iterasi cepat

```javascript
// Contoh: Membuat jendela utama
function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    autoHideMenuBar: true,
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  // Memuat konten dari server Express lokal
  mainWindow.loadURL(`http://localhost:${port}`);

  // Konfigurasi jendela tambahan...
}
```

### Server NexaExpress (NexaExpress.js)

Server NexaExpress menangani semua fungsionalitas backend dan transformasi HTML:

- Menyajikan file statis dari direktori `public`
- Mentransformasi HTML dengan berbagai prosesor komponen
- Menyediakan endpoint API untuk navigasi dan transformasi komponen
- Menangani konfigurasi lingkungan

Modul transformasi utama:

- `Nexautility` - Transformasi utilitas inti
- `NexaTextInput` - Transformasi komponen input teks
- `NexaButton` - Transformasi komponen tombol
- `NexaModal` - Transformasi komponen modal
- `NexaextractorKey` - Utilitas ekstraksi kunci
- `NexaOnclick` - Transformasi penangan event klik

```javascript
// Contoh: Middleware transformasi HTML
app.use(async (req, res, next) => {
  // Memproses file HTML
  if (req.path.endsWith(".html") || req.path.endsWith("/")) {
    // Mentransformasi konten HTML dengan prosesor komponen
    let transformedContent = content;
    transformedContent = await Nexautility.transform(transformedContent);
    transformedContent = await NexaTextInput.transform(transformedContent);
    transformedContent = await NexaButton.transform(transformedContent);
    transformedContent = await NexaModal.transform(transformedContent);
    // Transformasi tambahan...

    return res.send(transformedContent);
  }
  next();
});
```

## Penanganan URL

NexaElectron mendukung pola URL khusus untuk navigasi efisien:

- Segmen `/page/` - Digunakan untuk routing halaman
- Segmen `/list/` - Digunakan untuk tampilan daftar
- Segmen `/n/` - Digunakan untuk jalur navigasi

Server secara otomatis memproses pola-pola ini untuk memuat konten HTML yang benar.

## Pemasukan Komponen

Komponen dapat disertakan menggunakan tag require:

```html
<div require="path/to/component"></div>
```

Ini akan menyertakan konten dari `path/to/component.html` selama transformasi.

## Konfigurasi Lingkungan

Aplikasi secara otomatis menghasilkan file konfigurasi lingkungan di `assets/env-config.js` berdasarkan pengaturan dalam `config.js`:

```javascript
window.ENV_CONFIG = {
  SERVER_HOST: "your-server-host",
  SERVER_API: "your-api-endpoint",
  WS_HOST: "your-websocket-host",
};
```

## Mode Pengembangan

Dalam mode pengembangan, NexaElectron menyediakan:

- Reload otomatis aplikasi ketika file berubah
- Menu konteks yang diperluas dengan alat pengembang
- Logging detail

Aktifkan mode pengembangan dengan mengatur:

```javascript
process.env.NODE_ENV = "development";
```

## Mode Produksi

Dalam mode produksi, NexaElectron:

- Menonaktifkan alat pengembang di menu konteks
- Mengoptimalkan kinerja
- Mengurangi logging

## Memulai

1. Instal dependensi:

   ```
   npm install
   ```

2. Konfigurasi aplikasi Anda di `config.js`

3. Jalankan dalam mode pengembangan:

   ```
   npm run dev
   ```

4. Build untuk produksi:
   ```
   npm run build
   ```
## Lisensi

[Tambahkan informasi lisensi Anda di sini]
