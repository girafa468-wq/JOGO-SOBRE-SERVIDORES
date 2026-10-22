(() => {
  const byId = id => document.getElementById(id);
  const stages = [...document.querySelectorAll('.stage')];
  const navigation = [...document.querySelectorAll('.phase')];
  const answers = [1, 2, 0, 1, [0, 1, 0, 1, 0]];
  let phase = 0;
  let step = 0;
  let unlocked = 0;
  let score = 0;
  let hearts = 3;
  let solved = new Set();
  let passed = false;
  let finished = false;

  const currentKey = () => `${phase}-${phase === 4 ? step : 0}`;

  function hideFeedback() {
    ['feedback-good', 'feedback-bad', 'feedback-empty', 'next-button', 'retry-button']
      .forEach(id => { byId(id).hidden = true; });
  }

  function currentQuestionBox() {
    return phase === 4
      ? document.querySelector(`.travel-step[data-step="${step}"]`)
      : stages[phase];
  }

  function render() {
    stages.forEach((stage, index) => { stage.hidden = index !== phase; });
    navigation.forEach((button, index) => {
      button.disabled = index > unlocked;
      button.classList.toggle('active', index === phase);
      button.setAttribute('aria-current', index === phase ? 'step' : 'false');
      button.setAttribute('aria-label', `${button.textContent.trim()}${index > unlocked ? ', bloqueada' : ''}`);
    });
    document.querySelectorAll('.travel-step').forEach(element => {
      element.hidden = Number(element.dataset.step) !== step;
    });
    document.querySelectorAll('.step-chip').forEach(element => {
      element.classList.toggle('current', Number(element.dataset.chip) === step);
    });
    byId('score').textContent = score;
    byId('hearts').textContent = hearts;
    byId('progress-label').textContent = `Fase ${phase + 1} de 6`;
    byId('progress-fill').style.width = `${(finished ? 6 : Math.max(unlocked, phase)) / 6 * 100}%`;
    byId('progress-bar').setAttribute('aria-valuenow', String(finished ? 6 : Math.max(unlocked, phase)));
    document.querySelectorAll('.option').forEach(button => {
      button.disabled = false;
      button.classList.remove('correct', 'wrong');
    });
    hideFeedback();

    if (passed && phase !== 5) {
      currentQuestionBox().querySelectorAll('.option').forEach(button => { button.disabled = true; });
      byId('next-button').hidden = false;
    }
  }

  function goTo(index) {
    if (index > unlocked) return;
    phase = index;
    step = 0;
    hearts = 3;
    passed = solved.has(currentKey());
    render();
  }

  function reset() {
    phase = 0;
    step = 0;
    unlocked = 0;
    score = 0;
    hearts = 3;
    solved = new Set();
    passed = false;
    finished = false;
    byId('end-screen').hidden = true;
    byId('start-screen').hidden = false;
    byId('game-screen').hidden = true;
  }

  byId('start-button').addEventListener('click', () => {
    byId('start-screen').hidden = true;
    byId('game-screen').hidden = false;
    goTo(0);
  });

  navigation.forEach(button => {
    button.addEventListener('click', () => goTo(Number(button.dataset.phase)));
  });

  document.querySelectorAll('.option').forEach(button => {
    button.addEventListener('click', () => {
      if (passed || hearts <= 0) return;
      const expected = phase === 4 ? answers[4][step] : answers[phase];

      if (Number(button.dataset.answer) === expected) {
        button.classList.add('correct');
        if (!solved.has(currentKey())) {
          solved.add(currentKey());
          score += 10;
        }
        passed = true;
        currentQuestionBox().querySelectorAll('.option').forEach(option => { option.disabled = true; });
        byId('feedback-bad').hidden = true;
        byId('feedback-good').hidden = false;
        byId('next-button').hidden = false;
        byId('score').textContent = score;
        return;
      }

      button.classList.add('wrong');
      button.disabled = true;
      hearts--;
      byId('hearts').textContent = hearts;
      byId('feedback-bad').hidden = hearts === 0;
      byId('feedback-empty').hidden = hearts !== 0;
      if (hearts === 0) {
        currentQuestionBox().querySelectorAll('.option').forEach(option => { option.disabled = true; });
        byId('retry-button').hidden = false;
      }
    });
  });

  byId('next-button').addEventListener('click', () => {
    if (!passed) return;
    if (phase === 4 && step < 4) {
      step++;
      passed = solved.has(currentKey());
      render();
      return;
    }
    if (phase < 5) {
      unlocked = Math.max(unlocked, phase + 1);
      goTo(phase + 1);
    }
  });

  byId('retry-button').addEventListener('click', () => {
    hearts = 3;
    step = 0;
    passed = solved.has(currentKey());
    render();
  });

  byId('finish-button').addEventListener('click', () => {
    if (phase !== 5 || unlocked < 5) return;
    finished = true;
    byId('final-score').textContent = score;
    byId('game-screen').hidden = true;
    byId('end-screen').hidden = false;
    byId('end-title').focus();
  });

  byId('restart-button').addEventListener('click', reset);
})();