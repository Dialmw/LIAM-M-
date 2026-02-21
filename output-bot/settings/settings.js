// ╔══════════════════════════════════════════════════════════════╗
// ║           𝐋𝐈𝐀𝐌 𝐄𝐘𝐄𝐒  —  settings.js                       ║
// ║   Edit this file to configure your bot                       ║
// ╚══════════════════════════════════════════════════════════════╝

const settings = {

    // ── 🔑 SESSION ────────────────────────────────────────────────────────────
    // Paste your Session ID here (from https://pairing-site-le.onrender.com/)
    // Format:  LIAM~<your_base64_session>
    sessionId: "LIAM~paste_your_session_id_here",

    // ── 👑 ADMIN / OWNER ──────────────────────────────────────────────────────
    // Your number with country code (no + or spaces)
    adminNumber: "254743285563",

    // ── 🛡️ SUDO USERS ────────────────────────────────────────────────────────
    // Numbers that get near-owner privileges (owner commands still owner-only)
    // Add numbers as strings with country code, e.g. "254712345678"
    sudo: [
        // "254712345678",
        // "2348012345678",
    ],

    // ── 🔗 SESSION SLOTS ──────────────────────────────────────────────────────
    // Max simultaneous .link sessions per user
    // Admin (adminNumber above) always gets 6 slots
    defaultSessionLimit: 3,
    adminSessionLimit:   6,

    // ── 🗑️ ANTI-DELETE ────────────────────────────────────────────────────────
    // true = bot forwards deleted messages to the same chat
    antiDelete: false,
    // Where to send deleted messages: "same" (same chat) | "owner" (send to your DM)
    antiDeleteTarget: "same",

    // ── ⚡ FEATURES ───────────────────────────────────────────────────────────
    features: {
        antidelete:      false,
        antiviewonce:    false,
        autoviewstatus:  false,
        autosavestatus:  false,
        autoreactstatus: false,
        alwaysonline:    false,
        autoread:        false,
        chatbot:         false,
        antilink:        false,
        antibadword:     false,
        welcome:         true,
        autoreact:       false,
        antiflood:       false,   // block message floods
        autotyping:      false,   // show typing indicator before replying
        autorecording:   false,   // show recording before audio reply
        grouponly:       false,   // only respond in groups
        privateonly:     false,   // only respond in DMs
    },

    // ── 🌍 MODE ───────────────────────────────────────────────────────────────
    // "public" = everyone can use bot | "private" = owner/sudo only
    mode: "public",

    // ── 🤖 BOT INFO ───────────────────────────────────────────────────────────
    botName:     "𝐋𝐈𝐀𝐌 𝐄𝐘𝐄𝐒",
    version:     "Alpha",
    prefix:      ".",
    thumbUrl:    "https://i.imgur.com/ydt68aV.jpeg",
    tagline:     "👁️ Your Eyes in the WhatsApp World",
    channel:     "https://whatsapp.com/channel/0029VbBeZTc1t90aZjks9v2S",
    pairingSite: "https://liam-pannel.onrender.com/pair",
    menuStyle:   1,        // 1 = Classic  2 = Minimal  3 = Fancy
    autoBio:     false,    // auto-update WA bio every 5 min
    autoBioText: "👁️ LIAM EYES Bot — Online 24/7 | {time}",  // {time} replaced with current time
    github:      "https://github.com/Dialmw/LIAM-EYES",

    // ── 🚫 BAD WORDS ──────────────────────────────────────────────────────────
    badwords: ["badword1", "spam", "scam"],

    // ── 🌊 ANTI-FLOOD ─────────────────────────────────────────────────────────
    floodLimit:    8,    // messages per window
    floodWindow:   6000, // ms window

    // ── 🎵 API ────────────────────────────────────────────────────────────────
    api: {
        baseurl: "https://hector-api.vercel.app/",
        apikey:  "hector",
    },
};

module.exports = settings;

// Hot-reload on save
let file = require.resolve(__filename);
require('fs').watchFile(file, () => {
    require('fs').unwatchFile(file);
    delete require.cache[file];
    require(file);
});
