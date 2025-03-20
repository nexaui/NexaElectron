import { NexaUI } from "/assets/nexaui.bundle.min.js";
try {
  const nexaUi = new NexaUI();
  console.log("NexaUI initialized:", nexaUi);
  const UserAkun = nexaUi.Oauth();
  UserAkun.user().then((userData) => {
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
              console.log("Form data:", result.response.data);

              const res = await nexaUi
                .Network({
                  type: "v1",
                  credensial: "92712-3DC0A-008FE-5EF19",
                  // SERVER_API akan diambil dari env-config.js
                })
                .post("auth", result.response.data);

              console.log("Authentication response:", res);

              if (res.status === "success") {
                UserAkun.Signin(res, "/user");
              } else {
                console.error("Authentication failed:", res);
                // Gunakan alert sebagai pengganti Toast
                alert(
                  res.message ||
                    "Authentication failed. Please check your credentials."
                );
              }
            } catch (error) {
              console.error("Request failed:", {
                message: error.message,
                cause: error.cause,
                stack: error.stack,
              });

              let errorMessage = "Authentication failed. Please try again.";

              // Parse error message jika ada
              if (error.message.includes("HTTP Error")) {
                try {
                  const errorJson = JSON.parse(error.message.split(" - ")[1]);
                  errorMessage = errorJson.message || errorMessage;
                } catch (e) {
                  errorMessage = error.message;
                }
              } else if (error.message.includes("Failed to fetch")) {
                errorMessage =
                  "Cannot connect to server. Please check your internet connection.";
              }

              alert(errorMessage);
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
