const nexaUi = new NexaUI();
const UserAkun = nexaUi.Oauth();
const nexaKey = nexaUi.NexaKey();
UserAkun.user().then((raw) => {
  console.log(raw)
  const rawData2 = {
    data: raw.data,
    extractor: "uid",
  };
  nexaKey.Render(rawData2);
});



const tanggal = new Date();
const NexaDate = nexaUi.Date();
const timeElement = document.querySelector(".time");

// Tambahkan pengecekan sebelum mengatur textContent
if (timeElement) {
  timeElement.textContent = NexaDate.format(tanggal, "MMMM, DD");
}






window.addEventListener("load", function () {
  const savedAvatar = localStorage.getItem("userAvatar");
  if (savedAvatar) {
    // Update gambar di #profileupdate
    document.querySelector("#profileupdate img").src = savedAvatar;

    // Update gambar di #useAvatar jika elemen tersebut ada
    const useAvatarImg = document.querySelector("#useAvatar img");
    if (useAvatarImg) {
      useAvatarImg.src = savedAvatar;
    }
  }
});

// Also load saved avatar immediately
const savedAvatar = localStorage.getItem("userAvatar");
if (savedAvatar) {
  const profileImg = document.querySelector("#profileupdate img");
  if (profileImg) {
    profileImg.src = savedAvatar;
  }
}

// Tambahkan event listener untuk beforeunload
window.addEventListener("beforeunload", function () {
  const currentAvatar = document.querySelector("#profileupdate img").src;
  if (currentAvatar && !currentAvatar.includes("waita.png")) {
    localStorage.setItem("userAvatar", currentAvatar);
  }
});

// Define the handleProfileClick function in the JavaScript file
function handleProfileClick() {
  console.log("Profile clicked via inline handler");
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";

  input.onchange = function (e) {
    const file = e.target.files[0];
    if (file) {
      // Validasi ukuran file (maksimal 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("Ukuran file terlalu besar. Maksimal 5MB");
        return;
      }

      const reader = new FileReader();
      reader.onload = function (event) {
        const imageData = event.target.result;
        // Update gambar di #profileupdate
        const profileImg = document.querySelector("#profileupdate img");
        if (profileImg) {
          profileImg.src = imageData;
        }

        // Update gambar di #useAvatar jika elemen tersebut ada
        const useAvatarImg = document.querySelector("#useAvatar img");
        if (useAvatarImg) {
          useAvatarImg.src = imageData;
        }

        // Simpan gambar ke localStorage
        try {
          localStorage.setItem("userAvatar", imageData);
        } catch (e) {
          console.warn("Gagal menyimpan gambar ke localStorage:", e);
          if (e.name === "QuotaExceededError") {
            alert("Ukuran gambar terlalu besar untuk disimpan");
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  input.click();
}

// Make the function available globally
window.handleProfileClick = handleProfileClick;