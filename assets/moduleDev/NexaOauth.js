// Fungsi helper untuk addCookie dengan callback
import { NexaStorage } from './NexaStorage.js';

// NexaOauth
export function NexaOauth(setData,page) {
      const storage = new NexaStorage();
      console.log(setData)
      const indexDB = storage.getIndexDB();
      indexDB.add({
        key: "Oauth",
        data: setData,
      });
       window.location.href = page;
}

export async function NexaLogout(pathname='/index') {
  try {
    const storage = new NexaStorage();
    const indexDB = storage.getIndexDB();
    // Menghapus data user dari IndexDB
    const result = await indexDB.del("Oauth");
    // Menghapus cookie pathname
       window.location.href = pathname;
  } catch (error) {
    console.error("Gagal menghapus data:", error);
  }
}


export function setCookie(name, value, days) {
    const d = new Date();
    d.setTime(d.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = "expires=" + d.toUTCString();
    document.cookie = name + "=" + value + ";" + expires + ";path=/";
}

// Fungsi untuk menghapus cookie
export function deleteCookie(name) {
    document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
}

