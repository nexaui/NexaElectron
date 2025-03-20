const nexaUi = new NexaUI();
nexaUi.lastEvent(async function(context) {
  try {
    console.log(context)
  } catch (error) {
    console.error("Terjadi kesalahan:", error);
  }
});
