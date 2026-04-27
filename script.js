const DAILY_GOAL = 5;

const challenges = [
  { id: 1, title: 'Walk 1,000 steps', category: 'Physical', points: 10, emoji: '🚶' },
  { id: 2, title: 'Recycle an item', category: 'Environmental', points: 5, emoji: '♻️' },
  { id: 3, title: 'Compliment someone', category: 'Social', points: 10, emoji: '💬' },
  { id: 4, title: 'Join a club', category: 'Social', points: 30, emoji: '🤝' },
  { id: 5, title: 'Volunteer work', category: 'Social', points: 75, emoji: '❤️' },
  { id: 6, title: 'Journal entry', category: 'Mental', points: 10, emoji: '📝' },
  { id: 7, title: 'Drink 8 glasses of water', category: 'Physical', points: 10, emoji: '💧' },
  { id: 8, title: 'Take a 10-min walk outside', category: 'Physical', points: 15, emoji: '🌳' },
  { id: 9, title: 'Reduce single-use plastic', category: 'Environmental', points: 20, emoji: '🌿' },
  { id: 10, title: 'Meditate for 5 minutes', category: 'Mental', points: 15, emoji: '🧘' },
];

const rewards = [
  { id: 1, name: 'Toothbrush', desc: 'Eco-friendly bamboo toothbrush', cost: 50, emoji: '🪥' },
  { id: 2, name: 'Deodorant', desc: 'Natural aluminum-free deodorant', cost: 100, emoji: '🌸' },
  { id: 3, name: 'Shampoo Bar', desc: 'Zero-waste shampoo bar', cost: 120, emoji: '🧴' },
  { id: 4, name: 'Reusable Bag', desc: 'Canvas tote bag', cost: 60, emoji: '👜' },
  { id: 5, name: 'Face Wash', desc: 'Gentle daily cleanser', cost: 150, emoji: '✨' },
];

const state = {
  points: 0,
  completedChallenges: new Set(),
  redeemedCount: 0,
  activityLog: [],
  activeTab: 'home',
  activeFilter: 'all',
};

function updateAllPointsDisplays() {
  const pts = state.points;
  document.getElementById('header-points').textContent = pts;
  document.getElementById('stat-points').textContent = pts;
  document.getElementById('rewards-points').textContent = pts;
  document.getElementById('profile-points').textContent = pts;

  const completedCount = state.completedChallenges.size;
  document.getElementById('stat-completed').textContent = completedCount;
  document.getElementById('profile-completed').textContent = completedCount;
  document.getElementById('profile-redeemed').textContent = state.redeemedCount;

  const progressPct = Math.min((completedCount / DAILY_GOAL) * 100, 100);
  document.getElementById('daily-progress-bar').style.width = progressPct + '%';
  document.getElementById('home-progress-label').textContent = `${Math.min(completedCount, DAILY_GOAL)} / ${DAILY_GOAL} done`;

  const ringCircumference = 251.2;
  const offset = ringCircumference - (progressPct / 100) * ringCircumference;
  document.getElementById('progress-ring').style.strokeDashoffset = offset;
  document.getElementById('ring-percent').textContent = Math.round(progressPct) + '%';

  updateRedeemButtons();
  checkAchievements();
}

function updateRedeemButtons() {
  document.querySelectorAll('.redeem-btn').forEach(btn => {
    const cost = parseInt(btn.dataset.cost, 10);
    btn.disabled = state.points < cost;
  });
}

function switchTab(tab) {
  state.activeTab = tab;

  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));

  document.getElementById('screen-' + tab).classList.add('active');
  document.querySelector(`.nav-btn[data-tab="${tab}"]`).classList.add('active');
}

function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'toastOut 0.3s ease forwards';
    setTimeout(() => toast.remove(), 300);
  }, 2500);
}

function showModal(icon, title, body) {
  document.getElementById('modal-icon').textContent = icon;
  document.getElementById('modal-title').textContent = title;
  document.getElementById('modal-body').textContent = body;
  document.getElementById('modal-overlay').classList.add('visible');
}

function hideModal() {
  document.getElementById('modal-overlay').classList.remove('visible');
}

function spawnPointsBurst(pts, el) {
  const rect = el.getBoundingClientRect();
  const burst = document.createElement('div');
  burst.className = 'points-burst';
  burst.textContent = '+' + pts;
  burst.style.left = rect.left + rect.width / 2 + 'px';
  burst.style.top = rect.top + 'px';
  document.body.appendChild(burst);
  setTimeout(() => burst.remove(), 700);
}

function pulseElement(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.remove('pulse');
  void el.offsetWidth;
  el.classList.add('pulse');
  setTimeout(() => el.classList.remove('pulse'), 400);
}

function addActivityEntry(text, pts, type) {
  state.activityLog.unshift({ text, pts, type });

  const log = document.getElementById('activity-log');
  const empty = log.querySelector('.activity-empty');
  if (empty) empty.remove();

  const item = document.createElement('div');
  item.className = 'activity-item';

  const dot = document.createElement('div');
  dot.className = 'activity-dot' + (type === 'redeem' ? ' redeem' : '');

  const textEl = document.createElement('span');
  textEl.className = 'activity-text';
  textEl.textContent = text;

  const ptsEl = document.createElement('span');
  ptsEl.className = 'activity-pts ' + (type === 'earn' ? 'earn' : 'spend');
  ptsEl.textContent = (type === 'earn' ? '+' : '-') + pts + ' pts';

  item.appendChild(dot);
  item.appendChild(textEl);
  item.appendChild(ptsEl);

  log.prepend(item);

  const items = log.querySelectorAll('.activity-item');
  if (items.length > 8) items[items.length - 1].remove();
}

function completeChallenge(id, btn) {
  if (state.completedChallenges.has(id)) return;

  const challenge = challenges.find(c => c.id === id);
  if (!challenge) return;

  state.completedChallenges.add(id);
  state.points += challenge.points;

  spawnPointsBurst(challenge.points, btn);
  pulseElement('stat-points');
  pulseElement('header-points');

  btn.textContent = 'Done ✓';
  btn.classList.add('done');

  const card = btn.closest('.challenge-card');
  if (card) card.classList.add('completed');

  addActivityEntry(challenge.title, challenge.points, 'earn');
  updateAllPointsDisplays();

  if (state.completedChallenges.size === 1) {
    showModal('🎉', 'First Challenge!', `You completed "${challenge.title}" and earned ${challenge.points} points. Keep it up!`);
  } else if (state.completedChallenges.size === DAILY_GOAL) {
    showModal('🏆', 'Daily Goal Reached!', `You crushed your daily goal of ${DAILY_GOAL} challenges! Total: ${state.points} pts`);
  } else {
    showToast(`+${challenge.points} pts — ${challenge.title}`);
  }

  renderQuickChallenges();
}

function redeemReward(id, btn) {
  const reward = rewards.find(r => r.id === id);
  if (!reward) return;

  if (state.points < reward.cost) {
    showToast(`Need ${reward.cost - state.points} more points`, 'error');
    return;
  }

  state.points -= reward.cost;
  state.redeemedCount++;

  addActivityEntry(reward.name, reward.cost, 'redeem');
  updateAllPointsDisplays();

  showModal('🎁', 'Reward Redeemed!', `You redeemed a ${reward.name} for ${reward.cost} points. Check your campus wellness center for pickup!`);
}

function renderChallengeCard(challenge, container, compact = false) {
  const isDone = state.completedChallenges.has(challenge.id);

  const card = document.createElement('div');
  card.className = 'challenge-card' + (isDone ? ' completed' : '');

  card.innerHTML = `
    <div class="challenge-emoji">${challenge.emoji}</div>
    <div class="challenge-info">
      <div class="challenge-title">${challenge.title}</div>
      <div class="challenge-meta">
        <span class="category-tag ${challenge.category}">${challenge.category}</span>
        <span class="challenge-pts">+${challenge.points} pts</span>
      </div>
    </div>
    <div class="challenge-action">
      <button class="complete-btn${isDone ? ' done' : ''}" data-id="${challenge.id}">
        ${isDone ? 'Done ✓' : compact ? '+' + challenge.points : 'Complete'}
      </button>
    </div>
  `;

  const btn = card.querySelector('.complete-btn');
  if (!isDone) {
    btn.addEventListener('click', () => completeChallenge(challenge.id, btn));
  }

  container.appendChild(card);
}

function renderChallengesList(filter = 'all') {
  const list = document.getElementById('challenges-list');
  list.innerHTML = '';

  const filtered = filter === 'all' ? challenges : challenges.filter(c => c.category === filter);
  filtered.forEach(c => renderChallengeCard(c, list));
}

function renderQuickChallenges() {
  const container = document.getElementById('quick-challenges');
  container.innerHTML = '';

  const incomplete = challenges.filter(c => !state.completedChallenges.has(c.id)).slice(0, 3);
  incomplete.forEach(c => renderChallengeCard(c, container, true));
}

function renderRewards() {
  const list = document.getElementById('rewards-list');
  list.innerHTML = '';

  rewards.forEach(reward => {
    const card = document.createElement('div');
    card.className = 'reward-card';
    card.innerHTML = `
      <div class="reward-emoji">${reward.emoji}</div>
      <div class="reward-info">
        <div class="reward-name">${reward.name}</div>
        <div class="reward-desc">${reward.desc}</div>
        <div class="reward-cost">✦ ${reward.cost} pts</div>
      </div>
      <button class="redeem-btn" data-id="${reward.id}" data-cost="${reward.cost}"
        ${state.points < reward.cost ? 'disabled' : ''}>
        Redeem
      </button>
    `;

    const btn = card.querySelector('.redeem-btn');
    btn.addEventListener('click', () => redeemReward(reward.id, btn));

    list.appendChild(card);
  });
}

function checkAchievements() {
  const physical = challenges.filter(c => c.category === 'Physical' && state.completedChallenges.has(c.id)).length;
  const environmental = challenges.filter(c => c.category === 'Environmental' && state.completedChallenges.has(c.id)).length;
  const social = challenges.filter(c => c.category === 'Social' && state.completedChallenges.has(c.id)).length;
  const total = state.completedChallenges.size;

  const ach = {
    'first-steps': physical >= 1,
    'green-start': environmental >= 1,
    'social-spark': social >= 1,
    'on-fire': total >= 5,
  };

  Object.entries(ach).forEach(([key, unlocked]) => {
    const el = document.querySelector(`[data-ach="${key}"]`);
    if (!el) return;
    if (unlocked) {
      el.classList.remove('locked');
      el.classList.add('unlocked');
    }
  });
}

function setGreeting() {
  const hour = new Date().getHours();
  let greeting = 'Good morning,';
  if (hour >= 12 && hour < 17) greeting = 'Good afternoon,';
  else if (hour >= 17) greeting = 'Good evening,';
  const el = document.querySelector('.hero-greeting');
  if (el) el.textContent = greeting;
}

function init() {
  setGreeting();

  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });

  document.querySelectorAll('.link-btn[data-tab]').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });

  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.activeFilter = btn.dataset.filter;
      renderChallengesList(state.activeFilter);
    });
  });

  document.getElementById('modal-close').addEventListener('click', hideModal);
  document.getElementById('modal-overlay').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) hideModal();
  });

  renderChallengesList();
  renderQuickChallenges();
  renderRewards();
  updateAllPointsDisplays();
}

document.addEventListener('DOMContentLoaded', init);
