export class classIndexDB {
  constructor(dbName = "Database", dbVersion = 1, storeName = "Data") {
    this.dbName = dbName;
    this.dbVersion = dbVersion;
    this.storeName = storeName;
  }

  openDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);
      request.onerror = (event) =>
        reject("Error membuka database: " + event.target.error);
      request.onsuccess = (event) => resolve(event.target.result);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        const objectStore = db.createObjectStore(this.storeName, {
          keyPath: "key",
        });
        objectStore.createIndex("updated_at", "updated_at", { unique: false });
      };
    });
  }

  async saveData(key, data, updated_at) {
    const db = await this.openDB();
    return new Promise(async (resolve, reject) => {
      try {
        const transaction = db.transaction([this.storeName], "readwrite");
        const store = transaction.objectStore(this.storeName);
        const getRequest = store.get(key);

        getRequest.onsuccess = async (event) => {
          const existingData = event.target.result;
          if (existingData && existingData.updated_at >= updated_at) {
            resolve("Data sudah yang terbaru");
          } else {
            const updateRequest = store.put({
              key: key,
              data: data,
              updated_at: updated_at,
            });
            updateRequest.onsuccess = () =>
              resolve("Data berhasil disimpan/diperbarui");
            updateRequest.onerror = (event) =>
              reject("Error menyimpan/memperbarui data: " + event.target.error);
          }
        };

        getRequest.onerror = (event) =>
          reject("Error memeriksa data: " + event.target.error);
      } catch (error) {
        reject("Error: " + error);
      }
    });
  }

  async getData(key) {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      try {
        const transaction = db.transaction([this.storeName], "readonly");
        const store = transaction.objectStore(this.storeName);
        const request = store.get(key);

        request.onsuccess = (event) => {
          const result = event.target.result;
          resolve(result ? result : null);
        };
        request.onerror = (event) =>
          reject("Error mengambil data: " + event.target.error);
      } catch (error) {
        reject("Error: " + error);
      }
    });
  }

  async deleteData(key) {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], "readwrite");
      const store = transaction.objectStore(this.storeName);
      const request = store.delete(key);

      request.onsuccess = () => resolve("Data berhasil dihapus");
      request.onerror = (event) =>
        reject("Error menghapus data: " + event.target.error);
    });
  }

  async getAllData() {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], "readonly");
      const store = transaction.objectStore(this.storeName);
      const request = store.getAll();

      request.onsuccess = (event) => resolve(event.target.result);
      request.onerror = (event) =>
        reject("Error mengambil semua data: " + event.target.error);
    });
  }

  async updateData(key, newData) {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], "readwrite");
      const store = transaction.objectStore(this.storeName);
      const getRequest = store.get(key);

      getRequest.onsuccess = (event) => {
        const existingData = event.target.result;
        if (!existingData) {
          reject("Data tidak ditemukan");
          return;
        }

        const updatedObject = {
          key: key,
          data: { ...existingData.data, ...newData },
          updated_at: Date.now(),
        };

        const updateRequest = store.put(updatedObject);
        updateRequest.onsuccess = () => resolve("Data berhasil diupdate");
        updateRequest.onerror = (event) =>
          reject("Error mengupdate data: " + event.target.error);
      };

      getRequest.onerror = (event) =>
        reject("Error memeriksa data: " + event.target.error);
    });
  }

  async getLatestData() {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], "readonly");
      const store = transaction.objectStore(this.storeName);
      const index = store.index("updated_at");
      const request = index.openCursor(null, "prev");

      request.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          resolve(cursor.value);
        } else {
          resolve(null);
        }
      };
      request.onerror = (event) =>
        reject("Error mengambil data terbaru: " + event.target.error);
    });
  }
}

export class classLocalStorage {
  constructor(prefix = "") {
    this.prefix = prefix;
  }

  saveData(key, data, updated_at) {
    return new Promise((resolve) => {
      const fullKey = this.prefix + key;
      const existingData = localStorage.getItem(fullKey);

      if (existingData) {
        const parsed = JSON.parse(existingData);
        if (parsed.updated_at >= updated_at) {
          resolve("Data sudah yang terbaru");
          return;
        }
      }

      const saveObject = {
        key: key,
        data: data,
        updated_at: updated_at,
      };

      localStorage.setItem(fullKey, JSON.stringify(saveObject));
      resolve("Data berhasil disimpan/diperbarui");
    });
  }

  getData(key) {
    return new Promise((resolve) => {
      const data = localStorage.getItem(this.prefix + key);
      resolve(data ? JSON.parse(data) : null);
    });
  }

  deleteData(key) {
    return new Promise((resolve) => {
      localStorage.removeItem(this.prefix + key);
      resolve("Data berhasil dihapus");
    });
  }

  getAllData() {
    return new Promise((resolve) => {
      const allData = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith(this.prefix)) {
          const data = JSON.parse(localStorage.getItem(key));
          allData.push(data);
        }
      }
      resolve(allData);
    });
  }

  updateData(key, newData) {
    return new Promise((resolve, reject) => {
      const fullKey = this.prefix + key;
      const existingData = localStorage.getItem(fullKey);

      if (!existingData) {
        reject("Data tidak ditemukan");
        return;
      }

      const parsed = JSON.parse(existingData);
      const updatedObject = {
        key: key,
        data: { ...parsed.data, ...newData },
        updated_at: Date.now(),
      };

      localStorage.setItem(fullKey, JSON.stringify(updatedObject));
      resolve("Data berhasil diupdate");
    });
  }

  async getLatestData() {
    return new Promise((resolve) => {
      let latestData = null;
      let latestTimestamp = 0;

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith(this.prefix)) {
          const data = JSON.parse(localStorage.getItem(key));
          if (data.updated_at > latestTimestamp) {
            latestTimestamp = data.updated_at;
            latestData = data;
          }
        }
      }
      resolve(latestData);
    });
  }
}

export class classCookies {
  constructor(prefix = "app_") {
    this.prefix = prefix;
  }

  saveData(key, data, updated_at, options = {}) {
    return new Promise((resolve) => {
      const fullKey = this.prefix + key;
      const existingData = this.getCookie(fullKey);

      if (existingData) {
        const parsed = JSON.parse(existingData);
        if (parsed.updated_at >= updated_at) {
          resolve("Data sudah yang terbaru");
          return;
        }
      }

      const saveObject = {
        key: key,
        data: data,
        updated_at: updated_at,
      };

      // Default options
      const defaultOptions = {
        expires: 365, // hari
        path: "/",
        secure: false,
        sameSite: "Lax",
      };

      const cookieOptions = { ...defaultOptions, ...options };

      // Set expires
      let expires = "";
      if (cookieOptions.expires) {
        const date = new Date();
        date.setTime(
          date.getTime() + cookieOptions.expires * 24 * 60 * 60 * 1000
        );
        expires = `expires=${date.toUTCString()};`;
      }

      // Build cookie string
      let cookieString = `${fullKey}=${encodeURIComponent(
        JSON.stringify(saveObject)
      )};${expires}`;
      cookieString += `path=${cookieOptions.path};`;

      if (cookieOptions.secure) cookieString += "secure;";
      if (cookieOptions.sameSite)
        cookieString += `sameSite=${cookieOptions.sameSite};`;

      document.cookie = cookieString;
      resolve("Data berhasil disimpan/diperbarui");
    });
  }

  getCookie(key) {
    const name = this.prefix + key + "=";
    const decodedCookie = decodeURIComponent(document.cookie);
    const cookieArray = decodedCookie.split(";");

    for (let i = 0; i < cookieArray.length; i++) {
      let cookie = cookieArray[i].trim();
      if (cookie.indexOf(name) === 0) {
        return cookie.substring(name.length);
      }
    }
    return null;
  }

  getData(key) {
    return new Promise((resolve) => {
      const data = this.getCookie(key);
      resolve(data ? JSON.parse(data) : null);
    });
  }

  deleteData(key, options = {}) {
    return new Promise((resolve) => {
      const fullKey = this.prefix + key;
      const defaultOptions = {
        path: "/",
        secure: false,
        sameSite: "Lax",
      };

      const cookieOptions = { ...defaultOptions, ...options };

      // Set expired date to past
      document.cookie = `${fullKey}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=${cookieOptions.path}`;
      resolve("Data berhasil dihapus");
    });
  }

  getAllData() {
    return new Promise((resolve) => {
      const allData = [];
      const decodedCookie = decodeURIComponent(document.cookie);
      const cookieArray = decodedCookie.split(";");

      for (let i = 0; i < cookieArray.length; i++) {
        const cookie = cookieArray[i].trim();
        if (cookie.indexOf(this.prefix) === 0) {
          const equalPos = cookie.indexOf("=");
          const value = cookie.substring(equalPos + 1);
          try {
            const data = JSON.parse(value);
            allData.push(data);
          } catch (e) {
            console.error("Error parsing cookie:", e);
          }
        }
      }
      resolve(allData);
    });
  }

  updateData(key, newData, options = {}) {
    return new Promise(async (resolve, reject) => {
      const existingData = await this.getData(key);

      if (!existingData) {
        reject("Data tidak ditemukan");
        return;
      }

      const updatedObject = {
        key: key,
        data: { ...existingData.data, ...newData },
        updated_at: Date.now(),
      };

      await this.saveData(
        key,
        updatedObject.data,
        updatedObject.updated_at,
        options
      );
      resolve("Data berhasil diupdate");
    });
  }

  async getLatestData() {
    return new Promise((resolve) => {
      let latestData = null;
      let latestTimestamp = 0;
      const decodedCookie = decodeURIComponent(document.cookie);
      const cookieArray = decodedCookie.split(";");

      for (let i = 0; i < cookieArray.length; i++) {
        const cookie = cookieArray[i].trim();
        if (cookie.indexOf(this.prefix) === 0) {
          const equalPos = cookie.indexOf("=");
          const value = cookie.substring(equalPos + 1);
          try {
            const data = JSON.parse(value);
            if (data.updated_at > latestTimestamp) {
              latestTimestamp = data.updated_at;
              latestData = data;
            }
          } catch (e) {
            console.error("Error parsing cookie:", e);
          }
        }
      }
      resolve(latestData);
    });
  }
}

export class classSessionStorage {
  constructor(prefix = "app_") {
    this.prefix = prefix;
  }

  saveData(key, data, updated_at) {
    return new Promise((resolve) => {
      const fullKey = this.prefix + key;
      const existingData = sessionStorage.getItem(fullKey);

      if (existingData) {
        const parsed = JSON.parse(existingData);
        if (parsed.updated_at >= updated_at) {
          resolve("Data sudah yang terbaru");
          return;
        }
      }

      const saveObject = {
        key: key,
        data: data,
        updated_at: updated_at,
      };

      sessionStorage.setItem(fullKey, JSON.stringify(saveObject));
      resolve("Data berhasil disimpan/diperbarui");
    });
  }

  getData(key) {
    return new Promise((resolve) => {
      const data = sessionStorage.getItem(this.prefix + key);
      resolve(data ? JSON.parse(data) : null);
    });
  }

  deleteData(key) {
    return new Promise((resolve) => {
      sessionStorage.removeItem(this.prefix + key);
      resolve("Data berhasil dihapus");
    });
  }

  getAllData() {
    return new Promise((resolve) => {
      const allData = [];
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key.startsWith(this.prefix)) {
          const data = JSON.parse(sessionStorage.getItem(key));
          allData.push(data);
        }
      }
      resolve(allData);
    });
  }

  updateData(key, newData) {
    return new Promise((resolve, reject) => {
      const fullKey = this.prefix + key;
      const existingData = sessionStorage.getItem(fullKey);

      if (!existingData) {
        reject("Data tidak ditemukan");
        return;
      }

      const parsed = JSON.parse(existingData);
      const updatedObject = {
        key: key,
        data: { ...parsed.data, ...newData },
        updated_at: Date.now(),
      };

      sessionStorage.setItem(fullKey, JSON.stringify(updatedObject));
      resolve("Data berhasil diupdate");
    });
  }

  async getLatestData() {
    return new Promise((resolve) => {
      let latestData = null;
      let latestTimestamp = 0;

      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key.startsWith(this.prefix)) {
          const data = JSON.parse(sessionStorage.getItem(key));
          if (data.updated_at > latestTimestamp) {
            latestTimestamp = data.updated_at;
            latestData = data;
          }
        }
      }
      resolve(latestData);
    });
  }
}

export class NexaStorage {
  constructor() {
    this.indexDB = new classIndexDB();
    this.localStorage = new classLocalStorage();
    this.cookies = new classCookies();
    this.sessionStorage = new classSessionStorage();
  }

  getIndexDB() {
    const db = this.indexDB;
    return {
      add: async function (row) {
        try {
          const key = row.key;
          const data = row.data;
          const timestamp = Date.now();
          const hasil = await db.saveData(key, data, timestamp);
          const tersimpan = await db.getData(key);
          return tersimpan;
        } catch (error) {
          console.error("Error:", error);
        }
      },
      get: async function (key) {
        try {
          const data = await db.getData(key);
          return data;
        } catch (error) {
          console.error("Error:", error);
        }
      },
      ref: async function () {
        try {
          const allData = await db.getAllData();
          return allData;
        } catch (error) {
          console.error("Error:", error);
        }
      },
      up: async function (key, newData) {
        try {
          await db.updateData(key, newData);
          const updatedData = await db.getData(key);
          return updatedData;
        } catch (error) {
          console.error("Error:", error);
        }
      },
      del: async function (key) {
        try {
          const result = await db.deleteData(key);
          return result;
        } catch (error) {
          console.error("Error:", error);
        }
      },
      latest: async function () {
        try {
          const latestData = await db.getLatestData();
          return latestData;
        } catch (error) {
          console.error("Error:", error);
        }
      },
    };
  }

  getLocalStorage() {
    const storage = this.localStorage;
    return {
      add: async function (row) {
        try {
          const key = row.key;
          const data = row.data;
          const timestamp = Date.now();
          await storage.saveData(key, data, timestamp);
          const tersimpan = await storage.getData(key);
          return tersimpan;
        } catch (error) {
          console.error("Error:", error);
        }
      },
      get: async function (key) {
        try {
          const data = await storage.getData(key);
          return data;
        } catch (error) {
          console.error("Error:", error);
        }
      },
      ref: async function () {
        try {
          const allData = await storage.getAllData();
          return allData;
        } catch (error) {
          console.error("Error:", error);
        }
      },
      up: async function (key, newData) {
        try {
          await storage.updateData(key, newData);
          const updatedData = await storage.getData(key);
          return updatedData;
        } catch (error) {
          console.error("Error:", error);
        }
      },
      del: async function (key) {
        try {
          const result = await storage.deleteData(key);
          return result;
        } catch (error) {
          console.error("Error:", error);
        }
      },
      latest: async function () {
        try {
          const latestData = await storage.getLatestData();
          return latestData;
        } catch (error) {
          console.error("Error:", error);
        }
      },
    };
  }

  getCookies() {
    const storage = this.cookies;
    return {
      add: async function (row, options = {}) {
        try {
          const key = row.key;
          const data = row.data;
          const timestamp = Date.now();
          await storage.saveData(key, data, timestamp, options);
          const tersimpan = await storage.getData(key);
          return tersimpan;
        } catch (error) {
          console.error("Error:", error);
        }
      },
      get: async function (key) {
        try {
          const data = await storage.getData(key);
          return data;
        } catch (error) {
          console.error("Error:", error);
        }
      },
      ref: async function () {
        try {
          const allData = await storage.getAllData();
          return allData;
        } catch (error) {
          console.error("Error:", error);
        }
      },
      up: async function (key, newData, options = {}) {
        try {
          await storage.updateData(key, newData, options);
          const updatedData = await storage.getData(key);
          return updatedData;
        } catch (error) {
          console.error("Error:", error);
        }
      },
      del: async function (key, options = {}) {
        try {
          const result = await storage.deleteData(key, options);
          return result;
        } catch (error) {
          console.error("Error:", error);
        }
      },
      latest: async function () {
        try {
          const latestData = await storage.getLatestData();
          return latestData;
        } catch (error) {
          console.error("Error:", error);
        }
      },
    };
  }

  getSessionStorage() {
    const storage = this.sessionStorage;
    return {
      add: async function (row) {
        try {
          const key = row.key;
          const data = row.data;
          const timestamp = Date.now();
          await storage.saveData(key, data, timestamp);
          const tersimpan = await storage.getData(key);
          return tersimpan;
        } catch (error) {
          console.error("Error:", error);
        }
      },
      get: async function (key) {
        try {
          const data = await storage.getData(key);
          return data;
        } catch (error) {
          console.error("Error:", error);
        }
      },
      ref: async function () {
        try {
          const allData = await storage.getAllData();
          return allData;
        } catch (error) {
          console.error("Error:", error);
        }
      },
      up: async function (key, newData) {
        try {
          await storage.updateData(key, newData);
          const updatedData = await storage.getData(key);
          return updatedData;
        } catch (error) {
          console.error("Error:", error);
        }
      },
      del: async function (key) {
        try {
          const result = await storage.deleteData(key);
          return result;
        } catch (error) {
          console.error("Error:", error);
        }
      },
      latest: async function () {
        try {
          const latestData = await storage.getLatestData();
          return latestData;
        } catch (error) {
          console.error("Error:", error);
        }
      },
    };
  }
}
