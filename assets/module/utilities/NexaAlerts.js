/**
 * ==============================
 * Class: Alerts
 * ==============================
 */
export function Alerts() {
  const timerAlerts = document.querySelectorAll(".nx-alert-timer");

  timerAlerts.forEach((alert) => {
    const duration = parseInt(alert.dataset.duration) || 5000;
    const timerBar = alert.querySelector(".nx-timer-bar");

    if (timerBar) {
      timerBar.style.animationDuration = `${duration}ms`;
    }

    setTimeout(() => {
      alert.style.opacity = "0";
      setTimeout(() => alert.remove(), 300);
    }, duration);
  });
}