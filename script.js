(() => {
  let diaryData = [];
  const activeThoughts = new Set();
  let lastThought = "";
  let isCalm = true;
  let thoughtInterval;
  let heartbeatFast;
  let heartbeatSlow;

  // HTML elementen selecteren
  const vandaagContent = document.getElementById("vandaag-content");
  const calendarContainer = document.getElementById("calendar-container");
  const popup = document.getElementById("popup");
  const popupContent = document.getElementById("popup-content");
  const closePopupBtn = document.getElementById("closePopup");

  // Data ophalen uit data.json
  fetch("data.json")
    .then((response) => response.json())
    .then((data) => {
      diaryData = data;
      showTodayEntry(diaryData);
      generateCalendar(diaryData);
    })
    .catch((error) => {
      console.error("Fout bij het ophalen van data:", error);
    });

  // Functie om "Vandaag"-entry te tonen
  function showTodayEntry(data) {
    const today = new Date();
    const todayString = today.toISOString().split("T")[0];
    const todayEntry = data.find((entry) => entry.date === todayString);

    if (!todayEntry) {
      vandaagContent.innerHTML = `
        <div class="title-container">
          <h2>Vandaag</h2>
          <span class="current-date">${formatDate(todayString)}</span>
        </div>
        <div class="today-summary">
          Nog geen notitie voor vandaag.
        </div>
      `;
      return;
    }

    vandaagContent.innerHTML = `
      <div class="title-container">
        <h2>Vandaag</h2>
        <span class="current-date">${formatDate(todayEntry.date)}</span>
      </div>
      <div class="today-summary">
        <h3>Korte samenvatting</h3>
        ${todayEntry.shortSummary}
      </div>
      <div class="today-notes">
        <h3>Volledige notities</h3>
        ${todayEntry.fullNotes}
      </div>
      <div class="today-stats">
        <div class="stat-item">
          <span class="stat-label">Stress niveau</span>
          <span class="stat-value">${todayEntry.stressScore}/10</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Angst niveau</span>
          <span class="stat-value">${todayEntry.anxietyScore}/10</span>
        </div>
        ${
          todayEntry.panicAttacks
            ? `
            <div class="stat-item">
              <span class="stat-label">Paniekaanvallen</span>
              <span class="stat-value">${todayEntry.panicAttacks}</span>
            </div>
          `
            : ""
        }
      </div>
      <button class="expand-button" aria-label="Meer details tonen"></button>
    `;

    // Event listener voor de expand button
    const expandButton = vandaagContent.querySelector(".expand-button");
    expandButton.addEventListener("click", () => {
      document.getElementById("vandaag").classList.toggle("expanded");
    });
  }

  // Functie om de kalender te genereren
  function generateCalendar(data) {
    const calendarContainer = document.getElementById("calendar-container");

    // Sorteer alle entries op datum (nieuwste eerst)
    const sortedData = data.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    // Groepeer entries per maand, maar behoud de sortering
    const entriesByMonth = groupEntriesByMonth(sortedData);

    entriesByMonth.forEach(([month, entries]) => {
      const monthBlock = document.createElement("div");
      monthBlock.classList.add("month-block");

      // Voeg maandtitel toe
      const monthTitle = document.createElement("h2");
      monthTitle.textContent = getMonthName(month, entries);
      monthBlock.appendChild(monthTitle);

      // Maak kalender grid
      const monthGrid = document.createElement("div");
      monthGrid.classList.add("calendar-container");

      // Voeg entries toe
      entries.forEach((entry) => {
        const date = new Date(entry.date);
        const dayEntry = document.createElement("div");
        dayEntry.classList.add("day-entry");
        const moodClass = getMoodClass(entry.stressScore);
        dayEntry.classList.add(moodClass);

        dayEntry.innerHTML = `
          <h3>${date.getDate()}</h3>
          <p>${entry.shortSummary}</p>
        `;

        dayEntry.addEventListener("click", () => {
          openPopup(entry);
        });

        monthGrid.appendChild(dayEntry);
      });

      monthBlock.appendChild(monthGrid);
      calendarContainer.appendChild(monthBlock);
    });
  }

  // Helper functie voor mood classes
  function getMoodClass(score) {
    if (score <= 3) return "mood-good";
    if (score <= 5) return "mood-okay";
    if (score <= 7) return "mood-moderate";
    return "mood-heavy";
  }

  // Hulpfunctie om maandnummer -> maandnaam te doen
  function getMonthName(monthNumber, entries) {
    const months = [
      "Januari",
      "Februari",
      "Maart",
      "April",
      "Mei",
      "Juni",
      "Juli",
      "Augustus",
      "September",
      "Oktober",
      "November",
      "December",
    ];

    // Haal het jaar uit de eerste entry van deze maand
    const firstEntry = entries[0];
    const year = firstEntry.date.split("-")[0];

    // Converteer monthNumber naar index (bijv. "03" -> 2)
    const monthIndex = parseInt(monthNumber, 10) - 1;

    return `${months[monthIndex]} ${year}`;
  }

  // Functie om pop-up te openen
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
        <h3>${formatDate(entry.date)}</h3>
        <label class="upload-btn">
          📷 Foto toevoegen
          <input type="file" accept="image/*" class="file-input" multiple>
        </label>
      </div>
      <div class="image-gallery" id="imageGallery">
        ${
          entry.images
            ? entry.images
                .map(
                  (img) => `
          <figure>
            <img src="${img}" alt="Foto van ${entry.date}">
          </figure>
        `
                )
                .join("")
            : ""
        }
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

    // Voeg event listener toe voor foto uploads
    const fileInput = popupText.querySelector(".file-input");
    fileInput.addEventListener("change", (e) => {
      const files = e.target.files;
      handleImageUpload(files, entry);
    });
  }

  function handleImageUpload(files, entry) {
    const gallery = document.getElementById("imageGallery");

    Array.from(files).forEach((file) => {
      // Converteer de foto naar een base64 string
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64Image = e.target.result;

        // Voeg de foto toe aan de gallery
        const figure = document.createElement("figure");
        figure.innerHTML = `<img src="${base64Image}" alt="Foto van ${entry.date}">`;
        gallery.appendChild(figure);

        // Sla de foto op in localStorage
        const storageKey = `images_${entry.date}`;
        const storedImages = JSON.parse(
          localStorage.getItem(storageKey) || "[]"
        );
        storedImages.push(base64Image);
        localStorage.setItem(storageKey, JSON.stringify(storedImages));
      };
      reader.readAsDataURL(file);
    });
  }

  // Helper functie voor datumformattering
  function formatDate(dateString) {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.getMonth();
    const year = date.getFullYear();
    const weekDay = date.getDay();

    const weekDays = [
      "Zondag",
      "Maandag",
      "Dinsdag",
      "Woensdag",
      "Donderdag",
      "Vrijdag",
      "Zaterdag",
    ];

    const months = [
      "januari",
      "februari",
      "maart",
      "april",
      "mei",
      "juni",
      "juli",
      "augustus",
      "september",
      "oktober",
      "november",
      "december",
    ];

    return `${weekDays[weekDay]} ${day} ${months[month]} ${year}`;
  }

  // Popup sluiten
  function closePopup() {
    popup.classList.remove("visible");
    setTimeout(() => {
      popup.classList.add("hidden");
    }, 300); // Wacht op de transitie
  }

  // Event listeners
  closePopupBtn.addEventListener("click", closePopup);
  popup.addEventListener("click", (event) => {
    if (event.target === popup) {
      closePopup();
    }
  });

  // Functie om de heatmap te genereren
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
      const relative = (score - minScore) / (maxScore - minScore || 1);
      // Gebruik een subtielere kleurovergang met rgba
      const baseColor =
        relative < 0.5
          ? `rgba(46, 213, 115, ${0.3 + relative * 0.7})` // groen
          : `rgba(255, 71, 87, ${0.3 + relative * 0.7})`; // rood
      return baseColor;
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

      // HIER: click event voor de popup
      dayCell.addEventListener("click", () => {
        // roep hier je bestaande popup-functie aan:
        openPopup(entry);
      });

      heatmapGrid.appendChild(dayCell);
    });

    heatmapContainer.appendChild(heatmapGrid);
  }

  // Pas renderer aan bij venstergrootte wijzigen
  window.addEventListener("resize", () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    uniforms.u_resolution.value.set(window.innerWidth, window.innerHeight);
  });

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

  function groupEntriesByMonth(entries) {
    // Sorteer entries op datum (nieuwste eerst)
    const sortedEntries = [...entries].sort((a, b) =>
      b.date.localeCompare(a.date)
    );

    // Groepeer per maand
    const entriesByMonth = new Map();

    sortedEntries.forEach((entry) => {
      const [year, month] = entry.date.split("-");
      const monthKey = month; // bijvoorbeeld "03" voor maart

      if (!entriesByMonth.has(monthKey)) {
        entriesByMonth.set(monthKey, []);
      }
      entriesByMonth.get(monthKey).push(entry);
    });

    // Converteer Map naar array van [maand, entries] paren
    return Array.from(entriesByMonth.entries());
  }

  function formatDayNumber(dateString) {
    const day = dateString.split("-")[2];
    return parseInt(day, 10); // Verwijdert voorloopnullen, bijv. "03" wordt "3"
  }

  function getColorForMood(score) {
    // Normaliseer de score naar 0-1
    const normalized = (score - 1) / 9; // Score is 1-10

    // Kleuren voor de gradient (van groen via geel naar rood)
    if (normalized <= 0.5) {
      // Van groen naar geel
      const mix = normalized * 2;
      return `rgb(${Math.round(46 + (255 - 46) * mix)}, 213, 71)`;
    } else {
      // Van geel naar rood
      const mix = (normalized - 0.5) * 2;
      return `rgb(255, ${Math.round(213 * (1 - mix))}, 71)`;
    }
  }

  function getMoodLabel(score) {
    if (score >= 8) return "Zwaar"; // 8-10: Zwaar
    if (score >= 6) return "Matig"; // 6-7: Matig
    if (score >= 4) return "Oké"; // 4-5: Oké
    return "Goed"; // 1-3: Goed
  }

  const thoughts = [
    "Wat nou als het een hartaanval is?",
    "Is die hoofdpijn wel normaal?",
    "Wat als ik flauwval?",
    "Klopt mijn hart wel normaal?",
    "Wat nou als ik een paniekaanval krijg?",
    "Is die pijn in mijn borst gevaarlijk?",
    "Wat als er iets mis is met mijn hersenen?",
    "Waarom voel ik me zo duizelig?",
    "Wat als ik hyperventileer?",
    "Is mijn bloeddruk te hoog?",
    "Wat als ik niet meer kan ademen?",
    "Wat als ik een hartaanval krijg?",
    "Is het misschien kanker?",
    "Is het misschien een hersenbloeding?",
    "Ik verlies de controle over mijn lichaam.",
    "Ik kom hier nooit meer vanaf.",
    "Ik raak in paniek.",
    "Ben ik dichtbij een WC, mocht er iets gebeuren?",
    "Ik ben zo moe en heb geen energie meer.",
    "Ik ga denk ik maar niet naar die afspraak met vrienden.",
    "Ik heb geen zin om naar school te gaan.",
    "Fuck. Ik ga dood.",
    "Wat is die piep in mijn oor nou weer?",
    "Volgens mij is dit niet normaal...",
  ];

  function getTextWidth(text) {
    const canvas =
      getTextWidth.canvas ||
      (getTextWidth.canvas = document.createElement("canvas"));
    const context = canvas.getContext("2d");
    // Zorg dat we exact dezelfde font gebruiken als in de CSS
    context.font =
      window.getComputedStyle(document.body).getPropertyValue("font-size") +
      " 'Atkinson Hyperlegible'";
    const metrics = context.measureText(text);
    // Voeg wat extra padding toe voor de text-shadow
    return metrics.width + 40; // 20px padding aan elke kant
  }

  function checkOverlap(x, y, text, scale) {
    const maxWidth = 300; // Moet overeenkomen met CSS max-width
    const textWidth = Math.min(getTextWidth(text), maxWidth) * scale;

    // Bereken geschatte hoogte gebaseerd op tekstbreedte en wrapping
    const lines = Math.ceil(getTextWidth(text) / maxWidth);
    const textHeight = 40 * lines * scale; // 40px per regel

    const padding = 30;

    const newRect = {
      left: x - textWidth / 2 - padding, // Centreer horizontaal
      right: x + textWidth / 2 + padding,
      top: y - padding,
      bottom: y + textHeight + padding,
    };

    for (const thought of activeThoughts) {
      const thoughtRect = thought.getBoundingClientRect();
      if (
        !(
          newRect.right < thoughtRect.left ||
          newRect.left > thoughtRect.right ||
          newRect.bottom < thoughtRect.top ||
          newRect.top > thoughtRect.bottom
        )
      ) {
        return true;
      }
    }
    return false;
  }

  function createThought() {
    const thoughtsContainer = document.querySelector(".anxiety-thoughts");
    const thought = document.createElement("div");

    let text;
    do {
      text = thoughts[Math.floor(Math.random() * thoughts.length)];
    } while (text === lastThought && thoughts.length > 1);

    lastThought = text;
    thought.className = "thought";
    thought.textContent = text;

    // Willekeurige grootte en opacity voor diepte-effect
    const scale = 0.8 + Math.random() * 0.4; // Schaal tussen 0.8 en 1.2
    const opacity = 0.5 + Math.random() * 0.3; // Opacity tussen 0.5 en 0.8

    thought.style.transform = `scale(${scale}) translateY(20px)`;
    thought.style.opacity = "0"; // Start met 0 voor de fade-in animatie

    // Pas de CSS custom properties aan voor de animatie
    thought.style.setProperty("--final-opacity", opacity.toString());
    thought.style.setProperty("--scale", scale.toString());

    let attempts = 0;
    let validPosition = false;
    let x, y;

    while (!validPosition && attempts < 15) {
      const angle = Math.random() * Math.PI * 2;
      const distance = 450 + Math.random() * 150;
      x = Math.cos(angle) * distance;
      y = Math.sin(angle) * distance;

      const maxY = window.innerHeight * 0.3;
      y = Math.max(Math.min(y, maxY), -maxY);

      // Pas de overlap check aan om rekening te houden met de schaal
      const containerRect = thoughtsContainer.getBoundingClientRect();
      const absoluteX = containerRect.left + containerRect.width / 2 + x;
      const absoluteY = containerRect.top + containerRect.height / 2 + y;

      if (!checkOverlap(absoluteX, absoluteY, text, scale)) {
        validPosition = true;
      }
      attempts++;
    }

    if (validPosition) {
      thought.style.left = `calc(50% + ${x}px)`;
      thought.style.top = `calc(50% + ${y}px)`;
      thoughtsContainer.appendChild(thought);
      activeThoughts.add(thought);

      setTimeout(() => {
        activeThoughts.delete(thought);
        thought.remove();
      }, 4000);
    }
  }

  // Start het genereren van gedachten
  function startThoughts() {
    thoughtInterval = setInterval(createThought, 2000);
    createThought();
  }

  function startPanicMode() {
    heartbeatFast.play();
  }

  function fadeAudio(audioElement, startVolume, endVolume, duration) {
    const steps = 60;
    const stepTime = duration / steps;
    const volumeStep = (endVolume - startVolume) / steps;
    let currentStep = 0;

    const fadeInterval = setInterval(() => {
      currentStep++;
      const newVolume = startVolume + volumeStep * currentStep;
      audioElement.volume = Math.max(0, Math.min(1, newVolume));

      if (currentStep >= steps) {
        clearInterval(fadeInterval);
        if (endVolume === 0) {
          audioElement.pause();
        }
      }
    }, stepTime);
  }

  function toggleCalm() {
    const calmButton = document.getElementById("calmButton");
    isCalm = !isCalm;

    if (isCalm) {
      // Stop nieuwe gedachten
      clearInterval(thoughtInterval);

      // Fade out snelle hartslag, fade in langzame hartslag
      fadeAudio(heartbeatFast, 0.3, 0, 2000);
      heartbeatSlow.play();
      fadeAudio(heartbeatSlow, 0, 0.2, 2000);

      // Stop de langzame hartslag na 5 seconden
      setTimeout(() => {
        if (isCalm) {
          // Check of we nog steeds in kalme modus zijn
          fadeAudio(heartbeatSlow, 0.2, 0, 2000);
          setTimeout(() => {
            heartbeatSlow.pause();
          }, 2000);
        }
      }, 5000);

      // Verwijder bestaande gedachten met fade-out
      const thoughts = document.querySelectorAll(".thought");
      thoughts.forEach((thought) => {
        thought.style.animation = "thoughtFadeOut 1s forwards";
        setTimeout(() => {
          thought.remove();
          activeThoughts.delete(thought);
        }, 1000);
      });

      calmButton.classList.add("active");
      calmButton.textContent = "Rustig...";
    } else {
      // Start gedachten weer
      startThoughts();

      // Fade out langzame hartslag (als die nog speelt), fade in snelle hartslag
      fadeAudio(heartbeatSlow, heartbeatSlow.volume, 0, 2000);
      heartbeatFast.play();
      fadeAudio(heartbeatFast, 0, 0.3, 2000);

      calmButton.classList.remove("active");
      calmButton.textContent = "Kalmeer";
    }
  }

  // Event listeners
  document.addEventListener("DOMContentLoaded", () => {
    heartbeatFast = document.getElementById("heartbeatFast");
    heartbeatSlow = document.getElementById("heartbeatSlow");

    // Stel initiële volumes in
    heartbeatFast.volume = 0;
    heartbeatSlow.volume = 0;

    // Start in kalme modus
    const calmButton = document.getElementById("calmButton");
    calmButton.classList.add("active");
    calmButton.textContent = "Rustig...";

    // Voeg click event toe
    calmButton.addEventListener("click", toggleCalm);
  });
})();
