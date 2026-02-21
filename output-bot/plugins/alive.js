const config = require('../settings/config');
const os = require('os');
function runtime(s) { s=Number(s); const d=Math.floor(s/86400),h=Math.floor((s%86400)/3600),m=Math.floor((s%3600)/60),sc=Math.floor(s%60); return `${d}d ${h}h ${m}m ${sc}s`; }
module.exports = {
    command: 'alive', description: 'Check bot status', category: 'general',
    execute: async (sock, m, { reply }) => {
        await sock.sendMessage(m.chat, { react: { text: '⚡', key: m.key } });
        const ping = Date.now() - m.messageTimestamp * 1000;
        const msg =
`👁️ *𝐋𝐈𝐀𝐌 𝐄𝐘𝐄𝐒 — System Status*
━━━━━━━━━━━━━━━━━━━━━
👤 *User:* ${m.pushName || 'User'}
⏱️ *Uptime:* ${runtime(process.uptime())}
💾 *RAM:* ${(process.memoryUsage().heapUsed/1024/1024).toFixed(1)}MB / ${(os.totalmem()/1024/1024/1024).toFixed(1)}GB
📶 *Ping:* ${ping}ms
🖥️ *Platform:* ${os.platform()} ${os.arch()}
🔖 *Version:* Alpha
👑 *Creator:* Liam
━━━━━━━━━━━━━━━━━━━━━
📡 https://whatsapp.com/channel/0029VbBeZTc1t90aZjks9v2S`;
        await sock.sendMessage(m.chat, { image: { url: config.thumbUrl }, caption: msg,
            contextInfo: { externalAdReply: { title: '𝐋𝐈𝐀𝐌 𝐄𝐘𝐄𝐒', body: 'Alpha by Liam', thumbnailUrl: config.thumbUrl, sourceUrl: 'https://whatsapp.com/channel/0029VbBeZTc1t90aZjks9v2S', mediaType: 1 }}
        }, { quoted: m });
        await sock.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
    }
};
