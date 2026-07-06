// Fix undefined logo in ERPNext 16
$(document).ready(function () {
  // Fix navbar logo
  $(".navbar-brand img, .app-logo")
    .attr("src", "/assets/blue_theme/images/splash.png")
    .show();

  // Fix any undefined images in app switcher
  $('img[src*="undefined"]').attr(
    "src",
    "/assets/blue_theme/images/splash.png",
  );

  // Watch for dynamically added items
  setInterval(function () {
    $('img[src*="undefined"]').attr(
      "src",
      "/assets/blue_theme/images/splash.png",
    );
  }, 1000);
});
