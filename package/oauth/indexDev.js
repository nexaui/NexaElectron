import { NexaUI } from "/assets/nexaui.bundle.min.js";
try {
  const nexaUi = new NexaUI();
  console.log("NexaUI initialized:", nexaUi);
  const UserAkun=nexaUi.Oauth()
    UserAkun.user()
    .then((userData) => {
      if (userData) {
        setTimeout(() => {
          nexaUi.Router("/user");
        }, 1000);
      } else {

        nexaUi.idPassword("input_password");
        const storage = nexaUi.Storage();
        nexaUi.createForm(
          {
            formid: "contactForm",
            submitid: "masuk",
            validasi: {
              email: [15], // Maximum 15MB
              password: [8],
            },
          },
          (result) => {
            (async () => {
              try {
                const res = await nexaUi.Network({
                    type: "v1",
                    credensial: "92712-3DC0A-008FE-5EF19",
                  })
                  .post("auth", result.response.data);
                if (res.status === "success") {
                	// UserAkun.Signin(res,"/user")
                } else {
                	console.log(res)
                   // nexaUi.Router("/index");
                }
              } catch (error) {
                console.error("Error details:", error);
              }
            })();
          }
        );
          console.log("Tidak ada user yang login");
      }
    });
  
} catch (error) {
  console.error("Error initializing NexaUI:", error);
}


// Gunakan API yang sudah diekspos melalui contextBridge
window.electronAPI.onOnlineStatus((event, online) => {
    if (online) {
        console.log("[Main Process] Status: Terhubung ke internet");
    } else {
        console.warn("[Main Process] Status: Tidak ada koneksi internet");
    }
});
