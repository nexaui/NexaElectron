const nexaUi = new NexaUI();
console.log(nexaUi);


nexaUi.lastEvent(async function(context) {
  try {
    console.log(context)
  } catch (error) {
    console.error("Terjadi kesalahan:", error);
  }
});
