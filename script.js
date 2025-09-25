const content = document.getElementById('content');
const boot = document.getElementById('boot');
let sectionEndIndices = {};

const plantContainers = {
    Ökologie: document.getElementById('plant-container-oekologie'),
    Soziales: document.getElementById('plant-container-soziales'),
    Ökonomie: document.getElementById('plant-container-oekonomie')
};

const plantImages = {
    Ökologie: document.getElementById('plant-oekologie'),
    Soziales: document.getElementById('plant-soziales'),
    Ökonomie: document.getElementById('plant-oekonomie')
};

const fires = {
    Ökologie: document.getElementById('fire-oekologie'),
    Soziales: document.getElementById('fire-soziales'),
    Ökonomie: document.getElementById('fire-oekonomie')
};

const sections = SECTIONS;
let currentStep = 0;
let answers = [];
let screens = [];
let fazitIndices = {};
let plantPositions = {};
let fireAnimationIntervals = {};

const fireFrames = {
    1: new Image(),
    2: new Image()
};

fireFrames[1].src = "images/fire1.PNG";
fireFrames[2].src = "images/fire2.PNG";

let questionSubStep = 0;
let currentQuestionState = {};

let totalScore = 0;
let maxTotalScore = 0;
let ecoScore = 0;
let maxEcoScore = 0;
let socialScore = 0;
let maxSocialScore = 0;
let economyScore = 0;
let maxEconomyScore = 0;


// === Screens aufbauen ===
function buildScreens() {
    screens.push({type: 'intro'});
    sections.forEach((section, idx) => {
        section.questions.forEach(q => screens.push({type: 'question', section: section.name, text: q}));
        screens.push({type: 'fazit', section: section.name});
    });
    screens.push({type: 'result'});
}

function findFazitIndices() {
    sections.forEach(section => {
        const idx = screens.findIndex(s => s.type === 'fazit' && s.section === section.name);
        fazitIndices[section.name] = idx;
    });
}

function findSectionEndIndices() {
    sections.forEach((section, idx) => {
        let lastIndex;
        lastIndex = screens.findIndex(s => s.type === 'fazit' && s.section === section.name);
        sectionEndIndices[section.name] = lastIndex;
    });
}

buildScreens();
findFazitIndices();
findSectionEndIndices();

window.addEventListener('load', () => {
    for (let section of sections) {
        calculatePlantPosition(section.name, fazitIndices[section.name]);
    }
});

function calculatePlantPosition(sectionName, stepIndex) {
    const total = screens.length - 1;
    const progress = Math.min(1, Math.max(0, stepIndex / total));
    const containerWidth = document.querySelector('.progress-container').offsetWidth;
    const plantWidth = plantContainers[sectionName].offsetWidth;
    plantPositions[sectionName] = progress * (containerWidth - plantWidth) + 40;
    plantContainers[sectionName].style.left = plantPositions[sectionName] + 'px';
}

function startFireAnimation(section) {
    const fireDiv = fires[section];
    if (!fireDiv || fireAnimationIntervals[section]) return;

    fireDiv.style.display = 'block';

    const frame1 = fireDiv.querySelector('.frame1');
    const frame2 = fireDiv.querySelector('.frame2');
    let showFirst = true;

    frame1.style.opacity = 1;
    frame2.style.opacity = 0;

    fireAnimationIntervals[section] = setInterval(() => {
        showFirst = !showFirst;
        frame1.style.opacity = showFirst ? 1 : 0;
        frame2.style.opacity = showFirst ? 0 : 1;
    }, 200);
}

function stopFireAnimation(section) {
    const fireDiv = fires[section];
    if (fireAnimationIntervals[section]) {
        clearInterval(fireAnimationIntervals[section]);
        delete fireAnimationIntervals[section];
    }
    if (fireDiv) {
        fireDiv.style.display = 'none';
    }
}

function render() {
    content.classList.remove('show');
    setTimeout(() => {
        content.innerHTML = '';
        const screen = screens[currentStep];
        const plantContainers = document.querySelectorAll('.plant-container');
        const app = document.getElementById('app');

        if (screen.type === 'intro') {
            app.style.backgroundColor = 'rgba(252, 249, 236, 1)';
        } else {
            app.style.backgroundColor = 'rgba(252, 246, 222, 0.95)'; // zurücksetzen
        }


        // === Pflanzenbilder und Feuer pro Pflanze ===
        sections.forEach((section, idx) => {
            const name = section.name;
            let img;
            calculatePartialResults();

            let scorePercent;
            if (name === 'Ökologie') {
                scorePercent = safePercent(ecoScore, maxEcoScore);
            } else if (name === 'Soziales') {
                scorePercent = safePercent(socialScore, maxSocialScore);
            } else if (name === 'Ökonomie') {
                scorePercent = safePercent(economyScore, maxEconomyScore);
            }

            if (currentStep > sectionEndIndices[name]) {
                if (scorePercent > 60) {
                    img = `images/plant${idx + 1}_blooms.PNG`;
                } else {
                    img = `images/plant${idx + 1}_died.PNG`;
                }

            } else {
                img = `images/plant${idx + 1}_neutral.PNG`;
            }

            plantImages[name].src = img;

            if (img.includes('_died')) {
                plantImages[name].classList.add('dead-plant');
            } else {
                plantImages[name].classList.remove('dead-plant');
            }

            if (screen.type === 'fazit' && screen.section === name && scorePercent <= 60) {
                fires[name].style.display = 'block';
                startFireAnimation(name);
            } else {
                fires[name].style.display = 'none';
                stopFireAnimation(name);
            }
        });

        // === Screens ===
        if (screen.type === 'intro') {
            plantContainers.forEach(pc => pc.classList.add('hidden'));
            content.innerHTML = `
                <h1>Willkommen zum Nachhaltigkeitsfragebogen</h1>
                  <p>
                    Für eine fundierte Bewertung der Nachhaltigkeit eines Produkts ist es wichtig,
                    sämtliche Stufen der Lieferkette zu betrachten. Dabei sind ökologische, soziale
                    und ökonomische Aspekte sowohl in ihren positiven als auch negativen Ausprägungen
                    zu berücksichtigen.
                  </p>
                  <p>
                    Zur eigenständigen Beurteilung der relevanten Einflussfaktoren können die
                    nachfolgenden Fragen als Orientierung dienen. Bitte beantworte jede Frage
                    nach sorgfältiger Recherche mit „Ja“ oder „Nein“.
                  </p>
                  <p>
                    Falls eine Frage auf das betrachtete Produkt thematisch nicht zutrifft, kann
                    ihre Relevanz auf 0 gesetzt werden, sodass sie nicht in die Bewertung einfließt.
                    Für alle zutreffenden Fragen ist eine Relevanzeinschätzung auf einer Skala von
                    1 bis 3 vorzunehmen. Diese basiert auf der individuellen Einschätzung der
                    Bedeutung der jeweiligen Frage für die Nachhaltigkeit des Produkts.
                  </p>
                  <p>
                    Wenn eine Frage grundsätzlich relevant ist, jedoch keine verlässlichen
                    Informationen dazu auffindbar sind, ist die Option „Keine Aussage“ zu wählen.
                    Im Anschluss ist zu beurteilen, ob davon auszugehen ist, dass die fehlende
                    Information durch das Unternehmen bewusst verschleiert wurde.
                  </p>
                  <p>
                    Ein Fortschrittsindikator, dargestellt durch den Teddybär im Boot, zeigt an,
                    wie viele Fragen noch offen sind. Nach Abschluss aller Bewertungen wird das
                    Ergebnis der Nachhaltigkeitsanalyse in Form eines Punktwerts sowie als
                    prozentualer Wert dargestellt.
                  </p>
                <button class="button" id="start">Start</button>
            `;
            document.getElementById('start').onclick = () => next();
        } else if (screen.type === 'question') {
            plantContainers.forEach(pc => pc.classList.remove('hidden'));
            renderQuestionScreen(screen);
        } else if (screen.type === 'fazit') {

            // Wähle passenden Text je nach Abschnitt
            let fazitText = '';
            if (screen.section === 'Ökologie') {
                fazitText = 'Das erste Thema <strong>Ökologie</strong> ist nun geschafft. Es folgen nun die Themen <strong>Soziales</strong> und <strong>Ökonomie</strong>.';
            } else if (screen.section === 'Soziales') {
                fazitText = 'Das zweite Thema <strong>Soziales</strong> ist nun geschafft. Es folgt das Thema <strong>Ökonomie</strong>.';
            } else if (screen.section === 'Ökonomie') {
                fazitText = 'Das dritte Thema <strong>Ökonomie</strong> ist nun geschafft. Es folgt nun die <strong>Gesamtbewertung</strong>.';
            } else {
                fazitText = 'Zwischenfazit';
            }

            content.innerHTML = `
        ${renderCategoryNav(screen.section)}
        <p>${fazitText}</p>
        <div>
            ${currentStep > 0 ? '<button class="button" id="back">Zurück</button>' : ''}
            <button class="button" id="next">Weiter</button>
        </div>
    `;

            document.getElementById('next').onclick = () => next();
            if (document.getElementById('back'))
                document.getElementById('back').onclick = () => back();

        } else if (screen.type === 'result') {
            renderResultScreen();
        }

        content.classList.add('show');
        updateBootPosition();
    }, 100);
}

function renderCategoryNav(activeSection) {
    const sections = ['Ökologie', 'Soziales', 'Ökonomie'];
    return `
    <div class="category-nav">
      ${sections.map(section => `
        <span class="${section === activeSection ? 'active' : ''}">${section}</span>
      `).join('')}
    </div>
  `;
}


function renderResultScreen() {
    const progressContainer = document.querySelector('.progress-container');
    progressContainer.classList.add('hidden');
    document.body.classList.add('no-background');

    const percent = safePercent(totalScore, maxTotalScore);
    const teddyImage = getTeddyImageForScore(percent);


    content.innerHTML = `
        <h2>Ergebnis</h2>
        <div class="result-intro">
          <div class="result-text">
            <p>Das Ergebnis spiegelt die Nachhaltigkeit des analysierten Produkts wider und basiert auf den gegebenen Antworten.</p>
            <p>Die Bewertung wird in drei Kategorien unterteilt: Ein Ergebnis im Bereich von 0 % bis 33 % wird der roten Kategorie (schlecht) zugeordnet, ein Ergebnis zwischen 33% und 66% der gelben Kategorie (zufriedenstellend), und ein Ergebnis von 66% bis 100% der grünen Kategorie (gut).</p>
          </div>
          <div class="teddy-result">
            <img src="${teddyImage}" alt="Teddy" class="teddy-image">
          </div>
        </div>
        <div id="results">
            ${renderResultBar("Gesamtbewertung", totalScore, maxTotalScore, "large")}
            ${renderResultBar("Ökologie", ecoScore, maxEcoScore, "small")}
            ${renderResultBar("Soziales", socialScore, maxSocialScore, "small")}
            ${renderResultBar("Ökonomie", economyScore, maxEconomyScore, "small")}
        </div>
    `;
    positionMarkers();
}

function getTeddyImageForScore(percent) {
    if (percent <= 33) {
        return 'images/teddy_sad.PNG';
    } else if (percent <= 66) {
        return 'images/teddy_okay.PNG';
    } else {
        return 'images/teddy_happy.PNG';
    }
}


function renderResultBar(title, score, maxScore, sizeClass) {
    const percent = safePercent(score, maxScore);
    return `
        <div class="result-bar ${sizeClass}">
            <div class="bar-info">
                <span class="bar-title">${title}: ${percent}% (${score} von ${maxScore} Punkten)</span>
            </div>
            <div class="bar-track">
                <div class="bar-segment red"></div>
                <div class="bar-segment yellow"></div>
                <div class="bar-segment green"></div>
                <div class="bar-marker">
                    <div class="marker-line"></div>
                </div>
            </div>
        </div>
    `;
}

function safePercent(value, max) {
    if (max === 0) return 0;
    return Math.round((value / max) * 100);
}

function positionMarkers() {
    const bars = document.querySelectorAll('.result-bar');

    bars.forEach(bar => {
        const titleText = bar.querySelector('.bar-title').textContent;
        let match = titleText.match(/(\d+)%/);
        let percent = match ? parseInt(match[1]) : 0;

        const track = bar.querySelector('.bar-track');
        const marker = bar.querySelector('.bar-marker');

        const trackWidth = track.offsetWidth;
        let markerLeft = Math.min(Math.max((percent / 100) * trackWidth, 0), trackWidth);

        if (percent >= 100) {
            markerLeft -= 4;
        }

        marker.style.left = `${markerLeft}px`;
    });
}



function updateBootPosition() {
    const total = screens.length - 1;
    const progress = Math.min(1, Math.max(0, currentStep / total));
    const containerWidth = document.querySelector('.progress-container').offsetWidth;
    const bootWidth = boot.offsetWidth;
    const left = progress * (containerWidth - bootWidth);
    boot.style.left = left + 'px';
}

function renderQuestionScreen(screen) {
    content.innerHTML = `
    ${renderCategoryNav(screen.section)}
    <p class="question-text">${screen.text}</p>
    <div class="importance-question">
      <p><strong>Wie relevant ist diese Frage?</strong></p>
      <div class="likert-bar">
        <label class="bar-option">
          <input type="radio" name="importance" value="0">
          <span>0</span>
        </label>
        <label class="bar-option">
          <input type="radio" name="importance" value="1">
          <span>1</span>
        </label>
        <label class="bar-option">
          <input type="radio" name="importance" value="2">
          <span>2</span>
        </label>
        <label class="bar-option">
          <input type="radio" name="importance" value="3">
          <span>3</span>
        </label>
      </div>
    </div>

    <p><strong>Wie lautet deine Antwort?</strong></p>
    <div class="options">
      <label><input type="radio" name="answer" value="yes"> Ja</label>
      <label><input type="radio" name="answer" value="no"> Nein</label>
      <label><input type="radio" name="answer" value="unknown"> Keine Aussage</label>
    </div>

    <div id="concealment-block" style="display:none; margin-top:1rem;">
      <p><strong>Wurden die Informationen absichtlich verschleiert?</strong></p>
      <div class="options">
        <label><input type="radio" name="concealment" value="yes"> Ja</label>
        <label><input type="radio" name="concealment" value="no"> Nein</label>
      </div>
    </div>

    <div style="margin-top:1rem;">
      ${currentStep > 0 ? '<button class="button" id="back">Zurück</button>' : ''}
      <button class="button" id="next">Weiter</button>
    </div>
  `;

    // Event: Zusatzfrage nur zeigen wenn "Keine Aussage" gewählt
    document.querySelectorAll('input[name="answer"]').forEach(el => {
        el.addEventListener('change', (e) => {
            const concealmentBlock = document.getElementById('concealment-block');
            if (e.target.value === 'unknown') {
                concealmentBlock.style.display = 'block';
            } else {
                concealmentBlock.style.display = 'none';
            }
        });
    });

    if (document.getElementById('back')) {
        document.getElementById('back').onclick = () => back();
    }

    document.getElementById('next').onclick = () => {
        // Abfragen aller Werte
        const importanceEl = document.querySelector('input[name="importance"]:checked');
        const answerEl = document.querySelector('input[name="answer"]:checked');

        if (!importanceEl) {
            alert('Bitte eine Relevanz wählen.');
            return;
        }
        const importance = parseInt(importanceEl.value);
        if (importance === 0) {
            // Frage fällt raus
            saveAnswer({
                question: screen.text,
                importance,
                answer: null,
                concealment: null,
                pointsPossible: 0,
                pointsEarned: 0
            });
            next();
            return;
        }

        if (!answerEl) {
            alert('Bitte eine Antwort wählen.');
            return;
        }
        const answer = answerEl.value;

        let concealment = null;
        if (answer === 'unknown') {
            const concealmentEl = document.querySelector('input[name="concealment"]:checked');
            if (!concealmentEl) {
                alert('Bitte beantworten Sie die Verschleierungsfrage.');
                return;
            }
            concealment = (concealmentEl.value === 'yes');
        }

        // Punkteberechnung
        let pointsPossible = 0;
        let pointsEarned = 0;
        if (answer === 'yes') {
            pointsPossible = importance;
            pointsEarned = importance;
        } else if (answer === 'no') {
            pointsPossible = importance;
            pointsEarned = 0;
        } else if (answer === 'unknown') {
            if (concealment) {
                pointsPossible = importance;
                pointsEarned = 0;
            } else {
                // nicht absichtlich verschleiert → fällt raus
                pointsPossible = 0;
                pointsEarned = 0;
            }
        }

        saveAnswer({
            question: screen.text,
            importance,
            answer,
            concealment,
            pointsPossible,
            pointsEarned
        });

        next();
    };

    // ---- Restore previous answers if they exist ----
    const saved = answers[currentStep];

    if (saved) {
        // Pre-select importance
        if (saved.importance !== null) {
            const impEl = document.querySelector(`input[name="importance"][value="${saved.importance}"]`);
            if (impEl) impEl.checked = true;
        }

        // Pre-select answer
        if (saved.answer) {
            const ansEl = document.querySelector(`input[name="answer"][value="${saved.answer}"]`);
            if (ansEl) ansEl.checked = true;

            // Show concealment block if answer was 'unknown'
            if (saved.answer === 'unknown') {
                document.getElementById('concealment-block').style.display = 'block';
            }
        }

        // Pre-select concealment
        if (saved.concealment !== null) {
            const conEl = document.querySelector(`input[name="concealment"][value="${saved.concealment ? 'yes' : 'no'}"]`);
            if (conEl) conEl.checked = true;
        }
    }
}

function calculatePartialResults() {
    ecoScore = 0;
    maxEcoScore = 0;
    socialScore = 0;
    maxSocialScore = 0;
    economyScore = 0;
    maxEconomyScore = 0;

    screens.forEach((screen, idx) => {
        if (idx >= currentStep) return;
        if (screen.type !== 'question') return;

        const ans = answers[idx];
        if (!ans) return;

        if (screen.section === 'Ökologie') {
            ecoScore += ans.pointsEarned;
            maxEcoScore += ans.pointsPossible;
        } else if (screen.section === 'Soziales') {
            socialScore += ans.pointsEarned;
            maxSocialScore += ans.pointsPossible;
        } else if (screen.section === 'Ökonomie') {
            economyScore += ans.pointsEarned;
            maxEconomyScore += ans.pointsPossible;
        }
    });
}


function calculateResults() {
    totalScore = 0;
    maxTotalScore = 0;
    ecoScore = 0;
    maxEcoScore = 0;
    socialScore = 0;
    maxSocialScore = 0;
    economyScore = 0;
    maxEconomyScore = 0;

    screens.forEach((screen, idx) => {
        if (screen.type !== 'question') return;

        const ans = answers[idx];
        if (!ans) return;

        totalScore += ans.pointsEarned;
        maxTotalScore += ans.pointsPossible;

        if (screen.section === 'Ökologie') {
            ecoScore += ans.pointsEarned;
            maxEcoScore += ans.pointsPossible;
        } else if (screen.section === 'Soziales') {
            socialScore += ans.pointsEarned;
            maxSocialScore += ans.pointsPossible;
        } else if (screen.section === 'Ökonomie') {
            economyScore += ans.pointsEarned;
            maxEconomyScore += ans.pointsPossible;
        }
    });
}


function saveAnswer(answerObj) {
    answers[currentStep] = answerObj;
}

function next() {
    currentStep++;
    if (screens[currentStep]?.type === 'result') {
        calculateResults();
    }
    render();
}

function back() {
    if (currentStep > 0) {
        currentStep--;
        render();
    }
}

window.addEventListener('resize', () => {
    for (let section of sections) {
        calculatePlantPosition(section.name, fazitIndices[section.name]);
    }
    updateBootPosition();
});

render();
