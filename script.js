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
fireFrames[2].src = "images/fire2.png";

let questionSubStep = 0;
let currentQuestionState = {};


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

        // === Pflanzenbilder und Feuer pro Pflanze ===
        sections.forEach((section, idx) => {
            const name = section.name;
            let img;
            if (currentStep <= sectionEndIndices[name]) {
                img = `images/plant${idx + 1}_blooms.png`;
            } else {
                img = `images/plant${idx + 1}_died.PNG`;
            }
            plantImages[name].src = img;

            if (screen.type === 'fazit' && screen.section === name) {
                fires[name].style.display = 'block';
                startFireAnimation(name);
            } else {
                fires[name].style.display = 'none';
                stopFireAnimation(name);
            }
        });

        // === Screens ===
        if (screen.type === 'intro') {
            content.innerHTML = `
                <h1>Willkommen zum Nachhaltigkeitsfragebogen</h1>
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit...</p>
                <button class="button" id="start">Start</button>
            `;
            document.getElementById('start').onclick = () => next();
        } else if (screen.type === 'question') {
            renderQuestionScreen(screen);
        } else if (screen.type === 'fazit') {
            content.innerHTML = `
                <h2>Zwischenfazit – ${screen.section}</h2>
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit...</p>
                <div>
                    ${currentStep > 0 ? '<button class="button" id="back">Zurück</button>' : ''}
                    <button class="button" id="next">Weiter</button>
                </div>
            `;
            document.getElementById('next').onclick = () => next();
            if (document.getElementById('back'))
                document.getElementById('back').onclick = () => back();
        } else if (screen.type === 'result') {
            let totalPossible = 0;
            let totalEarned = 0;
            answers.forEach(a => {
                totalPossible += a.pointsPossible;
                totalEarned += a.pointsEarned;
            });
            const percent = totalPossible > 0 ? ((totalEarned / totalPossible) * 100).toFixed(1) : 0;
            content.innerHTML = `
                <h1>Ergebnis</h1>
                <p>Erreichte Punkte: ${totalEarned} von ${totalPossible}</p>
                <p>Score: ${percent}%</p>
            `;
        }

        content.classList.add('show');
        updateBootPosition();
    }, 100);
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
    <h2>${screen.section}</h2>
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

function saveAnswer(answerObj) {
    answers[currentStep] = answerObj;
}

function next() {
    if (currentStep < screens.length - 1) {
        currentStep++;
        render();
    }
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
