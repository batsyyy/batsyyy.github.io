// IIFE om variabelen af te schermen
(() => {
    let diaryData = [];
  
    // HTML elementen selecteren
    const vandaagContent = document.getElementById('vandaag-content');
    const calendarContainer = document.getElementById('calendar-container');
    const popup = document.getElementById('popup');
    const popupContent = document.getElementById('popup-content');
    const closePopupBtn = document.getElementById('closePopup');
  
    // Data ophalen uit data.json
    fetch('data.json')
      .then(response => response.json())
      .then(data => {
        diaryData = data;
        // We gaan ervan uit dat de laatste entry in data "vandaag" is,
        // maar je kunt dit natuurlijk aanpassen.
        showTodayEntry(diaryData[0]);  // of data[data.length - 1]
        generateCalendar(diaryData);
      })
      .catch(error => {
        console.error('Fout bij het ophalen van data:', error);
      });
  
    // Functie om "Vandaag"-entry te tonen
    function showTodayEntry(entry) {
      if (!entry) return;
      vandaagContent.innerHTML = `
        <p>${entry.shortSummary}</p>
        <p>Stress/angstscore: ${entry.stressScore}/${entry.anxietyScore}</p>
      `;
    }
  
    // Functie om de kalender te genereren
    function generateCalendar(data) {
        // Maak een object om alle entries per maand te groeperen
        // Bijvoorbeeld { '2024-11': [entry1, entry2], '2024-12': [entry3, ...], ... }
        const groupedByMonth = {};
      
        data.forEach(entry => {
          // Haal de jaar-maand uit de entry (bijv. '2024-11')
          const [year, month] = entry.date.split('-');
          const yearMonth = `${year}-${month}`; // '2024-11'
      
          if (!groupedByMonth[yearMonth]) {
            groupedByMonth[yearMonth] = [];
          }
          groupedByMonth[yearMonth].push(entry);
        });
      
        // Sorteer de keys (jaar-maand) zodat November 2024 niet na januari 2025 komt
        const sortedMonths = Object.keys(groupedByMonth).sort();
      
        // Leeg eerst eventueel je container, als daar al iets in stond
        calendarContainer.innerHTML = '';
      
        // Loop door alle gesorteerde maanden en maak een eigen blok
        sortedMonths.forEach(yearMonth => {
          // Maak een element voor de maand-titel
          const monthTitle = document.createElement('h2');
          // Eventueel parse je de maand en het jaar hier (bijv. '2024-11' => 'November 2024')
          const [y, m] = yearMonth.split('-');
          const monthName = getMonthName(parseInt(m)); // zie de functie hieronder
          monthTitle.textContent = `${monthName} ${y}`;
      
          // Maak een container voor de grid van deze maand
          const monthContainer = document.createElement('div');
          // Geef ‘m dezelfde classes als je oude #calendar-container had
          // Of geef ‘m een eigen class, bijvoorbeeld "calendar-container"
          monthContainer.classList.add('calendar-container');
      
          // Maak voor elke entry in deze maand een tegel
          groupedByMonth[yearMonth].forEach(entry => {
            const dayDiv = document.createElement('div');
            dayDiv.classList.add('day-entry');
      
            dayDiv.innerHTML = `
              <h3>${entry.date}</h3>
              <p>${entry.shortSummary}</p>
            `;
      
            // Event listener voor de pop-up
            dayDiv.addEventListener('click', () => {
              openPopup(entry);
            });
      
            monthContainer.appendChild(dayDiv);
          });
      
// Maak een wrapper voor de maand
const monthBlock = document.createElement('div');
monthBlock.classList.add('month-block');

// Eerst de titel erin
monthBlock.appendChild(monthTitle);

// Dan de grid-container erin
monthBlock.appendChild(monthContainer);

// Daarna pas de hele wrapper in 'calendarContainer'
calendarContainer.appendChild(monthBlock);

        });
      }
      
      // Hulpfunctie om maandnummer -> maandnaam te doen
      function getMonthName(monthNumber) {
        // Let op, index: '01' => 1 => 'Januari'
        const months = [
          'Januari','Februari','Maart','April','Mei','Juni',
          'Juli','Augustus','September','Oktober','November','December'
        ];
        // monthNumber is een getal 1-12
        // let op dat parseInt('01') => 1, wat index 0-based is
        // dus we moeten months[1-1] = months[0] (Januari) etc.
        return months[monthNumber - 1];
      }
      
    // Functie om pop-up te openen
    function openPopup(entry) {
        // Vervang elk \n\n door een afsluitende </p> en een nieuwe <p>:
        const notesHtml = entry.fullNotes
          .split('\n\n')
          .map(paragraph => `<p>${paragraph}</p>`)
          .join('');
      
        popupContent.innerHTML = `
          <h3>${entry.date}</h3>
          ${notesHtml}
          <p><strong>Stress/angstscore:</strong> ${entry.stressScore}/${entry.anxietyScore}</p>
        `;
        popup.classList.remove('hidden');
      }
      
  
    // Event listener om pop-up te sluiten
    closePopupBtn.addEventListener('click', () => {
      popup.classList.add('hidden');
    });

    // Popup sluiten als je buiten de content klikt
popup.addEventListener('click', (event) => {
    // check of de klik echt in de overlay was (en niet in de child-div "popup-content")
    if (event.target === popup) {
      popup.classList.add('hidden');
    }
  });
  

    // Functie om de heatmap te genereren
    function generateHeatmap(data) {
        const heatmapContainer = document.getElementById('heatmap-container');
        if (!heatmapContainer) return;
      
        // 1. min en max stressScore bepalen om kleuren te schalen
        let minScore = Infinity;
        let maxScore = -Infinity;
        data.forEach(entry => {
          if (entry.stressScore < minScore) minScore = entry.stressScore;
          if (entry.stressScore > maxScore) maxScore = entry.stressScore;
        });
      
        // 2. Hulpfunctie: zet stressScore om in kleur (van groen naar rood)
        function getColorForScore(score) {
          const relative = (score - minScore) / (maxScore - minScore || 1);
          const hue = 120 - Math.round(120 * relative); 
          return `hsl(${hue}, 100%, 50%)`;
        }
      
        // container leeghalen voor het geval je wil verversen
        heatmapContainer.innerHTML = '';
      
        // 3. Maak de grid-container
        const heatmapGrid = document.createElement('div');
        heatmapGrid.classList.add('heatmap-grid');
      
        // 4. Voor elk entry een 'cell'
        data.forEach(entry => {
          const dayCell = document.createElement('div');
          dayCell.classList.add('heatmap-cell');
          dayCell.title = `${entry.date}: Stress Score ${entry.stressScore}`;
          dayCell.style.backgroundColor = getColorForScore(entry.stressScore);
      
          // HIER: click event voor de popup
          dayCell.addEventListener('click', () => {
            // roep hier je bestaande popup-functie aan:
            openPopup(entry); 
          });
      
          heatmapGrid.appendChild(dayCell);
        });
      
        heatmapContainer.appendChild(heatmapGrid);
      }
      
  
  // Voeg de aanroep toe ná de kalender-generatie:
  fetch('data.json')
    .then(response => response.json())
    .then(data => {
      diaryData = data;
      showTodayEntry(diaryData[0]);
      generateCalendar(diaryData);
  
      // **Hier de heatmap aanroepen**
      generateHeatmap(diaryData);
    })
    .catch(error => {
      console.error('Fout bij het ophalen van data:', error);
    });
  
  
  })();

  // ... bestaande code hierboven ...

