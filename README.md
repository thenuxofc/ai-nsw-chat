# AI Girl Chat - REST GET API with Memory 🚀

A fast, lightweight, and fully working **GET & POST REST API** for AI character chat with **persistent conversation memory**, built for easy deployment to **Netlify** and **GitHub**.

## 🌟 Key Features

- **Direct GET API**: Chat simply by visiting a URL like `/api/chat?prompt=hello&character=Kohana`.
- **Persistent Conversation Memory**: Continuous memory between messages using `session_id`. The AI remembers previous context, names, and user statements!
- **Session ID Generation**: Create dedicated session IDs with character greetings via `/api/chat?action=new_session&character=Kohana`.
- **History & Memory Inspection**: View full message memory anytime with `/api/chat?action=history&session_id=...`.
- **Preconfigured Characters**: Full support for Kohana, Linda, Miranda, Della Dean, Monica Schultz, Lettie, Ruby Bax, Sarah Wood, and custom characters.
- **Multiple Output Formats**: Supports clean JSON or raw plain text (`format=text`).
- **Netlify Ready**: Includes `netlify.toml` and serverless functions (`netlify/functions/chat.js` and `characters.js`).
- **Zero External Dependencies**: Uses native Node.js (Node 18+), meaning 0-second install and build times on Netlify.
- **Local Dev Server**: Includes `server.js` to run locally or on any VPS/Node host.
- **Interactive Web UI**: Test endpoints and chat in real-time in your browser at `/`.

---

## 🧠 How Memory Works

### 1. Generate a Session ID
To start a new conversation with a character and get their greeting:
```http
GET /api/chat?action=new_session&character=Kohana
```
**Response:**
```json
{
  "status": "success",
  "action": "new_session_created",
  "session_id": "sess_Kohana_afbe9974d87a391f",
  "character": "Kohana",
  "greeting": "*Kohana is sitting next to Guest on the couch...*",
  "message_count": 1,
  "created_at": 1793080600
}
```

### 2. Chat with Memory
Send your message and include the `session_id`:
```http
GET /api/chat?prompt=My+name+is+Alex+and+I+like+coffee&session_id=sess_Kohana_afbe9974d87a391f
```
**Response:**
```json
{
  "status": "success",
  "session_id": "sess_Kohana_afbe9974d87a391f",
  "character": "Kohana",
  "prompt": "My name is Alex and I like coffee",
  "reply": "*Kohana smiles softly* It's lovely to meet you Alex. I can make some fresh coffee for us anytime!",
  "message_count": 3
}
```

### 3. Verify Memory Recall
In the next message, ask a question about what you previously mentioned:
```http
GET /api/chat?prompt=What+is+my+name+and+what+do+I+like?&session_id=sess_Kohana_afbe9974d87a391f
```
The character will recall:
> *"You're Alex, and you told me you like coffee! I didn't forget."*

---

## ⚡ API Endpoints & Query Parameters

### Base Chat Endpoint
```http
GET /api/chat?prompt={message}&character={name}&session_id={id}
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `prompt` | `string` | **Yes** | Your message to the character. (Aliases: `text`, `message`, `q`) |
| `character` | `string` | No | Character name or ID. Default: `Kohana`. (Aliases: `char`, `char_id`) |
| `session_id` | `string` | No | Session identifier to preserve context between messages. |
| `action` | `string` | No | Special actions: `new_session`, `history`, or `clear`. |
| `username` | `string` | No | Name the character calls you. Default: `Guest`. |
| `format` | `string` | No | `json` (default) or `text` (returns raw text response for bots/scripts). |

### Special Actions

- **New Session**: `GET /api/chat?action=new_session&character=Kohana`
- **View Memory History**: `GET /api/chat?action=history&session_id=<your_session_id>`
- **Clear Memory**: `GET /api/chat?action=clear&session_id=<your_session_id>`
- **List Characters**: `GET /api/characters`

---

## 💻 Local Development

1. Start the local server:
   ```bash
   npm start
   ```

2. Open your browser:
   - Web UI & Live Tester: [http://localhost:3000](http://localhost:3000)
   - Test GET API with Memory: [http://localhost:3000/api/chat?prompt=hello&character=Kohana](http://localhost:3000/api/chat?prompt=hello&character=Kohana)
   - Characters List: [http://localhost:3000/api/characters](http://localhost:3000/api/characters)

---

## 🚀 How to Deploy to Netlify (Step-by-Step)

### Step 1: Commit and Push to GitHub
```bash
git add .
git commit -m "feat: add conversational memory and session generation"
git push -u origin main
```

### Step 2: Connect to Netlify
1. Go to [Netlify Dashboard](https://app.netlify.com).
2. Click **"Add new site"** &rarr; **"Import an existing project"**.
3. Select **GitHub** and choose your repository.
4. Netlify will automatically detect:
   - **Publish directory:** `public`
   - **Functions directory:** `netlify/functions`
5. Click **"Deploy site"**.
6. Your live API with memory is online at `https://<site-name>.netlify.app/api/chat?prompt=hello`!

---

## 📄 License
MIT
