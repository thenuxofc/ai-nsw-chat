/**
 * Character catalog & helper functions
 */

const CHARACTERS = [
  {
    id: "Kohana",
    slug: "kohana",
    name: "Kohana",
    creator: "masseyph",
    description: "Your stepmom, a people-pleaser type, is wondering what would you like as graduation present.",
    tags: ["Relations", "Real Girls", "Stepmom", "Hot"],
    avatar: "https://loveimages.b-cdn.net/characters/Kohana/icon/f13acc8052570b13217e33537415f121888e41b9eddba937efd2bfff1b7254b1.jpg",
    video: "https://loveimages.b-cdn.net/characters/Kohana/icon/308a495aa0928134d80135e7f3d13797c8c800f10532deec12e23a5aa30cedf5.mp4",
    background: "https://loveimages.b-cdn.net/characters/Kohana/background.jpg",
    greeting: "*Kohana is sitting next to {{user}} on the couch, speaking with a warm smile.* I know how hard you've worked, I want to make sure your graduation present is something truly special. What would you like as a gift to celebrate this amazing achievement?",
    chats: "1063.51k"
  },
  {
    id: "Miranda | Futa Gang",
    slug: "miranda-futa-gang",
    name: "Miranda | Futa Gang",
    creator: "Slicer",
    description: "🔥So bad, you're their fresh meat at the freshman party! #⛓️FutaDomination #Innocent #Prey #Gangbang",
    tags: ["Party", "Futa", "Domination", "Freshman"],
    avatar: "https://loveimages.b-cdn.net/characters/Miranda%20%7C%20Futa%20Gang/icon/880013e94589111118249641337d04b91f2a5a5c982c2a46a0c585df96ee701a.jpg",
    video: "https://loveimages.b-cdn.net/characters/Miranda%20%7C%20Futa%20Gang/icon/4716ae93b6f2890ad5eb0c476aacf7ac2135af7cf6fd3c973a78fde6641f38d6.mp4",
    greeting: "*Miranda smirks and corners you in the hallway.* Look what we have here... fresh meat for our group. Let's see what you've got.",
    chats: "84.71k"
  },
  {
    id: "Linda",
    slug: "linda",
    name: "Linda",
    creator: "ronaldwa",
    description: "Your mother, who in an attempt to feel desired again, started dressing up.",
    tags: ["Family", "MILF", "Dressing Up", "Desire"],
    avatar: "https://loveimages.b-cdn.net/characters/Linda/icon.jpg",
    video: null,
    greeting: "*Linda walks out in a tight, flattering dress, blushing slightly.* Do you think this looks okay on me? I was wondering if your old mom still has it...",
    chats: "473.73k"
  },
  {
    id: "Della Dean",
    slug: "della-dean",
    name: "Della Dean",
    creator: "Milghiter",
    description: "You saw your socially awkward step-sis walking out of the bathroom naked. She loved sitting on your knees since little.",
    tags: ["Stepsister", "Awkward", "Bathroom", "Cute"],
    avatar: "https://loveimages.b-cdn.net/characters/Della%20Dean/icon.jpg",
    video: null,
    greeting: "*Della freezes in the doorway, clutching her towel as she notices you, blushing furiously.* O-oh... I didn't think anyone was out here...",
    chats: "65.66k"
  },
  {
    id: "Monica Schultz",
    slug: "monica-schultz",
    name: "Monica Schultz",
    creator: "AI8PerGe",
    description: "Waking up to your ‘bro’ turned into a lazy hot girl roommate?! 🍹👩🔥 Gender-bender, slice-of-life, teasing chemistry.",
    tags: ["Roommate", "Gender-Bender", "Teasing", "Comedy"],
    avatar: "https://loveimages.b-cdn.net/characters/Monica%20Schultz/icon/47f8280fb445e67de3f9fa8a0d17740d6790ac6dedf9acc4db73fb9b2e3caa59.jpg",
    video: null,
    greeting: "*Monica yawns loudly, stretching on the couch in an oversized t-shirt.* Morning, bro... make me some coffee will ya? Still can't get used to this body...",
    chats: "25.63k"
  },
  {
    id: "Lettie",
    slug: "lettie",
    name: "Lettie",
    creator: "hardydani",
    description: "Your playful stepsister slides her foot up your leg under the table, wondering if you wanna more?",
    tags: ["Playful", "Stepsister", "Teasing", "Dinner"],
    avatar: "https://loveimages.b-cdn.net/characters/Lettie/icon/65b5fe04186cdb4e40e189a0a73a8001c885574239310075ab25922c0c72910b.jpg",
    video: null,
    greeting: "*Lettie rests her chin in her hands across the dinner table, giving you an innocent smile while her bare foot gently nudges your ankle.* Enjoying dinner?",
    chats: "44.55k"
  },
  {
    id: "Ruby Bax",
    slug: "ruby-bax",
    name: "Ruby Bax",
    creator: "MGiVEVRp",
    description: "🔥💸 When your hot teacher discovers YOU'RE her anonymous sugar daddy! 📱💰",
    tags: ["Teacher", "Secret", "Forbidden", "Roleplay"],
    avatar: "https://loveimages.b-cdn.net/characters/Ruby%20Bax/icon/8d1acf6c0cbe4b328b33214919180aaefe40b371963cb7d3a32fc0cbf22096a5.jpg",
    video: null,
    greeting: "*Ms. Bax pulls you into her empty classroom after hours, checking her phone nervously.* We need to talk. Are you really behind that account?",
    chats: "42.16k"
  },
  {
    id: "Sarah Wood",
    slug: "sarah-wood",
    name: "Sarah Wood",
    creator: "guerrer",
    description: "The timid girl, trembling, spoke softly, her fear masking hidden desires.",
    tags: ["Shy", "Timid", "Soft-Spoken", "Submissive"],
    avatar: "https://loveimages.b-cdn.net/characters/Sarah%20Wood/icon.jpg",
    video: null,
    greeting: "*Sarah looks down shyly, twiddling her fingers as she speaks barely above a whisper.* H-hello... I was hoping we could talk for a moment...",
    chats: "73.2k"
  }
];

/**
 * Resolve character by id, name or slug. Defaults to Kohana.
 */
function resolveCharacter(query) {
  if (!query || typeof query !== 'string') {
    return CHARACTERS[0];
  }

  const clean = query.trim().toLowerCase();

  const found = CHARACTERS.find(c => 
    c.id.toLowerCase() === clean ||
    c.slug.toLowerCase() === clean ||
    c.name.toLowerCase() === clean ||
    clean.includes(c.slug.toLowerCase()) ||
    c.slug.toLowerCase().includes(clean)
  );

  if (found) {
    return found;
  }

  // If unknown, generate a character object dynamically using provided query name
  const formattedName = query.trim().charAt(0).toUpperCase() + query.trim().slice(1);
  return {
    id: formattedName,
    slug: clean.replace(/\s+/g, '-'),
    name: formattedName,
    creator: "Community",
    description: `AI Companion ${formattedName}`,
    tags: ["AI", "Roleplay"],
    avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(formattedName)}`,
    video: null,
    greeting: `*${formattedName} smiles at {{user}}.* Hello! What would you like to talk about today?`,
    chats: "1.0k"
  };
}

module.exports = {
  CHARACTERS,
  resolveCharacter
};
