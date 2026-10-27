let charactersData = [];
let currentSessionId = '';
let chatHistory = [];

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
  await loadCharacters();
  await initSession();

  const promptInput = document.getElementById('prompt-input');
  const usernameInput = document.getElementById('username-input');
  const formatSelect = document.getElementById('format-select');

  if (promptInput) promptInput.addEventListener('input', updateUrlPreview);
  if (usernameInput) usernameInput.addEventListener('input', updateUrlPreview);
  if (formatSelect) formatSelect.addEventListener('change', updateUrlPreview);

  updateUrlPreview();
});

// Fetch characters list on page load
async function loadCharacters() {
  try {
    const res = await fetch('/api/characters');
    if (!res.ok) throw new Error('Failed to load characters');
    const data = await res.json();
    charactersData = data.characters || [];
    renderCharacterGrid(charactersData);
    populateDropdown(charactersData);
  } catch (err) {
    console.error('Error fetching characters:', err);
    charactersData = [
      {
        id: "Kohana",
        name: "Kohana",
        creator: "masseyph",
        description: "Your stepmom, a people-pleaser type, is wondering what would you like as graduation present.",
        tags: ["Relations", "Real Girls", "Stepmom"],
        avatar: "https://loveimages.b-cdn.net/characters/Kohana/icon/f13acc8052570b13217e33537415f121888e41b9eddba937efd2bfff1b7254b1.jpg",
        greeting: "*Kohana is sitting next to you on the couch, speaking with a warm smile.* What would you like as a graduation gift?"
      }
    ];
    renderCharacterGrid(charactersData);
  }
}

// Generate or initialize session
async function initSession(forceNew = false) {
  const char = document.getElementById('char-select')?.value || 'Kohana';
  const username = document.getElementById('username-input')?.value || 'Guest';

  if (!forceNew && currentSessionId) {
    return;
  }

  try {
    const res = await fetch(`/api/chat?action=new_session&character=${encodeURIComponent(char)}&username=${encodeURIComponent(username)}`);
    const data = await res.json();
    if (data.session_id) {
      currentSessionId = data.session_id;
      document.getElementById('session-id-input').value = currentSessionId;
      chatHistory = [];
      if (data.greeting) {
        chatHistory.push({ role: 'assistant', content: data.greeting });
      }
      renderChatLog();
      updateCounter();
      updateUrlPreview();
    }
  } catch (e) {
    // Fallback local session id
    currentSessionId = 'sess_' + char + '_' + Math.random().toString(36).substring(2, 10);
    document.getElementById('session-id-input').value = currentSessionId;
    updateUrlPreview();
  }
}

async function resetSession() {
  await initSession(true);
  document.getElementById('response-output').textContent = `New session initialized:\nSession ID: ${currentSessionId}\n\nMemory is fresh and ready!`;
}

function populateDropdown(list) {
  const select = document.getElementById('char-select');
  if (!select) return;
  select.innerHTML = '';
  list.forEach(c => {
    const opt = document.createElement('option');
    opt.value = c.id;
    opt.textContent = `${c.name} (${c.description.slice(0, 35)}...)`;
    select.appendChild(opt);
  });
  onCharacterChange();
}

function renderCharacterGrid(list) {
  const grid = document.getElementById('characters-grid');
  if (!grid) return;
  grid.innerHTML = '';

  list.forEach(c => {
    const card = document.createElement('div');
    card.className = 'char-card';
    card.innerHTML = `
      <div class="char-card-media">
        <img src="${c.avatar}" alt="${c.name}" onerror="this.src='https://api.dicebear.com/7.x/bottts/svg?seed=${c.name}'">
      </div>
      <div class="char-card-body">
        <div class="char-card-name">${c.name}</div>
        <div class="char-card-by">By ${c.creator || 'Community'} • ${c.chats || ''}</div>
        <div class="char-card-desc">${c.description}</div>
        <div class="char-tags">
          ${(c.tags || []).slice(0, 3).map(t => `<span class="tag-badge">${t}</span>`).join('')}
        </div>
        <button class="btn btn-outline char-card-action" onclick="selectCharacter('${c.id}')">Chat with ${c.name}</button>
      </div>
    `;
    grid.appendChild(card);
  });
}

async function selectCharacter(charId) {
  const select = document.getElementById('char-select');
  if (select) {
    select.value = charId;
    await onCharacterChange();
  }
  const tester = document.getElementById('tester');
  if (tester) {
    tester.scrollIntoView({ behavior: 'smooth' });
  }
}

async function onCharacterChange() {
  const select = document.getElementById('char-select');
  const selectedCharId = select ? select.value : 'Kohana';
  const char = charactersData.find(c => c.id === selectedCharId) || {
    name: selectedCharId,
    description: 'AI Companion',
    avatar: 'https://loveimages.b-cdn.net/characters/Kohana/icon/f13acc8052570b13217e33537415f121888e41b9eddba937efd2bfff1b7254b1.jpg',
    greeting: `*${selectedCharId} smiles warmly.* Hello!`
  };

  document.getElementById('char-name').textContent = char.name;
  document.getElementById('char-desc').textContent = char.description;
  document.getElementById('char-avatar').src = char.avatar;

  // Reset session for the new character
  await initSession(true);
}

function renderChatLog() {
  const container = document.getElementById('chat-messages');
  if (!container) return;
  container.innerHTML = '';

  const charName = document.getElementById('char-name').textContent || 'AI';
  const userName = document.getElementById('username-input').value || 'You';

  chatHistory.forEach(msg => {
    const bubble = document.createElement('div');
    bubble.className = `chat-bubble ${msg.role}`;
    bubble.innerHTML = `
      <div class="chat-bubble-author">${msg.role === 'assistant' ? charName : userName}</div>
      <div class="chat-bubble-text">${escapeHtml(msg.content)}</div>
    `;
    container.appendChild(bubble);
  });

  container.scrollTop = container.scrollHeight;
}

function updateCounter() {
  const counterEl = document.getElementById('memory-counter');
  if (counterEl) {
    const count = chatHistory.length;
    counterEl.textContent = `${count} message${count === 1 ? '' : 's'} in memory`;
  }
}

function escapeHtml(str) {
  return (str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function getGeneratedApiUrl() {
  const char = document.getElementById('char-select')?.value || 'Kohana';
  const prompt = document.getElementById('prompt-input')?.value || '';
  const username = document.getElementById('username-input')?.value || '';
  const format = document.getElementById('format-select')?.value || 'json';
  const sid = currentSessionId || document.getElementById('session-id-input')?.value || '';

  const origin = window.location.origin || '';
  const params = new URLSearchParams();
  if (prompt) params.append('prompt', prompt);
  if (char) params.append('character', char);
  if (sid) params.append('session_id', sid);
  if (username && username !== 'Guest') params.append('username', username);
  if (format && format !== 'json') params.append('format', format);

  return `${origin}/api/chat?${params.toString()}`;
}

function updateUrlPreview() {
  const fullUrl = getGeneratedApiUrl();
  const urlEl = document.getElementById('full-url-preview');
  if (urlEl) {
    urlEl.textContent = fullUrl;
  }
}

async function executeApiTest() {
  const sendBtn = document.getElementById('send-btn');
  const outputEl = document.getElementById('response-output');
  const timeEl = document.getElementById('response-time');
  const promptInput = document.getElementById('prompt-input');

  const prompt = promptInput.value.trim();
  if (!prompt) {
    alert('Please enter a message / prompt first.');
    return;
  }

  // Add user message to UI immediately
  chatHistory.push({ role: 'user', content: prompt });
  renderChatLog();
  updateCounter();

  const url = getGeneratedApiUrl();
  const startTime = Date.now();

  sendBtn.disabled = true;
  sendBtn.textContent = 'Generating reply with memory...';
  timeEl.textContent = 'Fetching...';
  outputEl.textContent = `Sending GET request to:\n${url}\n\nPlease wait for the AI to recall memory and respond...`;

  try {
    const res = await fetch(url);
    const duration = Date.now() - startTime;
    const isJson = res.headers.get('content-type')?.includes('application/json');

    if (isJson) {
      const data = await res.json();
      outputEl.textContent = JSON.stringify(data, null, 2);
      if (data.reply) {
        chatHistory.push({ role: 'assistant', content: data.reply });
        renderChatLog();
        updateCounter();
      }
      if (data.session_id) {
        currentSessionId = data.session_id;
        document.getElementById('session-id-input').value = currentSessionId;
        updateUrlPreview();
      }
    } else {
      const text = await res.text();
      outputEl.textContent = text;
      chatHistory.push({ role: 'assistant', content: text });
      renderChatLog();
      updateCounter();
    }

    timeEl.textContent = `Status: ${res.status} (${duration}ms)`;
    promptInput.value = '';
    updateUrlPreview();
  } catch (err) {
    outputEl.textContent = `Error: ${err.message}`;
    timeEl.textContent = 'Error';
  } finally {
    sendBtn.disabled = false;
    sendBtn.textContent = 'Send GET Request';
  }
}

async function viewHistory() {
  if (!currentSessionId) {
    alert('No active session.');
    return;
  }
  try {
    const res = await fetch(`/api/chat?action=history&session_id=${encodeURIComponent(currentSessionId)}`);
    const data = await res.json();
    document.getElementById('response-output').textContent = JSON.stringify(data, null, 2);
    document.getElementById('response-time').textContent = `History (${data.total_messages || 0} msgs)`;
  } catch (e) {
    alert('Could not retrieve history: ' + e.message);
  }
}

function copyGeneratedUrl() {
  const url = getGeneratedApiUrl();
  copyText(url);
}

function copyText(text) {
  navigator.clipboard.writeText(text).then(() => {
    alert('Copied URL to clipboard:\n' + text);
  }).catch(() => {
    prompt('Copy this URL:', text);
  });
}
