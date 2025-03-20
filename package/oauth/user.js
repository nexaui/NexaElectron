import { NexaUI } from "/assets/nexaui.bundle.min.js";
// window.nexaExtractor.init();
  try {
    const nexaUi = new NexaUI();
    const UserAkun = nexaUi.Oauth();
    console.log("NexaUI initialized:", nexaUi);
    const nav = nexaUi.Navigation();
    const even = nexaUi.NexaEvent();
    even.register({
      logout: logout,
      halaman:halaman,
    });
    even.Handler();
    function halaman() {
      // nav.load('/contact', 'page');
     
    }
    function logout(data) {
      UserAkun.Logout("/index");
    }

    const storage = nexaUi.Storage();

    // Mengecek user yang sedang login
    const userData = await nexaUi.Oauth().user();
    if (userData) {
      const vars = nexaUi.NexaVars({
        data: userData.data,
      });
      console.log(userData);
    }
  } catch (error) {
    console.error("Error initializing NexaUI:", error);
  }


// Auto-initialize when loaded


// Gunakan API yang sudah diekspos melalui contextBridge
window.electronAPI.onOnlineStatus((event, online) => {
  if (online) {
    console.log("[Main Process] Status: Terhubung ke internet");
  } else {
    console.warn("[Main Process] Status: Tidak ada koneksi internet");
  }
});
