function handleChoice(choice) {
  const glitchEffect = document.querySelector(".glitch");
  glitchEffect.style.display = "block";

  // Add glitch effect before redirecting
  setTimeout(() => {
    switch (choice) {
      case "enter":
        // Disabled - no action
        break;
      case "observe":
        window.location.href = "archives.html";
        break;
      case "reject":
        window.location.href = "rejection.html";
        break;
    }
  }, 1000);
}

// Add subtle random glitch effects
setInterval(() => {
  if (Math.random() < 0.1) {
    document.body.style.filter = `hue-rotate(${Math.random() * 360}deg)`;
    setTimeout(() => {
      document.body.style.filter = "none";
    }, 100);
  }
}, 2000);

document.addEventListener("DOMContentLoaded", function () {
  const title = document.querySelector("h1.typewriter");
  const warning = document.querySelector("p.typewriter");

  // Initially hide the warning cursor
  warning.style.visibility = "hidden";

  function typeText(element, callback) {
    const words = element.querySelectorAll("span");
    let currentWord = 0;

    element.style.visibility = "visible";

    function showNextWord() {
      if (currentWord < words.length) {
        words[currentWord].classList.add("visible");
        currentWord++;
        setTimeout(showNextWord, Math.random() * 67 + 33);
      } else if (callback) {
        callback();
      }
    }

    showNextWord();
  }

  // Start with title, then do warning
  typeText(title, function () {
    // Reduced pause from 1000ms to 333ms
    setTimeout(() => {
      warning.style.visibility = "visible";
      typeText(warning, function () {
        // After warning is done, show choices
        document.querySelector(".choices").style.opacity = "1";
      });
    }, 333);
  });
});
