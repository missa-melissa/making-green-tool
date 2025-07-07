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


// === Screens aufbauen ===
function buildScreens() {
    screens.push({ type: 'intro' });
    sections.forEach((section, idx) => {
        section.questions.forEach(q => screens.push({ type: 'question', section: section.name, text: q }));
        screens.push({ type: 'fazit', section: section.name });
    });
    screens.push({ type: 'result' });
}

function findFazitIndices() {
    sections.forEach(section => {
        const idx = screens.findIndex(s => s.type === 'fazit' && s.section === section.name);
        fazitIndices[section.name] = idx;
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
    const fireElement = fires[section];
    if (!fireElement || fireAnimationIntervals[section]) return;

    let frame = 1;
    fireElement.src = fireFrames[frame].src;

    fireAnimationIntervals[section] = setInterval(() => {
        frame = frame === 1 ? 2 : 1;
        fireElement.src = fireFrames[frame].src;
    }, 200);
}

function stopFireAnimation(section) {
    if (fireAnimationIntervals[section]) {
        clearInterval(fireAnimationIntervals[section]);
        delete fireAnimationIntervals[section];
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
                img = `images/plant${idx+1}_blooms.png`;
            } else {
                img = `images/plant${idx+1}_died.PNG`;
            }
            plantImages[name].src = img;

            // Feuer nur beim eigenen Fazit
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
        }
        else if (screen.type === 'question') {
            content.innerHTML = `
          <h2>${screen.section}</h2>
          <p>${screen.text}</p>
          <div class="options">
            <label><input type="radio" name="answer" value="1"> Ja</label>
            <label><input type="radio" name="answer" value="-1"> Nein</label>
            <label><input type="radio" name="answer" value="0"> Keine Aussage</label>
          </div>
          <div>
            ${currentStep > 0 ? '<button class="button" id="back">Zurück</button>' : ''}
            <button class="button" id="next">Weiter</button>
          </div>
        `;
            document.getElementById('next').onclick = () => {
                const val = document.querySelector('input[name="answer"]:checked');
                if (val) {
                    answers[currentStep] = parseInt(val.value);
                    next();
                } else {
                    alert('Bitte eine Option wählen.');
                }
            };
            if (document.getElementById('back'))
                document.getElementById('back').onclick = () => back();
        }
        else if (screen.type === 'fazit') {
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
        }
        else if (screen.type === 'result') {
            const score = answers.reduce((a, b) => a + (b || 0), 0);
            const maxScore = answers.length;
            let rating = '';
            let color = '';
            if (score <= 0) { rating = 'sehr schlecht'; color = 'red'; }
            else if (score <= 10) { rating = 'schlecht'; color = 'orange'; }
            else if (score <= 20) { rating = 'mittel'; color = 'yellow'; }
            else if (score <= 30) { rating = 'gut'; color = '#ADCA78'; }
            else { rating = 'exzellent'; color = 'green'; }

            const degree = Math.min(180, Math.max(0, score / maxScore * 180));
            content.innerHTML = `
          <h1>Ergebnis</h1>
          <div class="result-gauge">
            <div class="needle" id="needle"></div>
          </div>
          <div class="result-text" style="color:${color}">Score: ${score} Punkte – Bewertung: ${rating}</div>
        `;
            setTimeout(() => {
                document.getElementById('needle').style.transform = 'rotate(' + degree + 'deg)';
            }, 100);
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

    // Pflanzen bleiben fix an ihren Positionen
    for (let section of sections) {
        plantContainers[section.name].style.left = plantPositions[section.name] + 'px';
    }
}

function findSectionEndIndices() {
    sections.forEach((section, idx) => {
        let lastIndex;
        if (idx < sections.length - 1) {
            lastIndex = screens.findIndex(s => s.type === 'fazit' && s.section === section.name);
        } else {
            lastIndex = screens.length - 2; // letzter Fragen-Screen vor Ergebnis
        }
        sectionEndIndices[section.name] = lastIndex;
    });
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