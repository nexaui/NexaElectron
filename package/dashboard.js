
const nexaUi = new NexaUI();
const storage = nexaUi.Storage();
const indexDB = storage.getIndexDB();
const UserAkun = nexaUi.Oauth();
const nexaKey = nexaUi.NexaKey();
nexaUi.Route({
 main:"main-content",
 index:"beranda",
 loadingWrapper:`
    <div class="nx-loading">
    <div class="nx-dot-loader">
      <span></span>
      <span></span>
      <span></span>
    </div>
  </div>
 `
})

  UserAkun.user().then((userData) => {
    if (userData) {
     const rawData2 = {
        data: userData.data,
        extractor: "uid",
      };
      nexaKey.Render(rawData2);
    } else {
      setTimeout(() => {
        nexaUi.Router("/");
      });
    }
   console.log(userData)
  });









// const nexaKey = new NexaKey();

const modeSwitch = document.querySelector("#modeSwitch");
window.setMode = function (e) {
  document.documentElement.classList.toggle("dark");
  if (modeSwitch) {
    modeSwitch.classList.toggle("active");
  }

  // Save the current mode to localStorage
  const isDarkMode = document.documentElement.classList.contains("dark");
  localStorage.setItem("darkMode", isDarkMode);

  // Update the mode text
  updateModeText(isDarkMode);
};

// Function to update mode text
function updateModeText(isDark) {
  const modeText = document.querySelector(".mode-text");
  if (modeText) {
    modeText.textContent = isDark ? "Dark Mode" : "Light Mode";
  }
}

// Add code to load saved mode preference when page loads
const savedDarkMode = localStorage.getItem("darkMode");
if (savedDarkMode === "true") {
  document.documentElement.classList.add("dark");
  if (modeSwitch) {
    modeSwitch.classList.add("active");
  }
  updateModeText(true);
} else {
  updateModeText(false);
}

const savedAvatar = localStorage.getItem("userAvatar");
if (savedAvatar) {
  document.querySelector("#useAvatar img").src = savedAvatar;
}

window.logout = async function (data) {
  await indexDB.del("Oauth");
  setTimeout(() => {
    nexaUi.Router("/");
  }, 1000);
};
