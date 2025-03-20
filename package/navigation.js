const nexaUi = new NexaUI();
nexaUi.Route({
 main:"page-content",
 index:"route/page1",
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