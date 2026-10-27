// Global State
let characters = [];
let activeCharacter = null;
let currentSessionId = '';
let messageHistory = [];
let isGenerating = false;

// Proxy CDN image URLs to bypass 403 Forbidden hotlink blocks
function formatAvatarUrl(url) {
  if (!url) return 'https://api.dicebear.com/7.x/bottts/svg?seed=Companion';
  if (url.startsWith('/api/image')) return url;
  if (url.includes('b-cdn.net') || url.includes('nsfwlover.com')) {
    return `/api/image?url=${encodeURIComponent(url)}`;
  }
  return url;
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', async () => {
  await loadCharacters();
  initEventListeners();
});

// Load characters from API
async function loadCharacters() {
  try {
    const res = await fetch('/api/characters');
    if (!res.ok) throw new Error('Characters API returned ' + res.status);
    const data = await res.json();
    characters = data.characters || [];
  } catch (err) {
    console.warn('Fallback characters loaded:', err);
    characters = [
      {
        id: "Kohana",
        name: "Kohana",
        creator: "masseyph",
        description: "Your stepmom, a people-pleaser type, is wondering what would you like as graduation present.",
        tags: ["Relations", "Real Girls", "Stepmom"],
        avatar: "https://loveimages.b-cdn.net/characters/Kohana/icon/f13acc8052570b13217e33537415f121888e41b9eddba937efd2bfff1b7254b1.jpg",
        greeting: "*Kohana is sitting next to you on the couch, speaking with a warm smile.* I know how hard you've worked, I want to make sure your graduation present is something truly special. What would you like as a gift?"
      },
      {
        id: "Miranda | Futa Gang",
        name: "Miranda | Futa Gang",
        creator: "Slicer",
        description: "🔥So bad, you're their fresh meat at the freshman party! #⛓️FutaDomination",
        tags: ["Party", "Domination"],
        avatar: "https://loveimages.b-cdn.net/characters/Miranda%20%7C%20Futa%20Gang/icon/880013e94589111118249641337d04b91f2a5a5c982c2a46a0c585df96ee701a.jpg",
        greeting: "*Miranda smirks and corners you in the hallway.* Look what we have here... fresh meat for our group."
      },
      {
        id: "Linda",
        name: "Linda",
        creator: "ronaldwa",
        description: "Your mother, who in an attempt to feel desired again, started dressing up.",
        tags: ["Family", "MILF"],
        avatar: "https://loveimages.b-cdn.net/characters/Linda/icon.jpg",
        greeting: "*Linda walks out in a tight, flattering dress, blushing slightly.* Do you think this looks okay on me?"
      },
      {
        id: "Sarah Wood",
        name: "Sarah Wood",
        creator: "guerrer",
        description: "The timid girl, trembling, spoke softly, her fear masking hidden desires.",
        tags: ["Shy", "Timid"],
        avatar: "https://loveimages.b-cdn.net/characters/Sarah%20Wood/icon.jpg",
        greeting: "*Sarah looks down shyly, twiddling her fingers.* H-hello... I was hoping we could talk for a moment..."
      }
    ];
  }

  // Populate UI views
  renderSidebarList();
  populateMobileDropdown();
  populateApiDropdown();
  renderGallery();

  // Set active character to first
  if (characters.length > 0) {
    await selectCharacter(characters[0].id, false);
  }
}

// Render left sidebar on desktop
function renderSidebarList() {
  const container = document.getElementById('sidebar-char-list');
  const countEl = document.getElementById('char-total-count');
  if (countEl) countEl.textContent = `${characters.length} Available`;
  if (!container) return;

  container.innerHTML = '';
  characters.forEach(c => {
    const item = document.createElement('div');
    item.className = `sidebar-char-item ${activeCharacter && activeCharacter.id === c.id ? 'active' : ''}`;
    item.id = `sidebar-item-${c.id.replace(/[^a-zA-Z0-9]/g, '_')}`;
    item.onclick = () => selectCharacter(c.id);

    item.innerHTML = `
      <img class="sidebar-char-avatar" src="${formatAvatarUrl(c.avatar)}" alt="${c.name}" onerror="this.src='https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(c.name)}'">
      <div class="sidebar-char-info">
        <div class="sidebar-char-name">${c.name}</div>
        <div class="sidebar-char-tagline">${c.description}</div>
      </div>
    `;
    container.appendChild(item);
  });
}

// Populate mobile selector dropdown
function populateMobileDropdown() {
  const select = document.getElementById('mobile-char-dropdown');
  if (!select) return;
  select.innerHTML = '';
  characters.forEach(c => {
    const opt = document.createElement('option');
    opt.value = c.id;
    opt.textContent = c.name;
    select.appendChild(opt);
  });
}

// Populate API builder dropdown
function populateApiDropdown() {
  const select = document.getElementById('api-char-select');
  if (!select) return;
  select.innerHTML = '';
  characters.forEach(c => {
    const opt = document.createElement('option');
    opt.value = c.id;
    opt.textContent = `${c.name} (${c.id})`;
    select.appendChild(opt);
  });
}

// Render full gallery cards tab
function renderGallery() {
  const container = document.getElementById('gallery-container');
  if (!container) return;
  container.innerHTML = '';

  characters.forEach(c => {
    const card = document.createElement('div');
    card.className = 'gallery-card';
    card.innerHTML = `
      <div class="gallery-media">
        <img src="${formatAvatarUrl(c.avatar)}" alt="${c.name}" onerror="this.src='https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(c.name)}'">
      </div>
      <div class="gallery-body">
        <div class="gallery-name-row">
          <span class="gallery-name">${c.name}</span>
          <span class="badge get-pill">${c.chats || 'Popular'}</span>
        </div>
        <div class="gallery-creator">by ${c.creator || 'Community'}</div>
        <p class="gallery-desc">${c.description}</p>
        <div class="gallery-tags">
          ${(c.tags || []).slice(0, 3).map(t => `<span class="tag-pill">${t}</span>`).join('')}
        </div>
        <button class="btn btn-sm btn-accent w-100" onclick="selectCharacter('${c.id}'); switchTab('chat-view')">Start Chatting</button>
      </div>
    `;
    container.appendChild(card);
  });
}

// Switch active character
async function selectCharacter(charId, resetHistory = true) {
  const char = characters.find(c => c.id === charId) || characters[0];
  activeCharacter = char;

  // Update DOM header elements
  document.getElementById('chat-active-name').textContent = char.name;
  document.getElementById('chat-active-desc').textContent = char.description;
  document.getElementById('chat-active-creator').textContent = `by ${char.creator || 'Community'}`;
  document.getElementById('chat-active-avatar').src = formatAvatarUrl(char.avatar);
  document.getElementById('typing-char-name').textContent = char.name;

  // Update dynamic favicon
  const fav = document.getElementById('dynamic-favicon');
  if (fav) fav.href = char.avatar;

  // Update active state in sidebar
  document.querySelectorAll('.sidebar-char-item').forEach(el => el.classList.remove('active'));
  const activeEl = document.getElementById(`sidebar-item-${char.id.replace(/[^a-zA-Z0-9]/g, '_')}`);
  if (activeEl) activeEl.classList.add('active');

  // Sync mobile dropdown
  const mobSelect = document.getElementById('mobile-char-dropdown');
  if (mobSelect) mobSelect.value = char.id;

  // Sync API dropdown
  const apiSelect = document.getElementById('api-char-select');
  if (apiSelect) apiSelect.value = char.id;

  // Initialize or reset session
  if (resetHistory || !currentSessionId) {
    await initNewSession(char.id);
  }

  updateLiveUrl();
}

function onMobileCharChange(charId) {
  selectCharacter(charId);
}

function syncApiCharacter(charId) {
  selectCharacter(charId, false);
}

// Initialize a new session with character greeting
async function initNewSession(charId) {
  try {
    const res = await fetch(`/api/chat?action=new_session&character=${encodeURIComponent(charId)}`);
    const data = await res.json();
    
    currentSessionId = data.session_id || `sess_${charId}_${Date.now()}`;
    messageHistory = [];

    if (data.greeting) {
      messageHistory.push({
        role: 'assistant',
        content: data.greeting,
        timestamp: formatTime(new Date())
      });
    }

    updateSessionUi();
    renderChatMessages();
    showToast(`New session started with ${activeCharacter.name}`);
  } catch (err) {
    currentSessionId = `sess_${charId}_${Date.now()}`;
    messageHistory = [{
      role: 'assistant',
      content: activeCharacter.greeting || `*${activeCharacter.name} smiles warmly at you.* Hello!`,
      timestamp: formatTime(new Date())
    }];
    updateSessionUi();
    renderChatMessages();
  }
}

// Reset current session
async function resetCurrentSession() {
  if (activeCharacter) {
    await initNewSession(activeCharacter.id);
  }
}

// Update session labels across UI
function updateSessionUi() {
  const sidebarSessionEl = document.getElementById('sidebar-session-id');
  const apiSessionEl = document.getElementById('api-session-input');
  const msgCountEl = document.getElementById('sidebar-msg-count');

  if (sidebarSessionEl) sidebarSessionEl.textContent = currentSessionId;
  if (apiSessionEl) apiSessionEl.value = currentSessionId;
  if (msgCountEl) msgCountEl.textContent = `${messageHistory.length} messages in context`;

  updateLiveUrl();
}

// Format message text: converts *action text* into stylized italic spans
function formatMessageContent(rawText) {
  const escaped = (rawText || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Match *anything* and wrap in <span class="roleplay-action">
  return escaped.replace(/\*([^*]+)\*/g, '<span class="roleplay-action">*$1*</span>');
}

// Render messages to chat stage
function renderChatMessages() {
  const container = document.getElementById('chat-messages-container');
  if (!container) return;

  container.innerHTML = `
    <div class="chat-timestamp-divider">
      <span>Today • Conversation Started</span>
    </div>
  `;

  messageHistory.forEach(msg => {
    const isAssistant = msg.role === 'assistant';
    const row = document.createElement('div');
    row.className = `chat-bubble-row ${isAssistant ? 'companion' : 'user'}`;

    const avatarUrl = isAssistant
      ? formatAvatarUrl(activeCharacter.avatar)
      : 'https://api.dicebear.com/7.x/identicon/svg?seed=Guest';

    const authorName = isAssistant ? activeCharacter.name : 'You';

    row.innerHTML = `
      <img class="bubble-avatar" src="${avatarUrl}" alt="${authorName}">
      <div class="bubble-content">
        <span class="bubble-author-name">${authorName}</span>
        <div class="bubble-body">${formatMessageContent(msg.content)}</div>
        <span class="bubble-timestamp">${msg.timestamp || ''}</span>
      </div>
    `;
    container.appendChild(row);
  });

  scrollToChatBottom();
}

function scrollToChatBottom() {
  const container = document.getElementById('chat-messages-container');
  if (container) {
    container.scrollTop = container.scrollHeight;
  }
}

// Send chat message
async function submitUserChat() {
  if (isGenerating) return;

  const inputEl = document.getElementById('chat-input-text');
  const prompt = inputEl.value.trim();
  if (!prompt) return;

  // Add user message immediately
  const now = formatTime(new Date());
  messageHistory.push({
    role: 'user',
    content: prompt,
    timestamp: now
  });
  renderChatMessages();

  // Clear input
  inputEl.value = '';
  inputEl.style.height = 'auto';

  // Show typing indicator
  isGenerating = true;
  const typingEl = document.getElementById('typing-indicator');
  if (typingEl) typingEl.style.display = 'flex';
  scrollToChatBottom();

  try {
    const url = `/api/chat?prompt=${encodeURIComponent(prompt)}&character=${encodeURIComponent(activeCharacter.id)}&session_id=${encodeURIComponent(currentSessionId)}`;
    const res = await fetch(url);
    const data = await res.json();

    if (data.reply) {
      messageHistory.push({
        role: 'assistant',
        content: data.reply,
        timestamp: formatTime(new Date())
      });
      if (data.session_id) currentSessionId = data.session_id;
    } else {
      messageHistory.push({
        role: 'assistant',
        content: '*smiles and listens to you carefully*',
        timestamp: formatTime(new Date())
      });
    }
  } catch (err) {
    messageHistory.push({
      role: 'assistant',
      content: `*apologizes softly* I had a brief network hiccup (${err.message}). Could you say that again?`,
      timestamp: formatTime(new Date())
    });
  } finally {
    isGenerating = false;
    if (typingEl) typingEl.style.display = 'none';
    updateSessionUi();
    renderChatMessages();
  }
}

// Quick chip prompt
function sendQuickPrompt(text) {
  const inputEl = document.getElementById('chat-input-text');
  if (inputEl) {
    inputEl.value = text;
    submitUserChat();
  }
}

// Handle Enter and Shift+Enter
function handleInputKeydown(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    submitUserChat();
  }
}

// Tab navigation switcher
function switchTab(tabId) {
  document.querySelectorAll('.nav-tab').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-tab') === tabId);
  });

  document.querySelectorAll('.tab-content-panel').forEach(panel => {
    panel.classList.toggle('active', panel.id === tabId);
  });

  if (tabId === 'chat-view') {
    scrollToChatBottom();
  } else if (tabId === 'api-view') {
    updateLiveUrl();
  }
}

// API Builder Live URL Generator
function getApiBuilderUrl() {
  const char = document.getElementById('api-char-select')?.value || 'Kohana';
  const prompt = document.getElementById('api-prompt-input')?.value || 'Hello';
  const user = document.getElementById('api-user-input')?.value || 'Guest';
  const format = document.getElementById('api-format-select')?.value || 'json';
  const sid = currentSessionId || document.getElementById('api-session-input')?.value || '';

  const origin = window.location.origin || 'https://thenuxaislut.netlify.app';
  const params = new URLSearchParams();
  if (prompt) params.append('prompt', prompt);
  if (char) params.append('character', char);
  if (sid) params.append('session_id', sid);
  if (user && user !== 'Guest') params.append('username', user);
  if (format && format !== 'json') params.append('format', format);

  return `${origin}/api/chat?${params.toString()}`;
}

function updateLiveUrl() {
  const url = getApiBuilderUrl();
  const previewEl = document.getElementById('live-api-url-preview');
  const openLink = document.getElementById('api-open-link');

  if (previewEl) previewEl.textContent = url;
  if (openLink) openLink.href = url;
}

async function runApiBuilderTest() {
  const btn = document.getElementById('api-test-run-btn');
  const codeEl = document.getElementById('api-response-code');
  const badgeEl = document.getElementById('api-duration-badge');

  const url = getApiBuilderUrl();
  btn.disabled = true;
  btn.textContent = 'Sending...';
  badgeEl.textContent = 'Fetching...';
  codeEl.textContent = `Fetching GET ${url}...`;

  const start = Date.now();
  try {
    const res = await fetch(url);
    const duration = Date.now() - start;
    const isJson = res.headers.get('content-type')?.includes('application/json');

    if (isJson) {
      const data = await res.json();
      codeEl.textContent = JSON.stringify(data, null, 2);
    } else {
      const text = await res.text();
      codeEl.textContent = text;
    }
    badgeEl.textContent = `Status: ${res.status} (${duration}ms)`;
  } catch (e) {
    codeEl.textContent = 'Error: ' + e.message;
    badgeEl.textContent = 'Failed';
  } finally {
    btn.disabled = false;
    btn.textContent = 'Send Request Now';
  }
}

// Modal View Session Memory
async function viewSessionMemory() {
  if (!currentSessionId) return;
  const modal = document.getElementById('memory-modal');
  const jsonEl = document.getElementById('modal-memory-json');
  if (modal) modal.classList.add('open');

  try {
    const res = await fetch(`/api/chat?action=history&session_id=${encodeURIComponent(currentSessionId)}`);
    const data = await res.json();
    if (jsonEl) jsonEl.textContent = JSON.stringify(data, null, 2);
  } catch (e) {
    if (jsonEl) jsonEl.textContent = JSON.stringify(messageHistory, null, 2);
  }
}

function closeMemoryModal(e) {
  const modal = document.getElementById('memory-modal');
  if (modal) modal.classList.remove('open');
}

function copyModalMemory() {
  const text = document.getElementById('modal-memory-json')?.textContent || '';
  copyToClipboard(text, 'Memory JSON copied!');
}

// Utility Helpers
function copyFullApiUrl() {
  copyToClipboard(getApiBuilderUrl(), 'API URL copied to clipboard!');
}

function copySessionId() {
  copyToClipboard(currentSessionId, 'Session ID copied!');
}

function copyGetUrlForCurrent() {
  const origin = window.location.origin || 'https://thenuxaislut.netlify.app';
  const url = `${origin}/api/chat?prompt=hello&character=${encodeURIComponent(activeCharacter.id)}&session_id=${encodeURIComponent(currentSessionId)}`;
  copyToClipboard(url, 'GET URL copied!');
}

function copyToClipboard(text, msg = 'Copied to clipboard!') {
  navigator.clipboard.writeText(text).then(() => {
    showToast(msg);
  }).catch(() => {
    prompt('Copy to clipboard:', text);
  });
}

function showToast(msg) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2600);
}

function formatTime(d) {
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function initEventListeners() {
  // Auto-resize chat textarea as user types
  const tx = document.getElementById('chat-input-text');
  if (tx) {
    tx.addEventListener('input', function() {
      this.style.height = 'auto';
      this.style.height = Math.min(this.scrollHeight, 120) + 'px';
    });
  }
}
