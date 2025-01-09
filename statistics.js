document.addEventListener("DOMContentLoaded", () => {
  // Controleer eerst of we op de statistieken pagina zijn
  const isPanicChartPresent = document.getElementById("panicChart");

  // Menu functionaliteit
  const menuToggle = document.querySelector(".menu-toggle");
  const mainNav = document.querySelector(".main-nav");

  menuToggle.addEventListener("click", () => {
    mainNav.classList.toggle("active");
    document.body.classList.toggle("menu-open");
  });

  // Sluit menu bij klikken buiten menu
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".main-nav") && !e.target.closest(".menu-toggle")) {
      mainNav.classList.remove("active");
      document.body.classList.remove("menu-open");
    }
  });

  // Popup sluiten met kruisje
  document.getElementById("closePopup").addEventListener("click", () => {
    const popup = document.getElementById("popup");
    popup.classList.remove("visible");
    setTimeout(() => popup.classList.add("hidden"), 300);
  });

  // Popup sluiten bij klikken buiten de content
  document.getElementById("popup").addEventListener("click", (e) => {
    if (e.target.id === "popup") {
      const popup = document.getElementById("popup");
      popup.classList.remove("visible");
      setTimeout(() => popup.classList.add("hidden"), 300);
    }
  });

  // Data ophalen en statistieken genereren
  fetch("data.json")
    .then((response) => response.json())
    .then((data) => {
      // Word cloud
      const wordStats = analyzeWords(data);
      const wordList = document.querySelector(".word-list");
      if (wordList) {
        wordList.innerHTML = wordStats
          .map(
            ([word, count]) => `
            <div class="word-item" style="font-size: ${Math.max(
              1,
              Math.min(2, count / 5)
            )}rem">
              <span class="word">${word}</span>
              <span class="count">${count}x</span>
            </div>
          `
          )
          .join("");
      }

      // Alleen uitvoeren als we op de statistieken pagina zijn
      if (isPanicChartPresent) {
        createMoodChart(data);
        generateHeatmap(data);
        createPanicChart(data);
      }
    })
    .catch((error) => {
      console.error("Fout bij het ophalen van data:", error);
    });
});

function analyzeWords(data) {
  // Woorden die we willen negeren
  const stopWords = [
    "de",
    "het",
    "een",
    "en",
    "in",
    "van",
    "met",
    "op",
    "te",
    "voor",
    "maar",
    "was",
    "had",
    "bij",
    "aan",
    "die",
    "der",
    "ook",
    "om",
    "wat",
    "door",
    "heel",
    "wel",
    "nog",
    "weer",
    "naar",
    "toe",
    "uit",
    "dag",
    "erg",
    "best",
    "niet",
    "mijn",
    "toen",
    "daar",
    "dus",
    "toch",
    "echt",
    "dat",
    "heb",
  ];

  const wordCount = {};

  data.forEach((entry) => {
    if (entry.fullNotes) {
      // Converteer naar lowercase en verwijder leestekens
      const words = entry.fullNotes
        .toLowerCase()
        .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "")
        .split(/\s+/);

      words.forEach((word) => {
        if (word.length > 2 && !stopWords.includes(word)) {
          wordCount[word] = (wordCount[word] || 0) + 1;
        }
      });
    }
  });

  // Sorteer op frequentie en pak top 10
  return Object.entries(wordCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10);
}

function createMoodChart(data) {
  const moodData = data
    .map((entry) => {
      let mood = 5; // standaard waarde

      if (entry.fullNotes && entry.fullNotes.includes("Mood:")) {
        const moodMatch = entry.fullNotes.match(/Mood:\s*(\d+(?:\.\d+)?)/);
        if (moodMatch) {
          mood = parseFloat(moodMatch[1]);
        }
      }

      return {
        date: entry.date,
        mood: mood,
      };
    })
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  const ctx = document.getElementById("moodChart").getContext("2d");
  new Chart(ctx, {
    type: "line",
    data: {
      labels: moodData.map((d) => d.date),
      datasets: [
        {
          label: "Stemming (1-10)",
          data: moodData.map((d) => d.mood),
          borderColor: "rgba(46, 213, 115, 0.8)",
          backgroundColor: "rgba(46, 213, 115, 0.1)",
          fill: true,
          tension: 0.4,
          pointRadius: 4,
          pointHoverRadius: 6,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          mode: "index",
          intersect: false,
          backgroundColor: "rgba(17, 17, 17, 0.9)",
          titleColor: "#fff",
          bodyColor: "#fff",
          borderColor: "rgba(255, 255, 255, 0.1)",
          borderWidth: 1,
        },
      },
      scales: {
        y: {
          min: 0,
          max: 10,
          grid: {
            color: "rgba(255, 255, 255, 0.1)",
          },
          ticks: {
            color: "rgba(255, 255, 255, 0.7)",
          },
        },
        x: {
          grid: {
            color: "rgba(255, 255, 255, 0.1)",
          },
          ticks: {
            color: "rgba(255, 255, 255, 0.7)",
            maxRotation: 45,
            minRotation: 45,
          },
        },
      },
    },
  });
}

// Heatmap functie uit script.js
function generateHeatmap(data) {
  const heatmapContainer = document.getElementById("heatmap-container");
  if (!heatmapContainer) return;

  // 1. min en max stressScore bepalen om kleuren te schalen
  let minScore = Infinity;
  let maxScore = -Infinity;
  data.forEach((entry) => {
    if (entry.stressScore < minScore) minScore = entry.stressScore;
    if (entry.stressScore > maxScore) maxScore = entry.stressScore;
  });

  // 2. Hulpfunctie: zet stressScore om in kleur (van groen naar rood)
  function getColorForScore(score) {
    // Normaliseer de score naar 1-10 schaal
    const normalizedScore =
      ((score - minScore) / (maxScore - minScore)) * 9 + 1;

    if (normalizedScore <= 3) {
      return "rgba(46, 213, 115, 0.6)"; // mood-good
    } else if (normalizedScore <= 5) {
      return "rgba(255, 213, 71, 0.6)"; // mood-okay
    } else if (normalizedScore <= 7) {
      return "rgba(255, 142, 71, 0.6)"; // mood-moderate
    } else {
      return "rgba(255, 71, 87, 0.6)"; // mood-heavy
    }
  }

  // container leeghalen voor het geval je wil verversen
  heatmapContainer.innerHTML = "";

  // 3. Maak de grid-container
  const heatmapGrid = document.createElement("div");
  heatmapGrid.classList.add("heatmap-grid");

  // 4. Voor elk entry een 'cell'
  data.forEach((entry) => {
    const dayCell = document.createElement("div");
    dayCell.classList.add("heatmap-cell");
    dayCell.title = `${entry.date}: Stress Score ${entry.stressScore}`;
    dayCell.style.backgroundColor = getColorForScore(entry.stressScore);

    // Voeg click event toe
    dayCell.addEventListener("click", () => {
      openPopup(entry);
    });

    heatmapGrid.appendChild(dayCell);
  });

  heatmapContainer.appendChild(heatmapGrid);
}

// Paniekaanvallen grafiek functie uit script.js
function createPanicChart(data) {
  const ctx = document.getElementById("panicChart").getContext("2d");

  const panicData = data.map((entry) => ({
    date: entry.date,
    attacks: entry.panicAttacks || 0,
  }));

  new Chart(ctx, {
    type: "bar",
    data: {
      labels: panicData.map((d) => d.date),
      datasets: [
        {
          label: "Aantal paniekaanvallen",
          data: panicData.map((d) => d.attacks),
          backgroundColor: "rgba(255, 71, 87, 0.6)",
          borderColor: "rgba(255, 71, 87, 1)",
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1,
          },
        },
      },
    },
  });
}

// Popup functionaliteit
function openPopup(entry) {
  const popup = document.getElementById("popup");
  const popupText = popup.querySelector(".popup-text");

  const notesHtml = entry.fullNotes
    ? entry.fullNotes
        .split("\n\n")
        .map((paragraph) => `<p>${paragraph}</p>`)
        .join("")
    : `<p>${entry.shortSummary}</p>`;

  popupText.innerHTML = `
    <div class="popup-header">
      <h3>${entry.date}</h3>
    </div>
    <div class="popup-content">
      ${notesHtml}
    </div>
    <div class="popup-footer">
      <p>
        <strong>Stress niveau:</strong> ${entry.stressScore}/10
        &nbsp;&nbsp;|&nbsp;&nbsp;
        <strong>Angst niveau:</strong> ${entry.anxietyScore}/10
        ${
          entry.panicAttacks
            ? `&nbsp;&nbsp;|&nbsp;&nbsp;
        <strong>Paniekaanvallen:</strong> ${entry.panicAttacks}`
            : ""
        }
      </p>
    </div>
  `;

  popup.classList.remove("hidden");
  void popup.offsetWidth; // Force reflow
  popup.classList.add("visible");
}

// Sluit popup event listener
document.getElementById("closePopup").addEventListener("click", () => {
  document.getElementById("popup").classList.add("hidden");
});

// Sluit popup bij klikken buiten de content
document.getElementById("popup").addEventListener("click", (e) => {
  if (e.target.id === "popup") {
    document.getElementById("popup").classList.add("hidden");
  }
});
