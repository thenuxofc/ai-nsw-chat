# AI Girl Chat - REST GET API 🚀

A fast, lightweight, and fully working **GET & POST REST API** for AI character chat, built for easy deployment to **Netlify** and **GitHub**.

## 🌟 Key Features

- **Direct GET API**: Chat simply by visiting a URL like `/api/chat?prompt=hello&character=Kohana`.
- **Preconfigured Characters**: Full support for characters including Kohana, Linda, Miranda, Della Dean, Monica Schultz, Lettie, Ruby Bax, Sarah Wood, and custom characters.
- **Multiple Output Formats**: Supports clean JSON or raw plain text (`format=text`).
- **Netlify Ready**: Includes `netlify.toml` and serverless functions (`netlify/functions/chat.js` and `characters.js`).
- **Zero External Dependencies**: Uses native Node.js (Node 18+), meaning 0-second install and build times on Netlify.
- **Local Dev Server**: Includes `server.js` to run locally or on any VPS/Node host.
- **Interactive Web UI**: Test endpoints visually in browser at `/`.

---

## ⚡ Quick Start: GET API

### Basic Request
```http
GET /api/chat?prompt=Hello&character=Kohana
```

### Full Example with Netlify URL
```
https://<your-netlify-site>.netlify.app/api/chat?prompt=How+are+you+doing+today?&character=Kohana
```

### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `prompt` | `string` | **Yes** | Your message to the character. (Aliases: `text`, `message`, `q`) |
| `character` | `string` | No | Character name or ID. Default: `Kohana`. (Aliases: `char`, `char_id`) |
| `session_id` | `string` | No | Session identifier to preserve context between messages. |
| `username` | `string` | No | Name the character calls you. Default: `Guest`. |
| `format` | `string` | No | `json` (default) or `text` (returns raw text response for bots/scripts). |

---

## 📦 Example Responses

### JSON Response (Default)
`GET /api/chat?prompt=Hi+Kohana&character=Kohana`

```json
{
  "status": "success",
  "character": "Kohana",
  "character_id": "Kohana",
  "prompt": "Hi Kohana",
  "reply": "*Kohana looks into Guest's eyes with a warm, sincere gaze.* \"I was thinking we could celebrate with a little trip. Somewhere you've always wanted to go. What do you say, darling?\"",
  "session_id": "sess_d9603934ac11c758b41c",
  "avatar": "https://loveimages.b-cdn.net/characters/Kohana/icon/f13acc8052570b13217e33537415f121888e41b9eddba937efd2bfff1b7254b1.jpg",
  "model": "mistralai/mistral-nemo",
  "created": 1793080587
}
```

### Raw Plain Text Response
`GET /api/chat?prompt=Hi&character=Kohana&format=text`

```text
*Kohana smiles warmly* "Hello sweetie! What would you like to do today?"
```

---

## 👩 Supported Characters

Call `GET /api/characters` to list all characters or pass their names in the `character` query parameter:

1. **Kohana** (`character=Kohana`) - Sweet, caring stepmom.
2. **Linda** (`character=Linda`) - Mother dressing up to feel desired.
3. **Miranda | Futa Gang** (`character=miranda-futa-gang`) - Dominant party character.
4. **Della Dean** (`character=della-dean`) - Socially awkward stepsister.
5. **Monica Schultz** (`character=monica-schultz`) - Roommate / gender-bender companion.
6. **Lettie** (`character=lettie`) - Playful stepsister.
7. **Ruby Bax** (`character=ruby-bax`) - Teacher secret roleplay.
8. **Sarah Wood** (`character=sarah-wood`) - Timid, trembling girl.

---

## 💻 Local Development

1. Clone or open this folder:
   ```bash
   git clone <your-repo-url>
   cd ai-chat-slut
   ```

2. Start the local server:
   ```bash
   npm start
   ```

3. Open your browser:
   - Web UI & Live Tester: [http://localhost:3000](http://localhost:3000)
   - Test GET API: [http://localhost:3000/api/chat?prompt=hello&character=Kohana](http://localhost:3000/api/chat?prompt=hello&character=Kohana)
   - Characters List: [http://localhost:3000/api/characters](http://localhost:3000/api/characters)

---

## 🚀 How to Deploy to Netlify (Step-by-Step)

### Step 1: Push Code to GitHub
```bash
git init
git add .
git commit -m "Initial commit of AI Girl Chat GET API"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo-name>.git
git push -u origin main
```

### Step 2: Deploy on Netlify
1. Go to [Netlify Dashboard](https://app.netlify.com).
2. Click **"Add new site"** &rarr; **"Import an existing project"**.
3. Select **GitHub** and choose your repository.
4. Netlify will automatically detect:
   - **Publish directory:** `public`
   - **Functions directory:** `netlify/functions`
5. Click **"Deploy site"**.
6. That's it! Your site will be live at `https://<site-name>.netlify.app/api/chat?prompt=hello`.

---

## 🛠 Integration Code Snippets

### cURL
```bash
# JSON output
curl "https://your-site.netlify.app/api/chat?prompt=hello&character=Kohana"

# Plain text output
curl "https://your-site.netlify.app/api/chat?prompt=hello&character=Kohana&format=text"
```

### JavaScript / Browser / Node.js
```javascript
const response = await fetch("https://your-site.netlify.app/api/chat?prompt=Hello&character=Kohana");
const data = await response.json();
console.log(data.reply);
```

### Python
```python
import requests

res = requests.get("https://your-site.netlify.app/api/chat", params={
    "prompt": "Hello sweetheart",
    "character": "Kohana"
})
print(res.json()["reply"])
```

### Discord / Telegram Bot (Webhook / Web GET)
Simply use the `format=text` parameter:
```
https://your-site.netlify.app/api/chat?prompt=hey&character=Kohana&format=text
```
It returns directly the message string, perfect for bots without needing to parse JSON.

---

## 📄 License
MIT
