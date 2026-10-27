let charactersData = [];

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
    // Fallback static list
    charactersData = [
      {
        id: "Kohana",
        name: "Kohana",
        creator: "masseyph",
        description: "Your stepmom, a people-pleaser type, is wondering what would you like as graduation present.",
        tags: ["Relations", "Real Girls", "Stepmom"],
        avatar: "https://loveimages.b-cdn.net/characters/Kohana/icon/f13acc8052570b13217e33537415f121888e41b9eddba937efd2bfff1b7254b1.jpg"
      },
      {
        id: "Miranda | Futa Gang",
        name: "Miranda | Futa Gang",
        creator: "Slicer",
        description: "🔥So bad, you're their fresh meat at the freshman party! #⛓️FutaDomination",
        tags: ["Party", "Domination"],
        avatar: "https://loveimages.b-cdn.net/characters/Miranda%20%7C%20Futa%20Gang/icon/880013e94589111118249641337d04b91f2a5a5c982c2a46a0c585df96ee701a.jpg"
      },
      {
        id: "Linda",
        name: "Linda",
        creator: "ronaldwa",
        description: "Your mother, who in an attempt to feel desired again, started dressing up.",
        tags: ["Family", "MILF"],
        avatar: "https://loveimages.b-cdn.net/characters/Linda/icon.jpg"
      },
      {
        id: "Sarah Wood",
        name: "Sarah Wood",
        creator: "guerrer",
        description: "The timid girl, trembling, spoke softly, her fear masking hidden desires.",
        tags: ["Shy", "Timid"],
        avatar: "https://loveimages.b-cdn.net/characters/Sarah%20Wood/icon.jpg"
      }
    ];
    renderCharacterGrid(charactersData);
  }
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

function selectCharacter(charId) {
  const select = document.getElementById('char-select');
  if (select) {
    select.value = charId;
    onCharacterChange();
  }
  const tester = document.getElementById('tester');
  if (tester) {
    tester.scrollIntoView({ behavior: 'smooth' });
  }
}

function onCharacterChange() {
  const select = document.getElementById('char-select');
  const selectedCharId = select ? select.value : 'Kohana';
  const char = charactersData.find(c => c.id === selectedCharId) || {
    name: selectedCharId,
    description: 'AI Companion',
    avatar: 'https://loveimages.b-cdn.net/characters/Kohana/icon/f13acc8052570b13217e33537415f121888e41b9eddba937efd2bfff1b7254b1.jpg'
  };

  document.getElementById('char-name').textContent = char.name;
  document.getElementById('char-desc').textContent = char.description;
  document.getElementById('char-avatar').src = char.avatar;

  updateUrlPreview();
}

function getGeneratedApiUrl() {
  const char = document.getElementById('char-select').value;
  const prompt = document.getElementById('prompt-input').value;
  const username = document.getElementById('username-input').value;
  const format = document.getElementById('format-select').value;

  const origin = window.location.origin || '';
  const params = new URLSearchParams();
  if (prompt) params.append('prompt', prompt);
  if (char) params.append('character', char);
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

  const url = getGeneratedApiUrl();
  const startTime = Date.now();

  sendBtn.disabled = true;
  sendBtn.textContent = 'Generating reply...';
  timeEl.textContent = 'Fetching...';
  outputEl.textContent = `Sending GET request to:\n${url}\n\nPlease wait a moment for the AI to respond...`;

  try {
    const res = await fetch(url);
    const duration = Date.now() - startTime;
    const isJson = res.headers.get('content-type')?.includes('application/json');

    if (isJson) {
      const data = await res.json();
      outputEl.textContent = JSON.stringify(data, null, 2);
    } else {
      const text = await res.text();
      outputEl.textContent = text;
    }

    timeEl.textContent = `Status: ${res.status} (${duration}ms)`;
  } catch (err) {
    outputEl.textContent = `Error: ${err.message}`;
    timeEl.textContent = 'Error';
  } finally {
    sendBtn.disabled = false;
    sendBtn.textContent = 'Send GET Request';
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

// Event listeners for real-time URL updates
document.addEventListener('DOMContentLoaded', () => {
  loadCharacters();
  const promptInput = document.getElementById('prompt-input');
  const usernameInput = document.getElementById('username-input');
  const formatSelect = document.getElementById('format-select');

  if (promptInput) promptInput.addEventListener('input', updateUrlPreview);
  if (usernameInput) usernameInput.addEventListener('input', updateUrlPreview);
  if (formatSelect) formatSelect.addEventListener('change', updateUrlPreview);
  updateUrlPreview();
});
