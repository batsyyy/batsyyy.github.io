// Wait for DOM to be fully loaded
document.addEventListener("DOMContentLoaded", () => {
  console.log("Archive.js loaded");

  // Add hover effect to archive items
  const archiveItems = document.querySelectorAll(".archive-item");
  console.log("Found archive items:", archiveItems.length);

  archiveItems.forEach((item) => {
    if (!item.classList.contains("locked")) {
      item.addEventListener("click", () => {
        console.log("Archive item clicked");
        const glitchEffect = document.querySelector(".glitch");
        glitchEffect.style.display = "block";
        setTimeout(() => {
          glitchEffect.style.display = "none";
        }, 500);
      });
    }
  });

  // Random text glitch effect
  setInterval(() => {
    if (Math.random() < 0.1) {
      const items = document.querySelectorAll(".archive-item:not(.locked) h3");
      console.log("Found unlocked items for glitch:", items.length);
      if (items.length > 0) {
        const randomItem = items[Math.floor(Math.random() * items.length)];
        randomItem.style.animation = "textGlitch 0.5s";
        setTimeout(() => {
          randomItem.style.animation = "none";
        }, 500);
      }
    }
  }, 3000);

  // Handle click on the return/back button
  const backButton = document.querySelector(".back-button");
  if (backButton) {
    backButton.addEventListener("click", (event) => {
      event.preventDefault();
      const glitchEffect = document.querySelector(".glitch");
      glitchEffect.style.display = "block";
      setTimeout(() => {
        window.location.href = backButton.getAttribute("href");
      }, 1000);
    });
  }
});
