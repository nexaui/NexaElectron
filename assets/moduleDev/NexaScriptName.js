export  function NexaScriptName(scriptName) {
  return new Promise((resolve) => {
    const checkScript = () => {
      const configScript = document.querySelector(
        `script[src*="${scriptName}"]`
      );

      if (configScript) {
        // Buat objek untuk menyimpan identifier script
        const scriptIdentifiers = {};

        // Cek data-key
        if (configScript.hasAttribute('data-key')) {
          scriptIdentifiers.key = configScript.dataset.key;
        }

        // Cek data-uid dan parse JSON jika ada
        if (configScript.hasAttribute('data-uid')) {
          try {
            // Mencoba parse JSON string
            const uidData = JSON.parse(configScript.dataset.uid);
            scriptIdentifiers.uid = uidData;
          } catch (e) {
            // Jika bukan JSON valid, gunakan nilai asli
            scriptIdentifiers.uid = configScript.dataset.uid;
            console.warn('Invalid JSON in data-uid attribute:', e);
          }
        }

        // Jika tidak ada identifier sama sekali, kembalikan null
        if (Object.keys(scriptIdentifiers).length === 0) {
          resolve(null);
          return;
        }

        // Kembalikan objek yang berisi key dan/atau uid
        resolve(scriptIdentifiers);
      } else {
        setTimeout(checkScript, 100);
      }
    };
    checkScript();
  });
}
