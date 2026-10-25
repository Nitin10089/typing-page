(() => {
    const passages = [
        "The best way to learn something new is to make a little room for it each day. Start where you are, take your time, and let every small effort add up to something you can be proud of.",
        "A quiet morning can make the whole day feel different. The light comes in slowly, the kettle begins to sing, and there is just enough time to gather your thoughts before the world gets busy.",
        "Somewhere beyond the trees, a train moved steadily through the valley. In its windows, travelers watched the fields roll by and carried their own small stories toward the next station.",
        "Good ideas rarely arrive all at once. They grow from curious questions, patient experiments, and the courage to try again when the first answer is not quite right.",
        "On the weekend, we packed a picnic and followed the winding path beside the river. By afternoon, the clouds had cleared, and the water shimmered like a ribbon in the sun.",
        "A well-made cup of coffee is a small daily ritual. Measure the beans, warm the mug, and give the water a moment to bring out every rich and bright note.",
        "The old library stood at the end of a quiet street, its tall windows glowing warmly at dusk. Inside, every shelf held a door to somewhere new.",
        "When the rain finally stopped, the garden smelled of fresh earth and green leaves. Tiny drops clung to the flowers, catching the last light of the afternoon.",
        "Maya kept a notebook for passing thoughts, quick sketches, and questions she wanted to explore. Over time, those scattered notes became the start of something wonderful.",
        "A bicycle is a simple invitation to slow down and look around. Take the longer route, notice the changing trees, and let the fresh air clear your mind.",
        "The little bakery opened before sunrise, filling the corner with the scent of warm bread. Neighbors stopped by for a loaf and stayed to share the day's news.",
        "Learning to play a song takes patience. First find the rhythm, then practice the tricky part, and soon your hands will remember what your mind once had to think through.",
        "At the edge of the harbor, boats rocked gently against their ropes. Seagulls circled overhead while the first sunlight spread across the calm blue water.",
        "A thoughtful message can brighten an ordinary day. Take a moment to tell someone you appreciate them, and make kindness part of your routine.",
        "The mountain trail curved through a forest of tall pines. Each step brought a new view, and the quiet made every distant birdcall seem close."
    ];

    const passageEl = document.querySelector("#passage");
    const input = document.querySelector("#typing-input");
    const durationSelect = document.querySelector("#duration");
    const timeEl = document.querySelector("#time");
    const wpmEl = document.querySelector("#wpm");
    const accuracyEl = document.querySelector("#accuracy");
    const progressEl = document.querySelector("#progress");
    const hintEl = document.querySelector("#hint");
    const resultEl = document.querySelector("#result");
    const finalWpmEl = document.querySelector("#final-wpm");
    const finalAccuracyEl = document.querySelector("#final-accuracy");
    const finalCorrectEl = document.querySelector("#final-correct");
    const resultMessageEl = document.querySelector("#result-message");
    let passage = "";
    let remaining = Number(durationSelect.value);
    let startedAt = null;
    let timerId = null;
    let passageIndex = -1;
    let restartShortcutArmed = false;

    function getMetrics() {
        const typed = input.value;
        const correct = [...typed].filter((character, index) => character === passage[index]).length;
        const accuracy = typed.length ? Math.round((correct / typed.length) * 100) : 100;
        const elapsedMinutes = startedAt
            ? Math.min((Date.now() - startedAt) / 60000, Number(durationSelect.value) / 60)
            : 0;
        const wpm = correct && elapsedMinutes ? Math.round((correct / 5) / elapsedMinutes) : 0;
        return { correct, accuracy, wpm };
    }

    function renderPassage() {
        const typed = input.value;
        passageEl.replaceChildren();
        for (let i = 0; i < passage.length; i += 1) {
            const character = document.createElement("span");
            character.textContent = passage[i];
            if (i < typed.length) {
                character.className = typed[i] === passage[i] ? "correct" : "incorrect";
            } else if (i === typed.length) {
                character.className = "current";
            }
            passageEl.append(character);
        }
        const { accuracy, wpm } = getMetrics();

        accuracyEl.innerHTML = `${accuracy}<span class="stat-unit">%</span>`;
        wpmEl.textContent = wpm;
        progressEl.style.width = `${Math.min((typed.length / passage.length) * 100, 100)}%`;
        passageEl.classList.toggle("is-finished", typed.length >= passage.length);
    }

    function stopTest(message) {
        if (input.disabled) return;
        clearInterval(timerId);
        timerId = null;
        input.disabled = true;
        hintEl.textContent = message;
        const { correct, accuracy, wpm } = getMetrics();
        finalWpmEl.textContent = wpm;
        finalAccuracyEl.textContent = `${accuracy}%`;
        finalCorrectEl.textContent = correct;
        resultMessageEl.textContent = wpm >= 60
            ? "Excellent pace. Keep that rhythm going."
            : wpm >= 35
                ? "Solid progress. A little practice goes a long way."
                : "Nice work showing up. Keep practicing and watch your speed grow.";
        resultEl.hidden = false;
        input.blur();
    }

    function resetTest() {
        clearInterval(timerId);
        timerId = null;
        startedAt = null;
        remaining = Number(durationSelect.value);
        resultEl.hidden = true;
        timeEl.innerHTML = `${remaining}<span class="stat-unit">s</span>`;
        hintEl.innerHTML = "<kbd>Tab</kbd> + <kbd>Enter</kbd> to restart";
        input.disabled = false;
        input.value = "";
        renderPassage();
    }

    function setPassage(nextIndex) {
        passageIndex = nextIndex;
        passage = passages[passageIndex];
        passageEl.setAttribute("aria-label", passage);
        resetTest();
    }

    function startTimer() {
        if (timerId) return;
        startedAt = Date.now();
        timerId = window.setInterval(() => {
            remaining -= 1;
            timeEl.innerHTML = `${remaining}<span class="stat-unit">s</span>`;
            if (remaining <= 0) {
                remaining = 0;
                timeEl.innerHTML = '0<span class="stat-unit">s</span>';
                stopTest("Time's up — nice work!");
            }
        }, 1000);
    }

    input.addEventListener("input", () => {
        if (input.value.length && !startedAt) startTimer();
        renderPassage();
        if (input.value.length >= passage.length) stopTest("Passage complete — great typing!");
    });

    durationSelect.addEventListener("change", resetTest);
    document.querySelector("#restart").addEventListener("click", () => {
        resetTest();
        input.focus();
    });
    document.querySelector("#new-passage").addEventListener("click", () => {
        const nextIndex = (passageIndex + 1 + Math.floor(Math.random() * (passages.length - 1))) % passages.length;
        setPassage(nextIndex);
        input.focus();
    });
    document.addEventListener("keydown", (event) => {
        if (event.key === "Tab" && !event.shiftKey) {
            restartShortcutArmed = true;
            return;
        }
        if (restartShortcutArmed) {
            restartShortcutArmed = false;
            if (event.key === "Enter") {
                event.preventDefault();
                resetTest();
                input.focus();
            }
        }
    });

    setPassage(0);
})();
