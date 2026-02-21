// ─────────────────────────────────────────────────────────────────────────────
//  LIAM EYES — Media & Identity Tools
//  .pair  .share  .tostatus  .toprofile  .tomenuimg
//  .autobio  .menustyle
// ─────────────────────────────────────────────────────────────────────────────
const config  = require('../settings/config');
const fs      = require('fs');
const path    = require('path');
const axios   = require('axios');
const pino    = require('pino');

// ── Fancy font helper (𝗕𝗼𝗹𝗱 𝗦𝗮𝗻𝘀) ─────────────────────────────────────────
function fancy(text) {
    const map = {
        A:'𝗔',B:'𝗕',C:'𝗖',D:'𝗗',E:'𝗘',F:'𝗙',G:'𝗚',H:'𝗛',I:'𝗜',J:'𝗝',K:'𝗞',L:'𝗟',
        M:'𝗠',N:'𝗡',O:'𝗢',P:'𝗣',Q:'𝗤',R:'𝗥',S:'𝗦',T:'𝗧',U:'𝗨',V:'𝗩',W:'𝗪',X:'𝗫',
        Y:'𝗬',Z:'𝗭',
        a:'𝗮',b:'𝗯',c:'𝗰',d:'𝗱',e:'𝗲',f:'𝗳',g:'𝗴',h:'𝗵',i:'𝗶',j:'𝗷',k:'𝗸',l:'𝗹',
        m:'𝗺',n:'𝗻',o:'𝗼',p:'𝗽',q:'𝗾',r:'𝗿',s:'𝘀',t:'𝘁',u:'𝘂',v:'𝘃',w:'𝘄',x:'𝘅',
        y:'𝘆',z:'𝘇',
        '0':'𝟬','1':'𝟭','2':'𝟮','3':'𝟯','4':'𝟰','5':'𝟱','6':'𝟲','7':'𝟳','8':'𝟴','9':'𝟵',
    };
    return text.split('').map(c => map[c] || c).join('');
}

// ── Auto-bio interval handle ─────────────────────────────────────────────────
let _bioClock = null;

// ── Download helper ──────────────────────────────────────────────────────────
const dlMedia = async (sock, q) => {
    const mime = (q.msg || q).mimetype || '';
    const type = q.mtype ? q.mtype.replace(/Message/gi, '') : mime.split('/')[0];
    const { downloadContentFromMessage } = await import('@whiskeysockets/baileys');
    const stream = await downloadContentFromMessage(q.msg || q, type);
    let buf = Buffer.from([]);
    for await (const c of stream) buf = Buffer.concat([buf, c]);
    return buf;
};

module.exports = [

    // ─────────────────────────────────────────────────────────────────────────
    //  .pair <number>  —  request a WhatsApp pairing code for a number
    // ─────────────────────────────────────────────────────────────────────────
    {
        command: 'pair',
        category: 'owner',
        owner: true,
        execute: async (sock, m, { args, reply, isCreator, prefix }) => {
            if (!isCreator) return reply(config.message.owner);

            let num = args[0]?.replace(/\D/g, '');
            if (!num || num.length < 7) {
                return reply(
                    `📱 *${fancy('LIAM EYES')} — Pair a Number*\n\n` +
                    `Usage: *${prefix}pair 254712345678*\n\n` +
                    `> Enter number with country code, no + or spaces.\n` +
                    `> Examples:\n` +
                    `  • 254712345678 _(Kenya)_\n` +
                    `  • 2348012345678 _(Nigeria)_\n` +
                    `  • 12025550000 _(US)_\n\n` +
                    `> Or get a session ID at: ${config.pairingSite}\n\n` +
                    `> 𝐋𝐈𝐀𝐌 𝐄𝐘𝐄𝐒 👁️`
                );
            }

            await sock.sendMessage(m.chat, { react: { text: '📱', key: m.key } });
            await reply(`⏳ *Requesting pairing code for +${num}…*\n\n_This may take a few seconds._`);

            try {
                // Spawn a temporary unregistered socket to get the code
                const {
                    default: makeWASocket,
                    useMultiFileAuthState,
                    fetchLatestBaileysVersion,
                    makeCacheableSignalKeyStore,
                    Browsers,
                    delay,
                } = await import('@whiskeysockets/baileys');

                const tmpDir = path.join(__dirname, '..', 'sessions', `tmp_pair_${num}_${Date.now()}`);
                fs.mkdirSync(tmpDir, { recursive: true });

                const { state, saveCreds } = await useMultiFileAuthState(tmpDir);
                const { version }          = await fetchLatestBaileysVersion();

                const tmpSock = makeWASocket({
                    version,
                    auth: { creds: state.creds, keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' })) },
                    logger: pino({ level: 'silent' }),
                    printQRInTerminal: false,
                    browser: Browsers.macOS('Safari'),
                    connectTimeoutMs: 30000,
                });

                tmpSock.ev.on('creds.update', saveCreds);

                // Wait briefly then request code
                await delay(1500);
                const code = await tmpSock.requestPairingCode(num);
                const formatted = code?.match(/.{1,4}/g)?.join('-') || code;

                await sock.sendMessage(m.chat, { react: { text: '🔑', key: m.key } });
                await reply(
                    `🔑 *${fancy('Pairing Code')}*\n\n` +
                    `┌──────────────────────────────┐\n` +
                    `│  📱 *+${num}*\n` +
                    `│\n` +
                    `│  🔑  *${fancy(formatted)}*\n` +
                    `│\n` +
                    `│  ⏱️  Valid ~60 seconds\n` +
                    `└──────────────────────────────┘\n\n` +
                    `📲 *Steps:*\n` +
                    `  1. Open WhatsApp on that number\n` +
                    `  2. Tap ⋮ → *Linked Devices*\n` +
                    `  3. Tap *Link with phone number*\n` +
                    `  4. Enter the code above\n\n` +
                    `> 𝐋𝐈𝐀𝐌 𝐄𝐘𝐄𝐒 👁️`
                );

                // Listen for successful pairing then save & clean up
                let done = false;
                tmpSock.ev.on('connection.update', async ({ connection, lastDisconnect }) => {
                    if (connection === 'open' && !done) {
                        done = true;
                        const credsPath = path.join(tmpDir, 'creds.json');
                        if (fs.existsSync(credsPath)) {
                            const raw = fs.readFileSync(credsPath);
                            const sid = 'LIAM~' + raw.toString('base64url');
                            await sock.sendMessage(m.chat, {
                                text:
                                    `✅ *${fancy('Pairing Successful!')}*\n\n` +
                                    `📱 Number: +${num}\n\n` +
                                    `🔐 *Session ID:*\n\`\`\`${sid}\`\`\`\n\n` +
                                    `_Save this ID in settings.js as sessionId_\n\n` +
                                    `> 𝐋𝐈𝐀𝐌 𝐄𝐘𝐄𝐒 👁️`
                            });
                        }
                        try { tmpSock.end(); } catch (_) {}
                    }
                    if (connection === 'close') {
                        // Clean up tmp dir after 5 min
                        if (!done) setTimeout(() => fs.rmSync(tmpDir, { recursive: true, force: true }), 5*60*1000);
                    }
                });

            } catch (e) {
                await reply(`❌ *Pairing failed:* ${e.message}\n\nTry again or visit: ${config.pairingSite}`);
            }
        }
    },

    // ─────────────────────────────────────────────────────────────────────────
    //  .share  —  share bot with fancy font card
    // ─────────────────────────────────────────────────────────────────────────
    {
        command: 'share',
        category: 'owner',
        execute: async (sock, m, { reply }) => {
            await sock.sendMessage(m.chat, { react: { text: '📤', key: m.key } });

            const logoPath = path.join(__dirname, '..', 'thumbnail', 'logo.jpg');
            const logoExists = fs.existsSync(logoPath);

            const caption =
                `╔════════════════════════════╗\n` +
                `║  👁️  ${fancy('LIAM EYES')}  ║\n` +
                `║     ${fancy('Alpha Bot')}          ║\n` +
                `╚════════════════════════════╝\n\n` +
                `_"${fancy('Your Eyes in the WhatsApp World')}"_\n\n` +
                `🔗 *${fancy('Pair your bot')}*\n${config.pairingSite}\n\n` +
                `📡 *${fancy('Join our Channel')}*\n${config.autoJoinChannel}\n\n` +
                `💻 *${fancy('GitHub')}*\n${config.github || 'https://github.com/Dialmw/LIAM-EYES'}\n\n` +
                `> 𝐋𝐈𝐀𝐌 𝐄𝐘𝐄𝐒 👁️ — by ${fancy('Liam')}`;

            if (logoExists) {
                await sock.sendMessage(m.chat, {
                    image: fs.readFileSync(logoPath),
                    caption,
                    contextInfo: { externalAdReply: {
                        title: '𝐋𝐈𝐀𝐌 𝐄𝐘𝐄𝐒',
                        body: '👁️ Get your own bot!',
                        thumbnailUrl: config.thumbUrl,
                        sourceUrl: config.pairingSite,
                        mediaType: 1,
                    }}
                }, { quoted: m });
            } else {
                await reply(caption);
            }
        }
    },

    // ─────────────────────────────────────────────────────────────────────────
    //  .tostatus  —  reply to an image/video to post it as your status
    // ─────────────────────────────────────────────────────────────────────────
    {
        command: 'tostatus',
        category: 'media',
        owner: true,
        execute: async (sock, m, { reply, isCreator }) => {
            if (!isCreator) return reply(config.message.owner);
            const q = m.quoted || m;
            const mime = (q.msg || q).mimetype || '';
            if (!mime.includes('image') && !mime.includes('video'))
                return reply('❗ *Reply to an image or video* to set it as your status!');

            await sock.sendMessage(m.chat, { react: { text: '📤', key: m.key } });
            try {
                const buf = await dlMedia(sock, q);
                if (mime.includes('video')) {
                    await sock.sendMessage('status@broadcast', {
                        video: buf, caption: config.tagline, backgroundColor: '#000000'
                    });
                } else {
                    await sock.sendMessage('status@broadcast', {
                        image: buf, caption: config.tagline, backgroundColor: '#000000'
                    });
                }
                await sock.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
                reply(`✅ *${fancy('Posted to Status!')}*\n\n> 𝐋𝐈𝐀𝐌 𝐄𝐘𝐄𝐒 👁️`);
            } catch (e) { reply(`❌ Failed: ${e.message}`); }
        }
    },

    // ─────────────────────────────────────────────────────────────────────────
    //  .toprofile  —  reply to an image to set it as bot's profile picture
    // ─────────────────────────────────────────────────────────────────────────
    {
        command: 'toprofile',
        category: 'media',
        owner: true,
        execute: async (sock, m, { reply, isCreator }) => {
            if (!isCreator) return reply(config.message.owner);
            const q = m.quoted || m;
            const mime = (q.msg || q).mimetype || '';
            if (!mime.includes('image'))
                return reply('❗ *Reply to an image* to set it as the bot\'s profile picture!');

            await sock.sendMessage(m.chat, { react: { text: '🖼️', key: m.key } });
            try {
                const buf = await dlMedia(sock, q);
                // Strip Baileys device suffix (:0@s.whatsapp.net → @s.whatsapp.net)
                const botJid = (sock.user?.id || '').replace(/:\d+@/, '@');
                await sock.updateProfilePicture(botJid, buf);
                await sock.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
                reply(`✅ *${fancy('Bot Profile Pic Updated!')}*\n\n> 𝐋𝐈𝐀𝐌 𝐄𝐘𝐄𝐒 👁️`);
            } catch (e) { reply(`❌ Failed: ${e.message}\n\n_Tip: Bot must have access to update its own profile._`); }
        }
    },

    // ─────────────────────────────────────────────────────────────────────────
    //  .tomenuimg  —  reply to an image to update the bot menu thumbnail
    // ─────────────────────────────────────────────────────────────────────────
    {
        command: 'tomenuimg',
        category: 'media',
        owner: true,
        execute: async (sock, m, { reply, isCreator }) => {
            if (!isCreator) return reply(config.message.owner);
            const q = m.quoted || m;
            const mime = (q.msg || q).mimetype || '';
            if (!mime.includes('image'))
                return reply('❗ *Reply to an image* to set it as the menu thumbnail!');

            await sock.sendMessage(m.chat, { react: { text: '🖼️', key: m.key } });
            try {
                const buf = await dlMedia(sock, q);
                const imgPath = path.join(__dirname, '..', 'thumbnail', 'image.jpg');
                fs.writeFileSync(imgPath, buf);
                await sock.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
                reply(`✅ *${fancy('Menu Image Updated!')}*\n\n_Type .menu to see the new look!_\n\n> 𝐋𝐈𝐀𝐌 𝐄𝐘𝐄𝐒 👁️`);
            } catch (e) { reply(`❌ Failed: ${e.message}`); }
        }
    },

    // ─────────────────────────────────────────────────────────────────────────
    //  .autobio on | off | set <text>  —  auto-update WhatsApp bio
    // ─────────────────────────────────────────────────────────────────────────
    {
        command: 'autobio',
        category: 'tools',
        owner: true,
        execute: async (sock, m, { args, text, reply, isCreator }) => {
            if (!isCreator) return reply(config.message.owner);
            const sub = (args[0] || '').toLowerCase();

            if (sub === 'set') {
                const newText = args.slice(1).join(' ');
                if (!newText) return reply(`✏️ Usage: *.autobio set Your bio text here {time}*\n\n_Use {time} for current time._`);
                config.autoBioText = newText;
                await reply(`✅ *${fancy('Auto Bio Text Set!')}*\n\n_"${newText}"_\n\n_Use {time} as a placeholder for current time._\n\n> 𝐋𝐈𝐀𝐌 𝐄𝐘𝐄𝐒 👁️`);
                return;
            }

            if (sub === 'on' || sub === 'off' || sub === '') {
                const on = sub === 'on' ? true : sub === 'off' ? false : !config.autoBio;
                config.autoBio = on;

                if (on) {
                    // Start interval
                    if (_bioClock) clearInterval(_bioClock);
                    const updateBio = async () => {
                        try {
                            const t = new Date().toLocaleTimeString('en-US', { hour12: true });
                            const bioText = (config.autoBioText || '👁️ LIAM EYES | {time}').replace('{time}', t);
                            await sock.updateProfileStatus(bioText);
                        } catch (_) {}
                    };
                    await updateBio();
                    _bioClock = setInterval(updateBio, 5 * 60 * 1000); // every 5 min
                } else {
                    if (_bioClock) { clearInterval(_bioClock); _bioClock = null; }
                }

                await sock.sendMessage(m.chat, { react: { text: on ? '✍️' : '❌', key: m.key } });
                reply(
                    `✍️ *${fancy('Auto Bio')}*\n\n` +
                    `${on
                        ? '╔══════════════╗\n║  ✅  ENABLED  ║\n╚══════════════╝\n\n_Updates every 5 minutes_'
                        : '╔═══════════════╗\n║  ❌  DISABLED  ║\n╚═══════════════╝'
                    }\n\n` +
                    `> Template: _"${config.autoBioText}"_\n` +
                    `> Change with: *.autobio set Your text {time}*\n\n` +
                    `> 𝐋𝐈𝐀𝐌 𝐄𝐘𝐄𝐒 👁️`
                );
                return;
            }

            // Help fallback
            reply(
                `✍️ *${fancy('Auto Bio')} — Help*\n\n` +
                `*.autobio on* — Enable auto bio\n` +
                `*.autobio off* — Disable auto bio\n` +
                `*.autobio set Your text {time}* — Set bio text\n\n` +
                `_Use {time} as a dynamic clock placeholder_\n\n` +
                `> 𝐋𝐈𝐀𝐌 𝐄𝐘𝐄𝐒 👁️`
            );
        }
    },

    // ─────────────────────────────────────────────────────────────────────────
    //  .menustyle 1|2|3  —  switch between 3 menu layouts
    // ─────────────────────────────────────────────────────────────────────────
    {
        command: 'menustyle',
        category: 'owner',
        owner: true,
        execute: async (sock, m, { args, reply, isCreator }) => {
            if (!isCreator) return reply(config.message.owner);
            const n = parseInt(args[0]);
            if (!n || ![1,2,3].includes(n)) {
                return reply(
                    `🎨 *${fancy('Menu Styles')}*\n\n` +
                    `*1* — 🗂️ Classic   (boxed categories)\n` +
                    `*2* — ⚡ Compact   (minimal one-liner)\n` +
                    `*3* — 💎 Fancy     (emoji grid style)\n\n` +
                    `Usage: *.menustyle 2*\n\n` +
                    `> Currently active: *Style ${config.menuStyle || 1}*\n\n` +
                    `> 𝐋𝐈𝐀𝐌 𝐄𝐘𝐄𝐒 👁️`
                );
            }
            config.menuStyle = n;
            await sock.sendMessage(m.chat, { react: { text: '🎨', key: m.key } });
            reply(
                `🎨 *${fancy('Menu Style')} → ${n}*\n\n` +
                `${n===1 ? '🗂️ Classic' : n===2 ? '⚡ Compact' : '💎 Fancy'} mode activated!\n\n` +
                `_Type .menu to see the new layout_\n\n> 𝐋𝐈𝐀𝐌 𝐄𝐘𝐄𝐒 👁️`
            );
        }
    },

];
