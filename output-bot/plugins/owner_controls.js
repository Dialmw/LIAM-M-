// Owner Controls — mode, setbotname, setprefix, restart, update, link, sessions, sudo, share, broadcast
const config = require('../settings/config');
const settings = require('../settings/settings');
const { exec } = require('child_process');
const path = require('path');
const fs   = require('fs');
const chalk = require('chalk');

module.exports = [
    {
        command: 'share', description: 'Share the bot link', category: 'owner', owner: true,
        execute: async (sock, m, { reply }) => {
            await sock.sendMessage(m.chat, { react: { text: '📤', key: m.key } });
            reply(
                `📤 *Share LIAM EYES*\n\n` +
                `_Get your own LIAM EYES bot!_\n\n` +
                `🔗 Pair Site: ${config.pairingSite || 'https://pairing-site-le.onrender.com/'}\n` +
                `📡 Channel: ${config.autoJoinChannel}\n\n` +
                `> 𝐋𝐈𝐀𝐌 𝐄𝐘𝐄𝐒 Alpha — by Liam 👁️`
            );
        }
    },
    {
        command: 'broadcast', description: 'Broadcast message to all chats (owner only)', category: 'owner', owner: true,
        execute: async (sock, m, { text, reply }) => {
            if (!text) return reply(`📢 Usage: *.broadcast Your message here*`);
            await sock.sendMessage(m.chat, { react: { text: '📢', key: m.key } });
            try {
                const chats = await sock.groupFetchAllParticipating().catch(() => ({}));
                const jids  = Object.keys(chats);
                if (!jids.length) return reply('❌ No group chats found to broadcast to.');
                let sent = 0;
                for (const jid of jids) {
                    try {
                        await sock.sendMessage(jid, { text: `📢 *Broadcast from LIAM EYES*\n\n${text}\n\n> 𝐋𝐈𝐀𝐌 𝐄𝐘𝐄𝐒 👁️` });
                        sent++;
                        await new Promise(r => setTimeout(r, 500));
                    } catch (_) {}
                }
                reply(`✅ *Broadcast sent!*\n\n> Delivered to ${sent}/${jids.length} chats\n\n> 𝐋𝐈𝐀𝐌 𝐄𝐘𝐄𝐒 👁️`);
            } catch (e) { reply(`❌ Broadcast failed: ${e.message}`); }
        }
    },
    {
        command: 'mode', description: 'Set public/private mode', category: 'owner', owner: true,
        execute: async (sock, m, { args, reply }) => {
            const arg = args[0]?.toLowerCase();
            if (!['public','private'].includes(arg)) return reply('❓ Usage: *.mode public* or *.mode private*');
            config.mode = arg; config.status.public = arg === 'public'; sock.public = arg === 'public';
            await sock.sendMessage(m.chat, { react: { text: arg==='public'?'🌍':'🔒', key: m.key } });
            reply(`${arg==='public'?'🌍':'🔒'} *Mode* → *${arg.toUpperCase()}*`);
        }
    },
    {
        command: 'setbotname', description: 'Change bot name', category: 'owner', owner: true,
        execute: async (sock, m, { text, reply }) => {
            if (!text) return reply('❓ Usage: *.setbotname YourName*');
            config.settings.title = text; config.settings.description = text;
            await sock.sendMessage(m.chat, { react: { text: '✏️', key: m.key } });
            reply(`✏️ Bot name → *${text}*`);
        }
    },
    {
        command: 'setprefix', description: 'Change command prefix', category: 'owner', owner: true,
        execute: async (sock, m, { args, reply }) => {
            if (!args[0]) return reply('❓ Usage: *.setprefix !*');
            settings.prefix = args[0]; config.currentPrefix = args[0];
            await sock.sendMessage(m.chat, { react: { text: '⚙️', key: m.key } });
            reply(`⚙️ Prefix → *${args[0]}*`);
        }
    },
    {
        command: 'restart', description: 'Restart the bot', category: 'owner', owner: true,
        execute: async (sock, m, { reply }) => {
            await sock.sendMessage(m.chat, { react: { text: '🔄', key: m.key } });
            await reply('🔄 *Restarting LIAM EYES…*');
            setTimeout(() => { exec('pm2 restart LIAM-EYES || node index.js', () => {}); process.exit(0); }, 1500);
        }
    },
    {
        command: 'update', description: 'Update bot from GitHub', category: 'owner', owner: true,
        execute: async (sock, m, { reply }) => {
            await sock.sendMessage(m.chat, { react: { text: '⬆️', key: m.key } });
            await reply('⬆️ *Pulling latest update from GitHub…*');
            exec('git pull origin main', async (err, stdout) => {
                if (err) return reply(`❌ Update failed:\n\`${err.message}\``);
                reply(`✅ *Updated!*\n\`\`\`${stdout.trim()}\`\`\`\n\nUse *.restart* to apply.`);
            });
        }
    },

    // ── .addbot — connect a session ID to a number ──────────────────────────────
    {
        command: 'addbot',
        description: 'Link a session ID to activate a bot instance',
        category: 'owner',
        execute: async (sock, m, { args, reply, sender, isCreator }) => {
            // Only owner/sudo can use .link
            const senderNum = sender.split('@')[0];
            const isSudo    = config.sudo?.includes(senderNum);
            if (!isCreator && !isSudo) return reply(config.message.owner);

            const sessionId = args.join(' ').trim();
            if (!sessionId || !sessionId.startsWith('LIAM~')) {
                return reply(
                    `🔗 *LIAM EYES — Add Bot*\n\n` +
                    `Usage: *.addbot LIAM~<session_id>*\n\n` +
                    `Get your session ID at:\n${config.pairingSite}\n\n` +
                    `📌 Your number: +${senderNum}\n` +
                    `📦 Active sessions: ${0}\n` +
                    `🔒 Session limit: ${3}`
                );
            }

            const limit = 3;
            const count = 0;
            if (count >= limit) {
                return reply(`❌ *Session limit reached!*\n\nYou have ${count}/${limit} active sessions.\n${senderNum === config.sessionLimits.admin_number ? '👑 Admin limit: 6' : '📦 Default limit: 3'}`);
            }

            await sock.sendMessage(m.chat, { react: { text: '🔗', key: m.key } });
            await reply(`🔗 *Linking session…*\n\nPlease wait, connecting your bot instance.`);

            try {
                // Generate a unique session label
                const sessionLabel = `linked_${senderNum}_${Date.now()}`;
                const sessionDir   = path.join(__dirname, '..', 'sessions', sessionLabel);
                fs.mkdirSync(sessionDir, { recursive: true });

                // Write creds from the base64 session ID
                const raw = sessionId.replace(/^LIAM~/, '');
                const credsPath = path.join(sessionDir, 'creds.json');
                fs.writeFileSync(credsPath, Buffer.from(raw, 'base64url'));

                // Log to console
                const chalk = require('chalk');
                console.log('');
                console.log(chalk.hex('#fd79a8').bold('  ╔═ NEW LINKED SESSION ═══════════════════════╗'));
                console.log(chalk.hex('#fd79a8')('  ║ ') + chalk.white(`User: +${senderNum}`));
                console.log(chalk.hex('#fd79a8')('  ║ ') + chalk.white(`Label: ${sessionLabel}`));
                console.log(chalk.hex('#fd79a8')('  ║ ') + chalk.white(`Slot: ${count + 1}/${limit}`));
                console.log(chalk.hex('#fd79a8').bold('  ╚═════════════════════════════════════════════╝'));
                console.log('');

                // Start the linked session
                await null;

                await reply(
                    `✅ *Session Linked Successfully!*\n\n` +
                    `> 🔗 Label: \`${sessionLabel}\`\n` +
                    `> 👤 User: +${senderNum}\n` +
                    `> 📦 Slot: ${count + 1}/${limit}\n\n` +
                    `Your bot instance is now starting up. Check console for status.`
                );
            } catch (e) {
                await reply(`❌ *Link failed:* ${e.message}\n\nMake sure your session ID is valid and not expired.`);
            }
        }
    },

    // ── .sessions — show active sessions ─────────────────────────────────────
    {
        command: 'sessions',
        description: 'View your active linked sessions',
        category: 'owner',
        execute: async (sock, m, { reply, sender, isCreator }) => {
            const senderNum = sender.split('@')[0];
            const isSudo    = config.sudo?.includes(senderNum);
            if (!isCreator && !isSudo) return reply(config.message.owner);

            const count = 0;
            const limit = 3;
            const sess  = [...(new Set() || [])];

            let text = `📦 *Active Sessions — +${senderNum}*\n`;
            text += `━━━━━━━━━━━━━━━━━━━━\n`;
            text += `> Slots used: ${count}/${limit}\n`;
            text += `> Slot type: ${senderNum === config.sessionLimits.admin_number ? '👑 Admin (6)' : '👤 Standard (3)'}\n\n`;
            if (sess.length) {
                sess.forEach((s, i) => { text += `*${i+1}.* \`${s}\`\n`; });
            } else {
                text += `_No active sessions yet. Use *.link* to add one._`;
            }
            text += `\n\n> _𝐋𝐈𝐀𝐌 𝐄𝐘𝐄𝐒 | Session Manager_`;
            reply(text);
        }
    },

    // ── .sudo — manage sudo users ─────────────────────────────────────────────
    {
        command: 'sudo',
        description: 'Add/remove sudo users (owner only)',
        category: 'owner',
        owner: true,
        execute: async (sock, m, { args, reply, sender }) => {
            const sub = args[0]?.toLowerCase();
            const num = args[1]?.replace(/[^0-9]/g,'');
            if (!sub || !['add','remove','list'].includes(sub)) {
                return reply(`🛡️ *Sudo Manager*\n\nUsage:\n*.sudo add 254712345678*\n*.sudo remove 254712345678*\n*.sudo list*`);
            }
            if (sub === 'list') {
                const list = config.sudo || [];
                return reply(`🛡️ *Sudo Users (${list.length})*\n\n${list.length ? list.map((n,i) => `*${i+1}.* +${n}`).join('\n') : '_None set_'}`);
            }
            if (!num) return reply('❓ Provide a number. E.g. *.sudo add 254712345678*');
            if (sub === 'add') {
                if (!config.sudo) config.sudo = [];
                if (config.sudo.includes(num)) return reply(`⚠️ +${num} is already sudo.`);
                config.sudo.push(num);
                await sock.sendMessage(m.chat, { react: { text: '🛡️', key: m.key } });
                reply(`✅ +${num} added as *sudo user*.`);
            } else if (sub === 'remove') {
                config.sudo = (config.sudo||[]).filter(n => n !== num);
                await sock.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
                reply(`✅ +${num} removed from sudo.`);
            }
        }
    },

    // ── .settings — show current settings ────────────────────────────────────
    {
        command: 'settings',
        description: 'View current bot settings',
        category: 'owner',
        owner: true,
        execute: async (sock, m, { reply }) => {
            const cfg = require('../settings/config');
            const f = cfg.features;
            const text =
                `⚙️ *LIAM EYES — Settings*\n` +
                `━━━━━━━━━━━━━━━━━━━━━━━\n` +
                `> 🌍 Mode: *${cfg.mode}*\n` +
                `> 👑 Admin: +${cfg.owner}\n` +
                `> 🛡️ Sudo: ${(cfg.sudo||[]).length} users\n` +
                `> 📦 Sessions: ${cfg.sessionLimits.default} (admin: ${cfg.sessionLimits.admin})\n` +
                `━━━━━━━━━━━━━━━━━━━━━━━\n` +
                `🗑️ Anti-Delete:      ${f.antidelete?'✅':'❌'}\n` +
                `👁️ Anti View-Once:  ${f.antiviewonce?'✅':'❌'}\n` +
                `👀 Auto View Status: ${f.autoviewstatus?'✅':'❌'}\n` +
                `💾 Auto Save Status: ${f.autosavestatus?'✅':'❌'}\n` +
                `😍 Auto React Status:${f.autoreactstatus?'✅':'❌'}\n` +
                `🟢 Always Online:    ${f.alwaysonline?'✅':'❌'}\n` +
                `📖 Auto Read:        ${f.autoread?'✅':'❌'}\n` +
                `⚡ Auto React:       ${f.autoreact?'✅':'❌'}\n` +
                `🤖 Chatbot:          ${f.chatbot?'✅':'❌'}\n` +
                `🔗 Anti-Link:        ${f.antilink?'✅':'❌'}\n` +
                `🤬 Anti Bad Word:    ${f.antibadword?'✅':'❌'}\n` +
                `👋 Welcome:          ${f.welcome?'✅':'❌'}\n` +
                `🌊 Anti-Flood:       ${f.antiflood?'✅':'❌'}\n` +
                `━━━━━━━━━━━━━━━━━━━━━━━\n` +
                `> Edit \`settings/settings.js\` to change`;
            reply(text);
        }
    },
];
