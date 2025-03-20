// fungsi-fungsi Progress
export function Progress() {
  window.currentProgress = 0;
  window.updateProgress = function (value) {
    const progressBar = document.getElementById("interactiveProgress");
    if (progressBar) {
      window.currentProgress = Math.max(0, Math.min(100, value));
      progressBar.style.width = window.currentProgress + "%";
      progressBar.textContent = window.currentProgress + "%";
    }
  };
  window.increaseProgress = function () {
    window.updateProgress(window.currentProgress + 10);
  };
  window.decreaseProgress = function () {
    window.updateProgress(window.currentProgress - 10);
  };
  return updateProgress(0);
}
