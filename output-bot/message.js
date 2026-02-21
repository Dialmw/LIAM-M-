const config = require('./settings/config');
const fs     = require('fs');
const path   = require('path');
const os     = require('os');
const chalk  = require('chalk');
const axios  = require('axios');
const { dechtml, fetchWithTimeout } = require('./library/function');
const { tempfiles } = require('./library/uploader');
const { fquoted }   = require('./library/quoted');
const Api = require('./library/Api');

const image = fs.readFileSync('./thumbnail/image.jpg');

let _jidNorm, _getContent;
const loadUtils = async () => {
    if (_jidNorm) return;
    const b = await import('@whiskeysockets/baileys');
    _jidNorm   = b.jidNormalizedUser;
    _getContent = b.getContentType;
};

// ── Plugin Loader ──────────────────────────────────────────────
class PluginLoader {
    constructor() {
        this.plugins    = new Map();
        this.categories = new Map();
        this.dir        = path.join(__dirname, 'plugins');
        // Category display labels
        this.catLabel = {
            general:   '⚡ GENERAL',
            tools:     '🛠️ TOOLS',
            ai:        '🤖 AI',
            fun:       '🎮 FUN',
            group:     '👥 GROUP',
            owner:     '👑 OWNER',
            utility:   '🔧 UTILITY',
            media:     '🎬 MEDIA',
            other:     '📦 OTHER',
        };
        this.catOrder = ['general','tools','ai','fun','utility','media','group','owner','other'];
        this.load();
    }

    load() {
        this.plugins.clear();
        this.categories.clear();
        this.catOrder.forEach(c => this.categories.set(c, []));

        if (!fs.existsSync(this.dir)) return;
        const files = fs.readdirSync(this.dir).filter(f => f.endsWith('.js') && !f.startsWith('_'));

        for (const file of files) {
            try {
                const fp = path.join(this.dir, file);
                delete require.cache[require.resolve(fp)];
                const raw  = require(fp);
                const list = Array.isArray(raw) ? raw : [raw];
                for (const p of list) {
                    if (!p?.command || typeof p.execute !== 'function') continue;
                    const cat = p.category || 'general';
                    if (!this.categories.has(cat)) this.categories.set(cat, []);
                    this.plugins.set(p.command, p);
                    this.categories.get(cat).push(p.command);
                }
            } catch (e) { console.log(chalk.red(`  [PLUG] ${file}: ${e.message}`)); }
        }
        console.log('');
        console.log(chalk.hex('#00d4ff').bold('  ┌─ PLUGIN SYSTEM ────────────────────────────────'));
        for (const [cat, cmds] of this.categories) {
            if (cmds.length) console.log(chalk.hex('#a29bfe')(`  │  ${(this.catLabel[cat] || cat).padEnd(20)} ${cmds.length} command${cmds.length>1?'s':''}`));
        }
        console.log(chalk.hex('#00b894').bold(`  └─ Total: ${this.plugins.size} commands loaded ✔`));
        console.log('');
    }

    async run(cmd, sock, m, ctx) {
        const p = this.plugins.get(cmd);
        if (!p) return false;
        try {
            if (p.owner && !ctx.isCreator)           { await ctx.reply(config.message.owner); return true; }
            if (p.group && !m.isGroup)               { await ctx.reply(config.message.group);  return true; }
            if (p.admin && m.isGroup && !ctx.isAdmins && !ctx.isCreator) { await ctx.reply(config.message.admin); return true; }
            await p.execute(sock, m, ctx);
        } catch (e) { console.log(chalk.red(`  [CMD] ${cmd}: ${e.message}`)); }
        return true;
    }

    // ── Menu style 1: Classic boxed ──────────────────────────────
    _buildStyle1(prefix) {
        const lines = [];
        for (const cat of this.catOrder) {
            const cmds = this.categories.get(cat);
            if (!cmds || !cmds.length) continue;
            const label = this.catLabel[cat] || cat.toUpperCase();
            lines.push(`\n╭──『 *${label}* 』`);
            for (const cmd of [...cmds].sort()) lines.push(`│  ✦ ${prefix}${cmd}`);
            lines.push('╰' + '─'.repeat(28));
        }
        return lines.join('\n');
    }

    // ── Menu style 2: Compact minimal ────────────────────────────
    _buildStyle2(prefix) {
        const lines = [];
        for (const cat of this.catOrder) {
            const cmds = this.categories.get(cat);
            if (!cmds || !cmds.length) continue;
            const label = this.catLabel[cat] || cat.toUpperCase();
            lines.push(`\n*${label}*`);
            lines.push([...cmds].sort().map(c => `\`${prefix}${c}\``).join('  '));
        }
        return lines.join('\n');
    }

    // ── Menu style 3: Fancy emoji grid ───────────────────────────
    _buildStyle3(prefix) {
        const dots = ['◈','◉','◊','◆','◇','▣','▦','▩'];
        const lines = [];
        for (const cat of this.catOrder) {
            const cmds = this.categories.get(cat);
            if (!cmds || !cmds.length) continue;
            const label = this.catLabel[cat] || cat.toUpperCase();
            lines.push(`\n┏━━━『 *${label}* 』━━━┓`);
            const sorted = [...cmds].sort();
            for (let i = 0; i < sorted.length; i += 2) {
                const a = `${dots[i%dots.length]} ${prefix}${sorted[i]}`;
                const b = sorted[i+1] ? `  ${dots[(i+1)%dots.length]} ${prefix}${sorted[i+1]}` : '';
                lines.push('┃  ' + a + b);
            }
            lines.push('┗' + '━'.repeat(30));
        }
        return lines.join('\n');
    }

    buildMenu(prefix, style) {
        const s = style || 1;
        if (s === 2) return this._buildStyle2(prefix);
        if (s === 3) return this._buildStyle3(prefix);
        return this._buildStyle1(prefix);
    }

    count() { return this.plugins.size; }
    reload() { this.load(); }
}

const PL = new PluginLoader();

// ── Main handler ───────────────────────────────────────────────
module.exports = async (sock, m, chatUpdate, store) => {
    try {
        await loadUtils();

        const body = (
            m.mtype === 'conversation'              ? m.message.conversation :
            m.mtype === 'imageMessage'              ? m.message.imageMessage?.caption :
            m.mtype === 'videoMessage'              ? m.message.videoMessage?.caption :
            m.mtype === 'extendedTextMessage'       ? m.message.extendedTextMessage?.text :
            m.mtype === 'buttonsResponseMessage'    ? m.message.buttonsResponseMessage?.selectedButtonId :
            m.mtype === 'listResponseMessage'       ? m.message.listResponseMessage?.singleSelectReply?.selectedRowId :
            ''
        ) || '';

        const botId  = (sock.user?.id || '').split(':')[0] + '@s.whatsapp.net';
        const sender = m.key.fromMe ? botId : (m.key.participant || m.key.remoteJid);
        const senderNum = sender.split('@')[0];

        // Prefix — supports . ! # $
        const prefixMatch = body.match(/^[.!#$]/);
        const prefix  = prefixMatch ? prefixMatch[0] : '.';
        const isCmd   = !!prefixMatch;
        const command = isCmd ? body.slice(1).trim().split(/\s+/)[0].toLowerCase() : '';
        const args    = body.trim().split(/\s+/).slice(1);
        const text = q = args.join(' ');

        const pushname = m.pushName || 'User';
        const quoted   = m.quoted || m;
        const mime     = (quoted.msg || quoted).mimetype || '';
        const isMedia  = /image|video|sticker|audio/.test(mime);

        const isCreator = _jidNorm(sender) === _jidNorm(botId);

        // Group
        let groupMetadata = {}, groupName = '', participants = [], groupAdmins = [],
            isBotAdmins = false, isAdmins = false, groupOwner = '', isGroupOwner = false;
        if (m.isGroup) {
            groupMetadata = await sock.groupMetadata(m.chat).catch(() => ({}));
            groupName     = groupMetadata.subject || '';
            participants  = (groupMetadata.participants || []).map(p => ({
                id: p.id, admin: p.admin === 'superadmin' ? 'superadmin' : p.admin === 'admin' ? 'admin' : null,
            }));
            groupAdmins  = participants.filter(p => p.admin).map(p => p.id);
            isBotAdmins  = groupAdmins.includes(botId);
            isAdmins     = groupAdmins.includes(sender);
            groupOwner   = groupMetadata.owner || '';
            isGroupOwner = groupOwner === sender;
        }

        // Console log
        if (isCmd) {
            const ts = new Date().toLocaleTimeString('en-US', { hour12: false });
            const loc = m.isGroup ? chalk.hex('#00b894')('[GRP] ') : chalk.hex('#74b9ff')('[DM]  ');
            console.log(
                chalk.hex('#636e72')(`  [${ts}] `) +
                loc +
                chalk.hex('#6c5ce7').bold(' ▶ ') +
                chalk.hex('#fdcb6e').bold((prefix + command).padEnd(18)) +
                chalk.hex('#a29bfe')('👤 ') + chalk.white((pushname || 'User').slice(0, 14).padEnd(15)) +
                chalk.hex('#636e72')('+' + senderNum)
            );
        }

        // Reply helper — fast, with ad card
        const reply = text => sock.sendMessage(m.chat, {
            text,
            contextInfo: { externalAdReply: {
                title: '𝐋𝐈𝐀𝐌 𝐄𝐘𝐄𝐒',
                body: '👁️ Your Eyes in the WhatsApp World',
                thumbnailUrl: config.thumbUrl,
                sourceUrl: 'https://whatsapp.com/channel/0029VbBeZTc1t90aZjks9v2S',
                renderLargerThumbnail: false,
            }}
        }, { quoted: m });

        const ctx = {
            args, text, q, quoted, mime, isMedia,
            groupMetadata, groupName, participants, groupOwner,
            groupAdmins, isBotAdmins, isAdmins, isGroupOwner,
            isCreator, prefix, reply, config, sender, pushname, senderNum,
            m,
        };

        // ── Auto features ──────────────────────────────────────
        const feat = config.features || {};

        if (feat.autoread && !m.key.fromMe)
            sock.readMessages([m.key]).catch(() => {});

        if (feat.autotyping && !m.key.fromMe)
            sock.sendPresenceUpdate('composing', m.chat).catch(() => {});

        if (feat.autorecording && !m.key.fromMe)
            sock.sendPresenceUpdate('recording', m.chat).catch(() => {});

        if (feat.autoreact && !m.key.fromMe) {
            const r = ['❤️','😂','🔥','👍','😍','🤩','💯','⚡','🎯','✨'];
            sock.sendMessage(m.chat, { react: { text: r[~~(Math.random() * r.length)], key: m.key } }).catch(() => {});
        }

        if (feat.antilink && m.isGroup && !isAdmins && !isCreator) {
            if (/(https?:\/\/|wa\.me\/|whatsapp\.com\/)/i.test(body)) {
                sock.sendMessage(m.chat, { delete: m.key }).catch(() => {});
                reply(`⚠️ @${senderNum} Links not allowed!`);
                return;
            }
        }

        if (feat.antibadword && m.isGroup && !isAdmins && !isCreator) {
            if ((config.badwords || []).some(w => body.toLowerCase().includes(w.toLowerCase()))) {
                sock.sendMessage(m.chat, { delete: m.key }).catch(() => {});
                reply(`⚠️ @${senderNum} Watch your language!`);
                return;
            }
        }

        // Chatbot (non-command)
        if (feat.chatbot && !m.key.fromMe && !isCmd && body.trim()) {
            try {
                const res = await axios.get(
                    `https://api.simsimi.vn/v1/simsimi?text=${encodeURIComponent(body)}&lc=en`,
                    { timeout: 4000 }
                );
                if (res.data?.success) { await reply(res.data.success); return; }
            } catch (_) {}
            await reply('🤖 Hi there! Type *.menu* to see what I can do.');
            return;
        }

        if (!isCmd) return;

        // ── Plugin dispatch ────────────────────────────────────
        if (await PL.run(command, sock, m, ctx)) return;

        // ── Built-in commands ──────────────────────────────────
        switch (command) {

            case 'menu':
            case 'help': {
                const mem   = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(1);
                const up    = process.uptime();
                const upStr = `${~~(up/86400)}d ${~~(up%86400/3600)}h ${~~(up%3600/60)}m`;
                const ping  = Math.max(0, Date.now() - (m.messageTimestamp || 0) * 1000);
                const total = PL.count();
                const style = config.menuStyle || 1;

                // Style labels
                const styleLabel = style===2 ? '⚡ Compact' : style===3 ? '💎 Fancy' : '🗂️ Classic';

                const header =
`╔════════════════════════════════════╗
║   👁️  *𝐋𝐈𝐀𝐌 𝐄𝐘𝐄𝐒*  ✦  Alpha Bot   ║
╚════════════════════════════════════╝
_👁️ Your Eyes in the WhatsApp World_

  ⚡ *Ping*   › ${ping}ms
  ⏱️ *Uptime* › ${upStr}
  💾 *RAM*    › ${mem}MB
  📦 *Cmds*   › ${total}
  🌍 *Mode*   › ${sock.public ? 'Public' : 'Private'}
  🎨 *Style*  › ${styleLabel}
  🔰 *Prefix* › ${prefix}`;

                const menuBody = header + '\n' + PL.buildMenu(prefix, style) +
                    '\n\n_💡 Change layout: .menustyle 1 / 2 / 3_\n> _𝐋𝐈𝐀𝐌 𝐄𝐘𝐄𝐒 Alpha — by Liam_';

                // Use logo if it exists, otherwise fallback to image
                const logoPath = require('path').join(__dirname, 'thumbnail', 'logo.jpg');
                const imgBuf   = require('fs').existsSync(logoPath)
                    ? require('fs').readFileSync(logoPath)
                    : image;

                await sock.sendMessage(m.chat, {
                    image: imgBuf,
                    caption: menuBody,
                    contextInfo: { externalAdReply: {
                        title: '𝐋𝐈𝐀𝐌 𝐄𝐘𝐄𝐒 — Menu',
                        body: '👁️ Your Eyes in the WhatsApp World',
                        thumbnailUrl: config.thumbUrl,
                        sourceUrl: config.pairingSite || 'https://liam-pannel.onrender.com/pair',
                        mediaType: 1,
                    }}
                }, { quoted: m });
                break;
            }

            case 'reload': {
                if (!isCreator) { reply(config.message.owner); return; }
                PL.reload();
                reply(`✅ *Reloaded* — ${PL.count()} commands active\n\n> 𝐋𝐈𝐀𝐌 𝐄𝐘𝐄𝐒 👁️`);
                break;
            }
        }

    } catch (e) { console.log(chalk.red('[MSG] ' + (e.message || e))); }
};

let _f = require.resolve(__filename);
require('fs').watchFile(_f, () => {
    require('fs').unwatchFile(_f);
    delete require.cache[_f];
    require(_f);
});
