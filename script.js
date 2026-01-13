/* Turbo Descriptions — JC Spanish
   - 10 levels (easy → hard)
   - 10 prompts per round
   - Turbo scoring: time + (wrong * penalty). Blanks count wrong.
   - Insane-speed marking buttons
   - Match Code (7 chars) to sync prompts across devices
*/

(function () {
  "use strict";

  const PROMPTS_PER_ROUND = 10;

  // ----------------- Level themes / hints -----------------
  const LEVEL_INFO = [
    { title: "Basics: me & my friend", hint: "Use: soy / tengo / me gusta. Short sentences." },
    { title: "Looks & personality", hint: "Adjectives + agreement: alto/alta, simpático/a." },
    { title: "My house", hint: "Hay / tiene / está. Rooms + basic details." },
    { title: "My room", hint: "Prepositions: al lado de, encima de. Describe objects." },
    { title: "My school", hint: "Facilities: hay… / es… / está… + opinions." },
    { title: "Daily routine", hint: "Present tense sequencing: primero, luego, después." },
    { title: "Best friend (deeper)", hint: "Give reasons: porque, ya que. Compare: más/menos." },
    { title: "Town & area", hint: "Pros/cons, opinions, recommendations." },
    { title: "Plans & preferences", hint: "Near future: voy a… + justify choices." },
    { title: "Full description challenge", hint: "Longer paragraph. Variety + connectors." },
  ];

  function penaltyForLevel(level) {
    return 12 + level * 3; // L1=15s ... L10=42s
  }
  function sprintCapForLevel(level) {
    return Math.max(45, 80 - level * 3); // L1~77s ... L10~50s
  }

  // ----------------- Prompt pools (Spanish production) -----------------
  // Each level has a pool; the round draws 10 randomly from that pool.
  const POOLS = {
    1: [
      { badge: "Yo", text: "Write 4 sentences about YOU (name, age, where you live, one hobby)." , chips:["ser","structure"]},
      { badge: "Amigo/a", text: "Describe your best friend in 4 sentences (name, age, what they are like)." , chips:["ser","accent"]},
      { badge: "Gustos", text: "Say 3 things you like and 1 you don’t like (me gusta / no me gusta)." , chips:["structure"]},
      { badge: "Familia", text: "Describe your family in 3 sentences (how many people + one detail)." , chips:["structure"]},
      { badge: "Clase", text: "Describe your Spanish class in 3 sentences (easy/hard/fun + why)." , chips:["ser"]},
      { badge: "Cole", text: "Write 3 sentences: what your school is like (big/small/modern) + one opinion." , chips:["ser"]},
      { badge: "Ropa", text: "Say what you are wearing today (llevo… / tengo…)." , chips:["accent"]},
      { badge: "Tiempo", text: "Describe the weather today in 2 sentences (hace… / está…)." , chips:["estar"]},
      { badge: "Tiempo libre", text: "Write 3 short sentences: what you do after school." , chips:["structure"]},
      { badge: "Fin", text: "Write 2 sentences about your weekend (normally…)." , chips:["structure"]},
      { badge: "Extra", text: "Write 3 adjectives to describe you and explain one." , chips:["ser"]},
      { badge: "Extra", text: "Write 4 basic sentences using: soy / tengo / vivo / me gusta." , chips:["ser","structure"]},
    ],
    2: [
      { badge: "Físico", text: "Describe someone’s appearance (5 details: hair/eyes/height/clothes)." , chips:["ser","accent"]},
      { badge: "Personalidad", text: "Describe personality using 5 adjectives + one example." , chips:["ser"]},
      { badge: "Comparar", text: "Compare two friends (más… que / menos… que) in 4 sentences." , chips:["structure"]},
      { badge: "Rutina", text: "Describe a friend’s routine after school (5 short steps)." , chips:["structure"]},
      { badge: "Opinión", text: "Describe your school: 2 positives + 1 negative + why." , chips:["ser","structure"]},
      { badge: "En clase", text: "Describe your favourite subject and why (4 sentences)." , chips:["structure"]},
      { badge: "Gustos", text: "Write 5 sentences: likes/dislikes with reasons (porque…)." , chips:["structure"]},
      { badge: "Amigo/a", text: "Describe your best friend’s family in 4 sentences." , chips:["structure"]},
      { badge: "Descripción", text: "Describe your teacher (appearance + personality) in 5 sentences." , chips:["ser"]},
      { badge: "Desafío", text: "Use 6 adjectives correctly (agreement matters)." , chips:["accent"]},
      { badge: "Desafío", text: "Write 4 sentences using: pero / también / y / porque." , chips:["structure"]},
      { badge: "Desafío", text: "Write 3 sentences with ‘muy’ and 2 with ‘bastante’." , chips:["structure"]},
    ],
    3: [
      { badge: "Casa", text: "Describe your house in 6 sentences (size, rooms, location, opinion)." , chips:["ser","estar","structure"]},
      { badge: "Hay", text: "Use ‘hay’ in 6 different sentences about your house." , chips:["structure"]},
      { badge: "Habitaciones", text: "Describe 3 rooms (2 details each) + favourite room and why." , chips:["structure"]},
      { badge: "Zona", text: "Describe where your house is (near/far from… + transport)." , chips:["estar"]},
      { badge: "Opinión", text: "2 things you like about your home + 1 thing you’d change." , chips:["structure"]},
      { badge: "Rutina", text: "Describe what you do at home after school (6 steps)." , chips:["structure"]},
      { badge: "Comida", text: "Describe meals at home (breakfast + dinner) in 5 sentences." , chips:["accent"]},
      { badge: "Mascota", text: "Describe a pet (or a pet you’d like) in 5 sentences." , chips:["ser","structure"]},
      { badge: "Tecnología", text: "Describe technology at home (Wi-Fi, phone, TV) + opinion." , chips:["structure"]},
      { badge: "Invitar", text: "Describe inviting a friend over (plans + what you will do) using ‘vamos a…’." , chips:["structure"]},
      { badge: "Extra", text: "Describe your garden/yard/balcony (or say you don’t have one) + opinion." , chips:["structure"]},
      { badge: "Extra", text: "Write a mini paragraph (6–7 lines) describing your house." , chips:["structure"]},
    ],
    4: [
      { badge: "Mi cuarto", text: "Describe your room in 7 sentences (furniture + colours + opinion)." , chips:["structure"]},
      { badge: "Posición", text: "Use 5 prepositions: al lado de / encima de / debajo de / delante de / detrás de." , chips:["structure"]},
      { badge: "Orden", text: "Is your room tidy? Explain with 5 sentences (a veces… normalmente…)." , chips:["structure"]},
      { badge: "Objetos", text: "Describe 6 objects in your room (colour + where it is)." , chips:["accent"]},
      { badge: "Estudiar", text: "Describe where/how you study at home (5 sentences)." , chips:["structure"]},
      { badge: "Cambios", text: "What would you change in your room? Give 3 changes + reasons." , chips:["structure"]},
      { badge: "Rutina", text: "Describe your morning routine in your room (6 steps)." , chips:["structure"]},
      { badge: "Comparar", text: "Compare your room with your friend’s (4 sentences)." , chips:["structure"]},
      { badge: "Fotos", text: "Describe 2 photos/posters you have (or would like) + why." , chips:["structure"]},
      { badge: "Música", text: "Describe your favourite music in your room (what/when/why)." , chips:["structure"]},
      { badge: "Extra", text: "Write 6 sentences with: hay / tengo / está / me gusta." , chips:["structure"]},
      { badge: "Extra", text: "Write a 7–8 line paragraph describing your room." , chips:["structure"]},
    ],
    5: [
      { badge: "Colegio", text: "Describe your school building (size, old/new, location) in 7 sentences." , chips:["ser","estar","structure"]},
      { badge: "Instalaciones", text: "List 6 facilities using ‘hay’ + give one opinion." , chips:["structure"]},
      { badge: "Uniforme", text: "Describe school uniform (or clothes rules) + opinion." , chips:["structure"]},
      { badge: "Asignaturas", text: "Describe 3 subjects (why you like/dislike) + one favourite." , chips:["structure"]},
      { badge: "Profes", text: "Describe a teacher (appearance + personality + why you like them)." , chips:["ser"]},
      { badge: "Recreo", text: "Describe break time (what you do, with who, where) in 6 sentences." , chips:["structure"]},
      { badge: "Comedor", text: "Describe lunch at school (what you eat, where, with who) in 6 sentences." , chips:["structure"]},
      { badge: "Reglas", text: "Describe 3 school rules + your opinion about them." , chips:["structure"]},
      { badge: "Clubes", text: "Describe clubs/sports at school + why you do/don’t join." , chips:["structure"]},
      { badge: "Mejorar", text: "What would improve your school? 3 ideas + reasons." , chips:["structure"]},
      { badge: "Extra", text: "Write a 8–10 line paragraph: ‘Mi colegio’." , chips:["structure"]},
      { badge: "Extra", text: "Use 6 connectors: primero, luego, además, también, pero, porque." , chips:["structure"]},
    ],
    6: [
      { badge: "Rutina", text: "Describe your weekday routine from morning to night (8 steps)." , chips:["structure"]},
      { badge: "Horas", text: "Include 4 times (a las…) in your routine." , chips:["structure","accent"]},
      { badge: "Después", text: "Describe what you do after school (sports/homework) with reasons." , chips:["structure"]},
      { badge: "Fin de semana", text: "Describe your weekend routine (normally + sometimes) in 8 sentences." , chips:["structure"]},
      { badge: "Salud", text: "Describe what you do to stay healthy (food, sport, sleep) + opinion." , chips:["structure"]},
      { badge: "Móvil", text: "Describe your phone use (how often, what apps) + one rule you should follow." , chips:["structure"]},
      { badge: "Amigos", text: "Describe meeting friends (where, what you do, why you enjoy it)." , chips:["structure"]},
      { badge: "Tareas", text: "Describe chores at home (3 chores + how you feel about them)." , chips:["structure"]},
      { badge: "Música", text: "Describe your music tastes with 2 examples + why." , chips:["structure"]},
      { badge: "Extra", text: "Write a 9–10 line paragraph describing a normal day." , chips:["structure"]},
      { badge: "Extra", text: "Use: normalmente / a veces / nunca / siempre correctly in 6 sentences." , chips:["structure"]},
      { badge: "Extra", text: "Write 3 sentences with ‘me gustaría’ and explain why." , chips:["structure"]},
    ],
    7: [
      { badge: "Mejor amigo/a", text: "Full description: appearance + personality + what you do together (10 lines)." , chips:["ser","structure"]},
      { badge: "Razones", text: "Give 4 reasons you like your friend (porque / ya que)." , chips:["structure"]},
      { badge: "Comparar", text: "Compare you and your friend: 6 sentences (somos…, pero…)." , chips:["structure"]},
      { badge: "Problema", text: "Describe a small disagreement and how you solved it (6–8 sentences)." , chips:["structure"]},
      { badge: "Redes", text: "Describe social media for friends: 2 pros + 2 cons." , chips:["structure"]},
      { badge: "Invitación", text: "Invite your friend to your house: plans using ‘vamos a…’ + times." , chips:["structure"]},
      { badge: "En clase", text: "Describe working with your friend in class (why it helps/hurts)." , chips:["structure"]},
      { badge: "Futuro cercano", text: "Describe what you are going to do this weekend with your friend (6 sentences)." , chips:["structure"]},
      { badge: "Extra", text: "Write a paragraph using 8 connectors (and underline them)." , chips:["structure"]},
      { badge: "Extra", text: "Describe two friends and compare them (10 lines)." , chips:["structure"]},
      { badge: "Extra", text: "Write 8 sentences with correct adjective agreement (gender/number)." , chips:["accent"]},
      { badge: "Extra", text: "Describe your friend’s house and room (8–10 lines)." , chips:["structure"]},
    ],
    8: [
      { badge: "Mi ciudad", text: "Describe your town: location, facilities, transport, opinions (10 lines)." , chips:["estar","structure"]},
      { badge: "Pros/cons", text: "2 advantages + 2 disadvantages of your area + reasons." , chips:["structure"]},
      { badge: "Recomendar", text: "Recommend 3 places to visit and explain why." , chips:["structure"]},
      { badge: "Comer", text: "Describe food options in your area (cafés/restaurants) + favourite place." , chips:["accent"]},
      { badge: "Actividades", text: "Describe activities for teenagers in your area + what’s missing." , chips:["structure"]},
      { badge: "Seguridad", text: "Describe safety/cleanliness and what should improve." , chips:["structure"]},
      { badge: "Transporte", text: "Explain how you get to school and compare with another option." , chips:["structure"]},
      { badge: "Tiempo", text: "Describe the weather in your area across seasons (4 points)." , chips:["estar"]},
      { badge: "Extra", text: "Write a balanced paragraph with: por un lado… por otro lado…" , chips:["structure"]},
      { badge: "Extra", text: "Describe your ideal town and compare it to yours." , chips:["structure"]},
      { badge: "Extra", text: "Use 5 strong opinions (me encanta / odio / prefiero / me da igual / me interesa)." , chips:["structure"]},
      { badge: "Extra", text: "Write 10 lines describing your area using varied vocabulary." , chips:["structure"]},
    ],
    9: [
      { badge: "Planes", text: "Describe your plans for next week using ‘voy a…’ (8 sentences)." , chips:["structure"]},
      { badge: "Preferencias", text: "Describe what you prefer (music/sport/food) + give reasons." , chips:["structure"]},
      { badge: "Opciones", text: "Choose between two plans and justify (pros/cons) in 8 lines." , chips:["structure"]},
      { badge: "En el cole", text: "Describe what you are going to do to improve in school (5 actions)." , chips:["structure"]},
      { badge: "Metas", text: "Describe 3 goals and how you will achieve them." , chips:["structure"]},
      { badge: "Tecnología", text: "Describe technology in your life and what you should reduce/increase." , chips:["structure"]},
      { badge: "Salud", text: "Describe your ideal healthy routine (food, sport, sleep) in 10 lines." , chips:["structure"]},
      { badge: "Dinero", text: "Describe how you spend money and what you should save for." , chips:["structure"]},
      { badge: "Extra", text: "Write a 10–12 line paragraph using at least 10 connectors." , chips:["structure"]},
      { badge: "Extra", text: "Write 6 sentences with correct use of ser vs estar." , chips:["ser","estar"]},
      { badge: "Extra", text: "Write 8 lines describing your ideal house and where it is." , chips:["structure"]},
      { badge: "Extra", text: "Write 10 lines describing your best friend + your plans together." , chips:["structure"]},
    ],
    10: [
      { badge: "Master", text: "Full task: Describe you + best friend + school + house (12–14 lines)." , chips:["structure"]},
      { badge: "Master", text: "Describe your school day with times + opinions + reasons (12 lines)." , chips:["structure","accent"]},
      { badge: "Master", text: "Describe your house and room with positions + opinions (12 lines)." , chips:["structure"]},
      { badge: "Master", text: "Describe your area with pros/cons + recommendations (12 lines)." , chips:["structure"]},
      { badge: "Master", text: "Write a balanced paragraph using: aunque, sin embargo, por eso, además (10–12 lines)." , chips:["structure"]},
      { badge: "Master", text: "Describe two people and compare them clearly (12 lines)." , chips:["structure"]},
      { badge: "Master", text: "Describe a problem (school/home) and propose solutions (10–12 lines)." , chips:["structure"]},
      { badge: "Master", text: "Describe your ideal weekend plan and justify every choice (10–12 lines)." , chips:["structure"]},
      { badge: "Master", text: "Write a paragraph with 12 different adjectives (agreement must be correct)." , chips:["accent"]},
      { badge: "Master", text: "Write 10–12 lines: ‘Mi vida’ using varied verbs (tengo, hago, voy, estudio…)." , chips:["structure"]},
      { badge: "Master", text: "Write 12 lines and include: hay, está, son, tengo, me gusta, prefiero, porque, pero." , chips:["ser","estar","structure"]},
      { badge: "Master", text: "Write 10–12 lines with at least 6 time phrases (por la mañana…, a las…)." , chips:["structure","accent"]},
    ],
  };

  function poolForLevel(level) {
    return POOLS[level] || POOLS[1];
  }

  // ----------------- Seeded RNG -----------------
  function mulberry32(a) {
    return function () {
      let t = (a += 0x6D2B79F5);
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function shuffleInPlace(arr, rng) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  }

  // ----------------- Formatting -----------------
  const $ = (id) => document.getElementById(id);
  const pad2 = (n) => String(n).padStart(2, "0");
  function fmtTime(ms) {
    const t = Math.max(0, ms);
    const totalSec = t / 1000;
    const m = Math.floor(totalSec / 60);
    const s = Math.floor(totalSec % 60);
    const d = Math.floor((totalSec - Math.floor(totalSec)) * 10);
    return `${pad2(m)}:${pad2(s)}.${d}`;
  }

  // ----------------- Match Code (7 chars) -----------------
  // Format: [L][M][S][S][X][X][C]
  // L: level 1..10 base36
  // M: mode char
  // SS: seed 0..1295 base36 (00..ZZ)
  // XX: extra mixing (2 chars) derived from level+mode (keeps code short but varied)
  // C: checksum base36
  function base36(n) { return n.toString(36).toUpperCase(); }
  function fromBase36(ch) { return parseInt(ch, 36); }

  function modeToChar(mode) {
    return ({ classic: "C", sprint: "S", survival: "V", relay: "R" }[mode] || "C");
  }
  function charToMode(ch) {
    return ({ C: "classic", S: "sprint", V: "survival", R: "relay" }[ch] || "classic");
  }

  function checksum36(nums) {
    let sum = 0;
    for (const n of nums) sum = (sum + (n | 0)) % 36;
    return base36(sum);
  }

  function makeMatchCode({ level, mode, seed }) {
    const l = Math.max(1, Math.min(10, level));
    const m = modeToChar(mode);
    const s = Math.max(0, Math.min(1295, seed));

    const lch = base36(l);
    const sch = base36(s).padStart(2, "0");

    const mix = (l * 19 + m.charCodeAt(0) * 7 + s * 3) % (36 * 36);
    const mix2 = base36(mix).padStart(2, "0");

    const c = checksum36([l, m.charCodeAt(0) % 36, s % 36, Math.floor(s / 36), mix]);

    return `${lch}${m}${sch}${mix2}${c}`;
  }

  function parseMatchCode(raw) {
    const code = (raw || "").toUpperCase().replace(/\s+/g, "");
    if (code.length !== 7) return null;

    const l = fromBase36(code[0]);
    const m = code[1];
    const s = fromBase36(code.slice(2, 4));
    const mix2 = fromBase36(code.slice(4, 6));
    const c = code[6];

    if (!Number.isFinite(l) || l < 1 || l > 10) return null;
    if (!["C", "S", "V", "R"].includes(m)) return null;
    if (!Number.isFinite(s) || s < 0 || s > 1295) return null;
    if (!Number.isFinite(mix2)) return null;

    const expected = checksum36([l, m.charCodeAt(0) % 36, s % 36, Math.floor(s / 36), mix2]);
    if (expected !== c) return null;

    return { level: l, mode: charToMode(m), seed: s, code };
  }

  // ----------------- Result Code (6 chars) -----------------
  // Format: [L][W][HHHH]
  function makeResultCode({ level, wrong, mode, seed, scoreRounded }) {
    const L = base36(Math.max(1, Math.min(10, level)));
    const W = base36(Math.max(0, Math.min(35, wrong)));

    let mix =
      (level * 131) ^
      (modeToChar(mode).charCodeAt(0) * 23) ^
      (seed * 1009) ^
      (scoreRounded * 3) ^
      (wrong * 11);

    mix = Math.abs(mix) % (36 ** 4);
    const HHHH = base36(mix).padStart(4, "0");
    return `${L}${W}${HHHH}`;
  }

  // ----------------- Build round -----------------
  function buildRound({ level, seed }) {
    const pool = poolForLevel(level);
    const rng = mulberry32(seed + level * 9991);

    const idx = Array.from({ length: pool.length }, (_, i) => i);
    shuffleInPlace(idx, rng);

    const chosen = idx.slice(0, PROMPTS_PER_ROUND).map((k) => pool[k]);

    // Give each prompt a number
    return chosen.map((p, i) => ({
      n: i + 1,
      badge: p.badge,
      text: p.text,
      chips: p.chips || [],
    }));
  }

  // ----------------- Local storage (PB + rounds) -----------------
  const ROUNDS_KEY = "tdesc_rounds_total";
  function setupKey(s) { return `tdesc_pb_L${s.level}_${s.mode}`; }

  function loadPB(s) {
    try {
      const raw = localStorage.getItem(setupKey(s));
      if (!raw) return null;
      const obj = JSON.parse(raw);
      if (!obj || typeof obj.bestScore !== "number") return null;
      return obj;
    } catch { return null; }
  }

  function savePBIfBetter(s, scoreSec, wrong, timeMs) {
    const key = setupKey(s);
    const current = loadPB(s);
    const entry = { bestScore: scoreSec, bestWrong: wrong, bestTimeMs: timeMs, at: Date.now() };

    if (!current || scoreSec < current.bestScore - 0.0001) {
      localStorage.setItem(key, JSON.stringify(entry));
      return true;
    }
    return false;
  }

  function incRounds() {
    const n = parseInt(localStorage.getItem(ROUNDS_KEY) || "0", 10);
    const next = Number.isFinite(n) ? n + 1 : 1;
    localStorage.setItem(ROUNDS_KEY, String(next));
    return next;
  }

  function getRounds() {
    const n = parseInt(localStorage.getItem(ROUNDS_KEY) || "0", 10);
    return Number.isFinite(n) ? n : 0;
  }

  // ----------------- State -----------------
  const state = {
    level: 1,
    mode: "classic",
    seed: 0,
    matchCode: "",

    prompts: [],
    answers: Array(PROMPTS_PER_ROUND).fill(""),
    wrong: Array(PROMPTS_PER_ROUND).fill(false),

    idx: 0,
    relayTurn: "A",

    startedAt: 0,
    elapsedMs: 0,
    timerHandle: null,
  };

  // ----------------- Elements -----------------
  const el = {
    pillLevel: $("pillLevel"),
    pillMode: $("pillMode"),
    pillPenalty: $("pillPenalty"),

    home: $("screenHome"),
    game: $("screenGame"),
    results: $("screenResults"),

    levelSelect: $("levelSelect"),
    modeSelect: $("modeSelect"),

    levelHint: $("levelHint"),
    modeHintHome: $("modeHintHome"),

    matchInput: $("matchInput"),
    joinBtn: $("joinBtn"),
    newMatchBtn: $("newMatchBtn"),
    soloBtn: $("soloBtn"),
    matchPreview: $("matchPreview"),
    copyMatchBtn: $("copyMatchBtn"),

    pbOut: $("pbOut"),
    roundsOut: $("roundsOut"),

    gameTitle: $("gameTitle"),
    tagMatch: $("tagMatch"),
    tagCap: $("tagCap"),
    tagTips: $("tagTips"),
    timer: $("timer"),
    quitBtn: $("quitBtn"),

    promptArea: $("promptArea"),
    prevBtn: $("prevBtn"),
    nextBtn: $("nextBtn"),
    submitBtn: $("submitBtn"),
    modeHint: $("modeHint"),

    timeOut: $("timeOut"),
    wrongOut: $("wrongOut"),
    scoreOut: $("scoreOut"),
    codeOut: $("codeOut"),

    markGrid: $("markGrid"),
    allCorrectBtn: $("allCorrectBtn"),
    blanksWrongBtn: $("blanksWrongBtn"),
    expandBtn: $("expandBtn"),
    answersWrap: $("answersWrap"),

    copyBtn: $("copyBtn"),
    playAgainBtn: $("playAgainBtn"),
    homeBtn: $("homeBtn"),
    pbBanner: $("pbBanner"),
  };

  // ----------------- UI helpers -----------------
  function labelMode(m) {
    return ({ classic: "Classic", sprint: "Sprint", survival: "Survival", relay: "Relay" }[m] || "Classic");
  }

  function showScreen(which) {
    el.home.classList.toggle("hidden", which !== "home");
    el.game.classList.toggle("hidden", which !== "game");
    el.results.classList.toggle("hidden", which !== "results");
  }

  function syncPills() {
    const pen = penaltyForLevel(state.level);
    el.pillLevel.textContent = `Level: ${state.level}`;
    el.pillMode.textContent = `Mode: ${labelMode(state.mode)}`;
    el.pillPenalty.textContent = `Penalty: +${pen}s`;
  }

  function syncHints() {
    const info = LEVEL_INFO[state.level - 1] || LEVEL_INFO[0];
    el.levelHint.textContent = `${info.title} — ${info.hint}`;
    el.modeHintHome.textContent =
      state.mode === "sprint"
        ? `Sprint cap: ${sprintCapForLevel(state.level)}s (auto-submits).`
        : state.mode === "survival"
          ? "Survival: aim for 0 wrong (blanks count)."
          : state.mode === "relay"
            ? "Relay: Player A does 1–5, Player B does 6–10."
            : "Classic: one prompt at a time.";
  }

  function syncHomeStats() {
    const pb = loadPB(state);
    el.pbOut.textContent = pb ? `${pb.bestScore.toFixed(1)}s (wrong ${pb.bestWrong})` : "—";
    el.roundsOut.textContent = String(getRounds());
  }

  // ----------------- Timer -----------------
  function stopTimer() {
    if (state.timerHandle) {
      clearInterval(state.timerHandle);
      state.timerHandle = null;
    }
  }

  function startTimer() {
    stopTimer();
    state.startedAt = performance.now();
    state.elapsedMs = 0;
    el.timer.textContent = "00:00.0";

    const capMs = sprintCapForLevel(state.level) * 1000;

    state.timerHandle = setInterval(() => {
      state.elapsedMs = performance.now() - state.startedAt;

      if (state.mode === "sprint" && state.elapsedMs >= capMs) {
        state.elapsedMs = capMs;
        el.timer.textContent = fmtTime(state.elapsedMs);
        submit();
        return;
      }
      el.timer.textContent = fmtTime(state.elapsedMs);
    }, 80);
  }

  // ----------------- Round start -----------------
  function resetRun() {
    state.prompts = [];
    state.answers = Array(PROMPTS_PER_ROUND).fill("");
    state.wrong = Array(PROMPTS_PER_ROUND).fill(false);
    state.idx = 0;
    state.relayTurn = "A";
  }

  function startRound(seed, matchCode) {
    resetRun();
    state.seed = seed;
    state.matchCode = matchCode || "";
    state.prompts = buildRound({ level: state.level, seed: state.seed });

    syncPills();
    renderGame();
    showScreen("game");
    startTimer();
  }

  function startSolo() {
    const seed = Math.floor(Math.random() * 1296);
    el.matchPreview.textContent = "Match: (solo)";
    startRound(seed, "");
  }

  function generateMatch() {
    const seed = Math.floor(Math.random() * 1296);
    const code = makeMatchCode({ level: state.level, mode: state.mode, seed });
    state.matchCode = code;
    el.matchPreview.textContent = `Match: ${code}`;
    alert(`Match Code: ${code}\n\nShare it. Everyone joining gets the same 10 prompts.`);
    startRound(seed, code);
  }

  function joinMatch() {
    const parsed = parseMatchCode(el.matchInput.value);
    if (!parsed) {
      alert("Invalid Match Code (must be 7 characters).");
      return;
    }

    state.level = parsed.level;
    state.mode = parsed.mode;

    el.levelSelect.value = String(state.level);
    el.modeSelect.value = state.mode;

    syncPills();
    syncHints();
    syncHomeStats();

    el.matchPreview.textContent = `Match: ${parsed.code}`;
    state.matchCode = parsed.code;
    startRound(parsed.seed, parsed.code);
  }

  async function copyMatch() {
    const code = (state.matchCode || "").trim();
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      alert("Match copied!");
    } catch {
      alert("Copy failed on this browser/device.");
    }
  }

  // ----------------- Render game -----------------
  function renderGame() {
    const info = LEVEL_INFO[state.level - 1] || LEVEL_INFO[0];
    el.gameTitle.textContent = `Level ${state.level} · ${info.title} · ${labelMode(state.mode)}`;

    el.tagMatch.textContent = state.matchCode ? `Match: ${state.matchCode}` : "Match: (solo)";
    el.tagCap.textContent = state.mode === "sprint" ? `Sprint cap: ${sprintCapForLevel(state.level)}s` : "Sprint cap: —";
    el.tagTips.textContent = `Tips: ${info.hint}`;

    el.modeHint.textContent =
      state.mode === "sprint"
        ? `Sprint: auto-submits at ${sprintCapForLevel(state.level)} seconds.`
        : state.mode === "survival"
          ? "Survival: aim for 0 wrong (blanks count)."
          : state.mode === "relay"
            ? `Relay: Player ${state.relayTurn} (${state.relayTurn === "A" ? "Prompts 1–5" : "Prompts 6–10"})`
            : "";

    el.promptArea.innerHTML = "";

    if (state.mode === "sprint") {
      el.prevBtn.classList.add("hidden");
      el.nextBtn.classList.add("hidden");
      el.submitBtn.classList.remove("hidden");
      state.prompts.forEach((p, i) => el.promptArea.appendChild(promptCard(p, i)));
      return;
    }

    el.prevBtn.classList.remove("hidden");
    el.nextBtn.classList.remove("hidden");

    const isLast = state.idx === PROMPTS_PER_ROUND - 1;
    el.submitBtn.classList.toggle("hidden", !isLast);
    el.nextBtn.classList.toggle("hidden", isLast);
    el.prevBtn.disabled = state.idx === 0;

    el.promptArea.appendChild(promptCard(state.prompts[state.idx], state.idx));
  }

  function chipEl(kind) {
    const d = document.createElement("div");
    d.className = `chip ${kind}`;
    d.textContent =
      kind === "ser" ? "ser" :
      kind === "estar" ? "estar" :
      kind === "accent" ? "accents" :
      kind === "structure" ? "connectors" :
      kind;
    return d;
  }

  function promptCard(p, i) {
    const wrap = document.createElement("div");
    wrap.className = "prompt";

    const top = document.createElement("div");
    top.className = "promptTop";

    const title = document.createElement("div");
    title.className = "promptTitle";
    title.textContent = `Prompt ${p.n}`;

    const badge = document.createElement("div");
    badge.className = "promptBadge";
    badge.textContent = p.badge;

    top.appendChild(title);
    top.appendChild(badge);

    const text = document.createElement("div");
    text.className = "promptText";
    text.textContent = p.text;

    const chips = document.createElement("div");
    chips.className = "chips";
    (p.chips || []).forEach(k => chips.appendChild(chipEl(k)));

    const ta = document.createElement("textarea");
    ta.placeholder = "Write your answer in Spanish…";
    ta.value = state.answers[i] || "";
    ta.addEventListener("input", () => { state.answers[i] = ta.value; });

    wrap.appendChild(top);
    wrap.appendChild(text);
    if ((p.chips || []).length) wrap.appendChild(chips);
    wrap.appendChild(ta);

    return wrap;
  }

  function goPrev() {
    state.idx = Math.max(0, state.idx - 1);
    renderGame();
  }

  function goNext() {
    if (state.mode === "relay" && state.relayTurn === "A" && state.idx === 4) {
      state.relayTurn = "B";
      state.idx = 5;
      renderGame();
      return;
    }
    state.idx = Math.min(PROMPTS_PER_ROUND - 1, state.idx + 1);
    renderGame();
  }

  // ----------------- Scoring -----------------
  function computeWrongCount() {
    let wrong = 0;
    for (let i = 0; i < PROMPTS_PER_ROUND; i++) {
      const blank = !String(state.answers[i] || "").trim();
      if (blank) state.wrong[i] = true;
      if (state.wrong[i]) wrong++;
    }
    return wrong;
  }

  function computeScore() {
    const pen = penaltyForLevel(state.level);
    const wrong = computeWrongCount();
    const timeSec = state.elapsedMs / 1000;
    const score = timeSec + wrong * pen;
    return { pen, wrong, timeSec, score };
  }

  // ----------------- Results -----------------
  function submit() {
    stopTimer();
    showScreen("results");
    el.pbBanner.classList.add("hidden");
    renderResults(true);
  }

  function renderResults(firstRender) {
    const { wrong, score } = computeScore();

    el.timeOut.textContent = fmtTime(state.elapsedMs);
    el.wrongOut.textContent = String(wrong);
    el.scoreOut.textContent = `${score.toFixed(1)}s`;

    const code = makeResultCode({
      level: state.level,
      wrong,
      mode: state.mode,
      seed: state.seed,
      scoreRounded: Math.round(score),
    });
    el.codeOut.textContent = code;

    renderMarkGrid();
    if (firstRender) renderAnswers(false);

    if (firstRender) {
      const becamePB = savePBIfBetter(state, score, wrong, state.elapsedMs);
      incRounds();
      syncHomeStats();
      if (becamePB) el.pbBanner.classList.remove("hidden");
    }
  }

  function renderMarkGrid() {
    el.markGrid.innerHTML = "";

    for (let i = 0; i < PROMPTS_PER_ROUND; i++) {
      const blank = !String(state.answers[i] || "").trim();
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "markBtn";
      btn.textContent = String(i + 1);

      if (blank) btn.classList.add("blank");
      btn.classList.add(state.wrong[i] ? "bad" : "good");

      btn.addEventListener("click", () => {
        state.wrong[i] = !state.wrong[i];
        renderResults(false);
      });

      el.markGrid.appendChild(btn);
    }
  }

  function renderAnswers(show) {
    el.answersWrap.innerHTML = "";

    for (let i = 0; i < PROMPTS_PER_ROUND; i++) {
      const item = document.createElement("div");
      item.className = "answerItem";

      const head = document.createElement("div");
      head.className = "answerHead";

      const left = document.createElement("div");
      left.innerHTML = `<b>Prompt ${i + 1}</b> <span class="tag" style="margin-left:8px;">${state.prompts[i].badge}</span>`;

      const right = document.createElement("button");
      right.type = "button";
      right.className = `btn tiny ${state.wrong[i] ? "primary" : "ghost"}`;
      right.textContent = state.wrong[i] ? "Wrong" : "Right";
      right.addEventListener("click", () => {
        state.wrong[i] = !state.wrong[i];
        renderResults(false);
        if (!el.answersWrap.classList.contains("hidden")) renderAnswers(true);
      });

      head.appendChild(left);
      head.appendChild(right);

      const prompt = document.createElement("div");
      prompt.className = "answerBody";
      prompt.innerHTML = `<em>${state.prompts[i].text}</em>`;

      const ans = document.createElement("div");
      ans.className = "answerBody";
      const txt = String(state.answers[i] || "").trim();
      ans.textContent = txt ? txt : "(blank — counts as wrong)";

      item.appendChild(head);
      item.appendChild(prompt);
      item.appendChild(ans);

      el.answersWrap.appendChild(item);
    }

    el.answersWrap.classList.toggle("hidden", !show);
    el.expandBtn.textContent = show ? "Hide answers" : "Show answers";
  }

  function markAllCorrect() {
    state.wrong = Array(PROMPTS_PER_ROUND).fill(false);
    renderResults(false); // blanks will re-flag
  }

  function markBlanksWrong() {
    for (let i = 0; i < PROMPTS_PER_ROUND; i++) {
      const blank = !String(state.answers[i] || "").trim();
      if (blank) state.wrong[i] = true;
    }
    renderResults(false);
  }

  async function copyResult() {
    const { wrong, score } = computeScore();
    const info = LEVEL_INFO[state.level - 1] || LEVEL_INFO[0];

    const txt =
      `Turbo Descriptions\n` +
      `Level ${state.level} (${info.title}) | Mode: ${labelMode(state.mode)}\n` +
      `Match: ${state.matchCode || "(solo)"}\n` +
      `Time: ${fmtTime(state.elapsedMs)} | Wrong: ${wrong} | Score: ${score.toFixed(1)}s\n` +
      `Result Code: ${el.codeOut.textContent.trim()}`;

    try {
      await navigator.clipboard.writeText(txt);
      alert("Copied!");
    } catch {
      alert("Copy failed on this browser/device.");
    }
  }

  // ----------------- Init -----------------
  function fillSelects() {
    el.levelSelect.innerHTML = Array.from({ length: 10 }, (_, i) => {
      const n = i + 1;
      const title = (LEVEL_INFO[i] && LEVEL_INFO[i].title) ? ` — ${LEVEL_INFO[i].title}` : "";
      return `<option value="${n}">Level ${n}${title}</option>`;
    }).join("");
    el.levelSelect.value = String(state.level);
    el.modeSelect.value = state.mode;
  }

  function wireEvents() {
    el.levelSelect.addEventListener("change", () => {
      state.level = parseInt(el.levelSelect.value, 10);
      syncPills();
      syncHints();
      syncHomeStats();
    });

    el.modeSelect.addEventListener("change", () => {
      state.mode = el.modeSelect.value;
      syncPills();
      syncHints();
      syncHomeStats();
    });

    el.soloBtn.addEventListener("click", startSolo);
    el.newMatchBtn.addEventListener("click", generateMatch);
    el.joinBtn.addEventListener("click", joinMatch);
    el.matchInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") joinMatch();
    });
    el.copyMatchBtn.addEventListener("click", copyMatch);

    el.prevBtn.addEventListener("click", goPrev);
    el.nextBtn.addEventListener("click", goNext);
    el.submitBtn.addEventListener("click", submit);

    el.quitBtn.addEventListener("click", () => {
      stopTimer();
      showScreen("home");
    });

    el.allCorrectBtn.addEventListener("click", markAllCorrect);
    el.blanksWrongBtn.addEventListener("click", markBlanksWrong);
    el.expandBtn.addEventListener("click", () => {
      const show = el.answersWrap.classList.contains("hidden");
      renderAnswers(show);
    });

    el.copyBtn.addEventListener("click", copyResult);
    el.playAgainBtn.addEventListener("click", () => showScreen("home"));
    el.homeBtn.addEventListener("click", () => showScreen("home"));
  }

  function boot() {
    fillSelects();
    syncPills();
    syncHints();
    syncHomeStats();
    el.matchPreview.textContent = "Match: —";
    showScreen("home");
    wireEvents();
  }

  boot();
})();
