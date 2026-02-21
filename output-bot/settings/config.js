// ╔══════════════════════════════════════════════════════════════╗
// ║   config.js — loads from settings.js                        ║
// ║   Edit settings.js to configure your bot                    ║
// ╚══════════════════════════════════════════════════════════════╝
const S = require('./settings');
const config = {
    owner:         S.adminNumber,
    sudo:          S.sudo || [],
    botNumber:     "-",
    thumbUrl:      S.thumbUrl,
    session:       "sessions",
    sessionId:     S.sessionId,
    tagline:       S.tagline,
    autoJoinChannel: S.channel,
    status: { public: S.mode === 'public', terminal: true, reactsw: true },
    features:      S.features,
    antiDelete:    S.antiDelete,
    antiDeleteTarget: S.antiDeleteTarget,
    mode:          S.mode,
    badwords:      S.badwords,
    floodLimit:    S.floodLimit,
    floodWindow:   S.floodWindow,
    sessionLimits: { admin: S.adminSessionLimit, default: S.defaultSessionLimit, admin_number: S.adminNumber },
    message: {
        owner:   "⚠️ This command is for the bot owner only!",
        sudo:    "⚠️ This command requires elevated permissions!",
        group:   "⚠️ This command can only be used in groups!",
        admin:   "⚠️ This command is for group admins only!",
        private: "⚠️ This command is for private chats only!",
    },
    mess: { owner: "👑 Owner-only!", done: "✅ Done!", error: "❌ Error!", wait: "⏳ Please wait..." },
    settings: {
        title:       S.botName,
        version:     S.version,
        packname:    "LIAM EYES",
        description: S.tagline,
        author:      "Liam",
        footer:      `𝗟𝗜𝗔𝗠 𝗘𝗬𝗘𝗦 | ${S.version}`,
    },
    sticker: { packname: "LIAM EYES", author: "Liam" },
    api:         S.api,
    pairingSite: S.pairingSite,
    github:      S.github,
    menuStyle:   S.menuStyle  || 1,
    autoBio:     S.autoBio    || false,
    autoBioText: S.autoBioText || '👁️ LIAM EYES | {time}',
};
module.exports = config;
let file = require.resolve(__filename);
require('fs').watchFile(file, () => { require('fs').unwatchFile(file); delete require.cache[file]; require(file); });
