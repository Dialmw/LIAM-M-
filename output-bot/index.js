// LIAM EYES Bot — index.js
console.clear();

const fs       = require('fs');
const path     = require('path');
const pino     = require('pino');
const chalk    = require('chalk');
const readline = require('readline');
const FileType = require('file-type');
const { Boom } = require('@hapi/boom');
const os       = require('os');

const cfg  = () => require('./settings/config');
const sleep = ms => new Promise(r => setTimeout(r, ms));

// ── Suppress noise ──────────────────────────────────────────────
const IGNORED = ['Socket connection timeout','EKEYTYPE','item-not-found',
    'rate-overlimit','Connection Closed','Timed Out','Value not found','Bad MAC',
    'unexpected server response','write EPIPE','read ECONNRESET'];
process.on('uncaughtException',  e => { if (!IGNORED.some(x => String(e).includes(x))) console.error(e); });
process.on('unhandledRejection', e => { if (!IGNORED.some(x => String(e).includes(x))) {} });
const _ce = console.error;
console.error = (m, ...a) => { if (typeof m === 'string' && IGNORED.some(x => m.includes(x))) return; _ce(m, ...a); };

// ── Runtime stats tracker ────────────────────────────────────────
const STATS = { cmdsProcessed: 0, messagesIn: 0, reconnects: 0, startTime: Date.now() };

// ── Timestamp helper ─────────────────────────────────────────────
const ts = () => chalk.hex('#636e72')(`[${new Date().toLocaleTimeString('en-US', { hour12: false })}]`);

// ── Banner ──────────────────────────────────────────────────────
const banner = () => {
    const W = 56;
    const line  = c => chalk.hex(c).bold;
    const cyan  = '#00d4ff';
    const purp  = '#a29bfe';
    const green = '#00b894';
    const div   = chalk.hex('#6c5ce7')('  ' + '═'.repeat(W));

    console.log('');
    console.log(line(cyan)('  ╔' + '═'.repeat(W) + '╗'));
    console.log(line(cyan)('  ║') + chalk.bgHex(cyan).black.bold('  👁️   L I A M   E Y E S   ✦   A l p h a   B o t   ') + chalk.black.bgHex(cyan)(' ') + line(cyan)('║'));
    console.log(line(cyan)('  ║') + chalk.hex(purp)('         👁️  Your Eyes in the WhatsApp World             ') + line(cyan)('║'));
    console.log(line(cyan)('  ║') + chalk.hex('#636e72')('  ' + '─'.repeat(W-2) + '  ') + line(cyan)('║'));
    console.log(line(cyan)('  ║') + chalk.hex('#74b9ff')(` ${'RUNTIME INFO'.padEnd(W)} `) + line(cyan)('║'));
    console.log(line(cyan)('  ║') + chalk.hex('#dfe6e9')(`  ⬡  Node   : ${process.version.padEnd(W - 14)} `) + line(cyan)('║'));
    console.log(line(cyan)('  ║') + chalk.hex('#dfe6e9')(`  ⬡  OS     : ${(os.platform() + ' ' + os.arch()).padEnd(W - 14)} `) + line(cyan)('║'));
    console.log(line(cyan)('  ║') + chalk.hex('#dfe6e9')(`  ⬡  RAM    : ${((os.totalmem()-os.freemem())/1024/1024).toFixed(0)}MB used / ${(os.totalmem()/1024/1024/1024).toFixed(1)}GB total`.padEnd(W - 2) + ' ') + line(cyan)('║'));
    console.log(line(cyan)('  ║') + chalk.hex('#dfe6e9')(`  ⬡  CPU    : ${os.cpus()[0].model.slice(0,35).padEnd(W - 14)} `) + line(cyan)('║'));
    console.log(line(cyan)('  ║') + chalk.hex('#636e72')('  ' + '─'.repeat(W-2) + '  ') + line(cyan)('║'));
    console.log(line(cyan)('  ╚' + '═'.repeat(W) + '╝'));
    console.log('');
    console.log(chalk.hex(green)('  ◈') + chalk.bold(' Pair Site : ') + chalk.hex('#74b9ff').underline('https://liam-pannel.onrender.com/pair'));
    console.log(chalk.hex(green)('  ◈') + chalk.bold(' Channel   : ') + chalk.hex('#74b9ff').underline('https://whatsapp.com/channel/0029VbBeZTc1t90aZjks9v2S'));
    console.log(chalk.hex(green)('  ◈') + chalk.bold(' Creator   : ') + chalk.hex('#fd79a8').bold('Liam'));
    console.log('');
    console.log(div);
    console.log('');
};

// ── Logger ───────────────────────────────────────────────────────
const L = {
    info:  m => console.log(ts() + chalk.hex('#00d4ff').bold(' ◆ INFO  ') + chalk.white(m)),
    ok:    m => console.log(ts() + chalk.hex('#00b894').bold(' ✔ OK    ') + chalk.greenBright(m)),
    warn:  m => console.log(ts() + chalk.hex('#fdcb6e').bold(' ⚠ WARN  ') + chalk.yellow(m)),
    err:   m => console.log(ts() + chalk.hex('#d63031').bold(' ✖ ERR   ') + chalk.red(m)),
    sys:   m => console.log(ts() + chalk.hex('#a29bfe').bold(' ◇ SYS   ') + chalk.hex('#dfe6e9')(m)),
    conn:  m => console.log(ts() + chalk.hex('#74b9ff').bold(' ⟳ CONN  ') + chalk.cyan(m)),
    msg:   (cmd, user, num) => {
        STATS.cmdsProcessed++;
        console.log(
            ts() +
            chalk.hex('#6c5ce7').bold(' ▶ CMD   ') +
            chalk.hex('#fdcb6e').bold(cmd.padEnd(16)) +
            chalk.hex('#00b894')('👤 ') + chalk.white(user.padEnd(14)) +
            chalk.hex('#636e72')('+' + num)
        );
    },
    event: m => console.log(ts() + chalk.hex('#fd79a8').bold(' ◉ EVENT ') + chalk.hex('#fab1a0')(m)),
    stat:  () => {
        const upSec = (Date.now() - STATS.startTime) / 1000;
        const upStr = `${~~(upSec/3600)}h ${~~(upSec%3600/60)}m ${~~(upSec%60)}s`;
        const mem   = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(1);
        console.log('');
        console.log(chalk.hex('#6c5ce7').bold('  ┌─ LIAM EYES STATS ──────────────────────────────'));
        console.log(chalk.hex('#a29bfe')(`  │  ⏱  Uptime       : ${upStr}`));
        console.log(chalk.hex('#a29bfe')(`  │  💬 Commands run  : ${STATS.cmdsProcessed}`));
        console.log(chalk.hex('#a29bfe')(`  │  📨 Messages seen : ${STATS.messagesIn}`));
        console.log(chalk.hex('#a29bfe')(`  │  🔄 Reconnects    : ${STATS.reconnects}`));
        console.log(chalk.hex('#a29bfe')(`  │  💾 RAM used      : ${mem}MB`));
        console.log(chalk.hex('#6c5ce7').bold('  └────────────────────────────────────────────────'));
        console.log('');
    },
    pair:  code => {
        console.log('');
        console.log(chalk.hex('#fdcb6e').bold('  ╔' + '═'.repeat(50) + '╗'));
        console.log(chalk.hex('#fdcb6e').bold('  ║') + chalk.bgHex('#fdcb6e').black.bold('   🔑  PAIRING CODE — ENTER THIS IN WHATSAPP      ') + chalk.hex('#fdcb6e').bold('║'));
        console.log(chalk.hex('#fdcb6e').bold('  ║') + '                                                  ' + chalk.hex('#fdcb6e').bold('║'));
        console.log(chalk.hex('#fdcb6e').bold('  ║') + chalk.white.bold(`       ★  ${code}  ★`.padEnd(50)) + chalk.hex('#fdcb6e').bold('║'));
        console.log(chalk.hex('#fdcb6e').bold('  ║') + '                                                  ' + chalk.hex('#fdcb6e').bold('║'));
        console.log(chalk.hex('#fdcb6e').bold('  ╚' + '═'.repeat(50) + '╝'));
        console.log('');
        console.log(chalk.hex('#55efc4').bold('  ➜  WhatsApp  →  Linked Devices  →  Link with Phone Number'));
        console.log('');
    },
    boot: async (steps) => {
        console.log(chalk.hex('#a29bfe').bold('  ◆ Booting LIAM EYES…'));
        for (const [label, delay_ms] of steps) {
            await sleep(delay_ms);
            console.log(chalk.hex('#00b894')('     ✔ ') + chalk.white(label));
        }
        console.log('');
    },
};

// Print periodic stats every 30 minutes
setInterval(L.stat, 30 * 60 * 1000);

const ask = t => new Promise(r => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question(t, a => { r(a.trim()); rl.close(); });
});

// ── Main ────────────────────────────────────────────────────────
const clientstart = async () => {
    banner();

    await L.boot([
        ['Loading configuration…',     120],
        ['Initialising plugin system…', 100],
        ['Preparing session manager…',  100],
        ['Connecting to WhatsApp…',     150],
    ]);

    const {
        default: makeWASocket,
        useMultiFileAuthState,
        fetchLatestBaileysVersion,
        DisconnectReason,
        makeCacheableSignalKeyStore,
        Browsers,
        delay,
        downloadContentFromMessage,
        jidDecode,
        jidNormalizedUser,
    } = await import('@whiskeysockets/baileys');

    const sessionDir = './sessions/main';
    if (!fs.existsSync(sessionDir)) fs.mkdirSync(sessionDir, { recursive: true });

    // ── Restore from settings.js sessionId ──────────────────────
    const sid = cfg().sessionId;
    if (sid && sid !== 'LIAM~paste_your_session_id_here') {
        const cp = path.join(sessionDir, 'creds.json');
        if (!fs.existsSync(cp)) {
            try {
                fs.writeFileSync(cp, Buffer.from(sid.replace(/^LIAM~/, ''), 'base64url'));
                L.ok('Session restored from settings.js');
            } catch (e) { L.warn('Session restore failed: ' + e.message); }
        }
    }

    const { state, saveCreds } = await useMultiFileAuthState(sessionDir);
    const { version }          = await fetchLatestBaileysVersion();

    // ── SESSION MENU — shown only if NOT already registered ─────
    let pairNum    = null;
    let sessionStr = null;

    if (!state.creds.registered) {
        console.log('');
        console.log(chalk.hex('#00d4ff').bold('  ┌─────────────────────────────────────────────────────┐'));
        console.log(chalk.hex('#00d4ff').bold('  │') + chalk.bgHex('#00d4ff').black.bold('   🔐  SESSION SETUP — Choose an option              ') + chalk.hex('#00d4ff').bold(' │'));
        console.log(chalk.hex('#00d4ff').bold('  ├─────────────────────────────────────────────────────┤'));
        console.log(chalk.hex('#00d4ff').bold('  │') + chalk.hex('#74b9ff')('  ▣  1  › Enter phone number (get pairing code)      ') + chalk.hex('#00d4ff').bold(' │'));
        console.log(chalk.hex('#00d4ff').bold('  │') + chalk.hex('#a29bfe')('  ▣  2  › Paste Session ID  (skip pairing)           ') + chalk.hex('#00d4ff').bold(' │'));
        console.log(chalk.hex('#00d4ff').bold('  └─────────────────────────────────────────────────────┘'));
        console.log('');

        const choice = await ask(chalk.hex('#fdcb6e').bold('  ▣ Enter choice (1 or 2) ➜  '));

        if (choice === '2') {
            // ── Option 2: Paste session ID directly ─────────────
            console.log('');
            console.log(chalk.hex('#a29bfe')('  Paste your LIAM~ session ID below and press Enter:'));
            const raw = await ask(chalk.hex('#a29bfe').bold('  ▣ Session ID ➜  '));
            if (!raw || !raw.startsWith('LIAM~')) {
                L.err('Invalid session ID — must start with LIAM~. Restart.');
                process.exit(1);
            }
            // Write creds.json from pasted session
            const cp = path.join(sessionDir, 'creds.json');
            try {
                fs.writeFileSync(cp, Buffer.from(raw.replace(/^LIAM~/, ''), 'base64url'));
                L.ok('Session ID saved — connecting…');
            } catch (e) {
                L.err('Failed to save session: ' + e.message);
                process.exit(1);
            }
            // Reload auth state with new creds
            const { state: newState, saveCreds: newSave } = await useMultiFileAuthState(sessionDir);
            // We restart clientstart to pick up new creds cleanly
            return clientstart();
        } else {
            // ── Option 1: Phone number (pairing code) ───────────
            console.log('');
            console.log(chalk.hex('#00d4ff').bold('  ┌─ PHONE PAIRING ──────────────────────────────────────'));
            console.log(chalk.hex('#74b9ff')(  '  │  Enter your number with country code. No + or spaces.'));
            console.log(chalk.hex('#74b9ff')(  '  │  Examples: 254743285563   2348012345678   12025550000'));
            console.log(chalk.hex('#00d4ff').bold('  └────────────────────────────────────────────────────\n'));
            const n = await ask(chalk.hex('#fdcb6e').bold('  ▣ Phone Number ➜  '));
            pairNum = n.replace(/\D/g, '');
            if (!pairNum || pairNum.length < 7) { L.err('Invalid number. Restart.'); process.exit(1); }
            L.info('Starting socket for +' + pairNum + '…');
        }
    }

    // ── Socket ──────────────────────────────────────────────────
    const sock = makeWASocket({
        version,
        auth: {
            creds: state.creds,
            keys:  makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' })),
        },
        logger:                         pino({ level: 'silent' }),
        printQRInTerminal:              false,
        browser:                        Browsers.macOS('Safari'),
        syncFullHistory:                false,
        generateHighQualityLinkPreview: false,
        connectTimeoutMs:               60000,
        keepAliveIntervalMs:            10000,
        defaultQueryTimeoutMs:          20000,
        retryRequestDelayMs:            250,
    });

    // ── Store ───────────────────────────────────────────────────
    const msgs = new Map();
    const loadMessage = async (jid, id) => msgs.get(`${jid}:${id}`) || null;

    // ── creds.update — register BEFORE requestPairingCode ───────
    let credsWritten = false;
    sock.ev.on('creds.update', async () => {
        await saveCreds();
        credsWritten = true;
    });

    // ── Request pairing code AFTER events registered ─────────
    if (pairNum && !state.creds.registered) {
        await delay(1500);
        try {
            const code = await sock.requestPairingCode(pairNum);
            L.pair(code?.match(/.{1,4}/g)?.join('-') || code);
        } catch (e) { L.err('Pairing code failed: ' + e.message); }
    }

    // ── Connection ──────────────────────────────────────────────
    sock.ev.on('connection.update', async ({ connection, lastDisconnect }) => {

        if (connection === 'connecting') {
            L.conn('Establishing secure connection to WhatsApp servers…');
        }

        if (connection === 'open') {
            const rawNum = (sock.user?.id || '').replace(/:\d+@.*/, '');
            const jid    = rawNum + '@s.whatsapp.net';
            const name   = sock.user?.name || 'User';
            const mem    = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(1);

            console.log('');
            console.log(chalk.hex('#00b894').bold('  ╔' + '═'.repeat(52) + '╗'));
            console.log(chalk.hex('#00b894').bold('  ║') + chalk.bgHex('#00b894').black.bold('   ✅   LIAM EYES IS NOW ONLINE                        ') + chalk.hex('#00b894').bold('║'));
            console.log(chalk.hex('#00b894').bold('  ║') + chalk.hex('#dfe6e9')(`     👤  ${name.padEnd(20)}  📱 +${rawNum}`.padEnd(54)) + chalk.hex('#00b894').bold('║'));
            console.log(chalk.hex('#00b894').bold('  ║') + chalk.hex('#dfe6e9')(`     💾  RAM: ${mem}MB         🔰 Mode: ${cfg().status?.public ? 'Public' : 'Private'}`.padEnd(54)) + chalk.hex('#00b894').bold('║'));
            console.log(chalk.hex('#00b894').bold('  ╚' + '═'.repeat(52) + '╝'));
            console.log('');

            try { await sock.newsletterFollow(cfg().autoJoinChannel); } catch (_) {}

            // ── Send session ID after pairing ──────────────────
            if (pairNum) {
                let waited = 0;
                while (!credsWritten && waited < 15000) { await sleep(200); waited += 200; }
                await sleep(500);

                const cp = path.join(sessionDir, 'creds.json');
                let raw = null;
                for (let i = 0; i < 20; i++) {
                    try {
                        if (fs.existsSync(cp)) {
                            const b = fs.readFileSync(cp);
                            if (b.length > 50) { raw = b; break; }
                        }
                    } catch (_) {}
                    await sleep(300);
                }

                if (raw) {
                    const sessionId = 'LIAM~' + Buffer.from(raw).toString('base64url');
                    L.ok('Sending session ID to +' + rawNum);
                    try {
                        await sock.sendMessage(jid, { text: sessionId });
                        await sleep(600);
                        await sock.sendMessage(jid, {
                            text:
                                `╔════════════════════════════════╗\n` +
                                `║  👁️ *𝐋𝐈𝐀𝐌 𝐄𝐘𝐄𝐒* — Session Ready  ║\n` +
                                `╚════════════════════════════════╝\n\n` +
                                `✅ Session ID sent above ↑ — copy it!\n` +
                                `⚠️ *Never share it with anyone*\n\n` +
                                `📌 *Steps:*\n` +
                                `1️⃣ Copy the LIAM~ text above\n` +
                                `2️⃣ Open \`settings/settings.js\`\n` +
                                `3️⃣ Paste into \`sessionId: "..."\`\n` +
                                `4️⃣ Restart — \`npm start\`\n\n` +
                                `👁️ _Your Eyes in the WhatsApp World_`,
                            contextInfo: { externalAdReply: {
                                title: '𝐋𝐈𝐀𝐌 𝐄𝐘𝐄𝐒 — Alpha',
                                body: '👁️ Your Eyes in the WhatsApp World',
                                thumbnailUrl: cfg().thumbUrl,
                                sourceUrl: cfg().autoJoinChannel,
                                mediaType: 1,
                            }}
                        });
                        L.ok('Session ID sent ✅');
                    } catch (e) { L.err('Session send failed: ' + e.message); }
                } else {
                    L.err('creds.json not found — session ID not sent');
                }
                pairNum = null;
            }

            // Online notification
            sock.sendMessage(jid, {
                text: `👁️ *𝐋𝐈𝐀𝐌 𝐄𝐘𝐄𝐒* is Online!\n\n> 👤 ${name}\n> 🌍 ${cfg().status?.public ? 'Public' : 'Private'} mode\n> 💬 _Your Eyes in the WhatsApp World_\n\n📡 ${cfg().autoJoinChannel}`,
                contextInfo: { externalAdReply: {
                    title: '𝐋𝐈𝐀𝐌 𝐄𝐘𝐄𝐒 — Alpha',
                    body: '👁️ Your Eyes in the WhatsApp World',
                    thumbnailUrl: cfg().thumbUrl,
                    sourceUrl: cfg().autoJoinChannel,
                    mediaType: 1,
                }}
            }).catch(() => {});
        }

        if (connection === 'close') {
            const code = lastDisconnect?.error?.output?.statusCode;
            STATS.reconnects++;
            L.err(`Disconnected — code ${code} (reconnect #${STATS.reconnects})`);
            if (code !== DisconnectReason.loggedOut) {
                L.warn('Reconnecting in 3s…');
                setTimeout(clientstart, 3000);
            } else {
                L.err('Logged out. Delete sessions/main/ and restart.');
                process.exit(1);
            }
        }
    });

    // ── Messages ─────────────────────────────────────────────────
    sock.ev.on('messages.upsert', async ({ messages, type }) => {
        try {
            STATS.messagesIn++;
            const mek = messages[0];
            if (!mek?.message) return;

            if (Object.keys(mek.message)[0] === 'ephemeralMessage')
                mek.message = mek.message.ephemeralMessage.message;

            if (mek.key?.remoteJid && mek.key?.id)
                msgs.set(`${mek.key.remoteJid}:${mek.key.id}`, mek);

            if (mek.key?.remoteJid === 'status@broadcast') {
                const f = cfg().features || {};
                if (f.autoviewstatus) sock.readMessages([mek.key]).catch(() => {});
                if (f.autoreactstatus) {
                    const e = ['😍','🔥','💯','😘','🤩','❤️','👀','✨','🎯'];
                    sock.sendMessage('status@broadcast',
                        { react: { text: e[~~(Math.random()*e.length)], key: mek.key } },
                        { statusJidList: [mek.key.participant] }).catch(() => {});
                }
                return;
            }

            if (!sock.public && !mek.key.fromMe && type === 'notify') return;

            const { smsg } = require('./library/serialize');
            const m = await smsg(sock, mek, { loadMessage });
            require('./message')(sock, m, { messages, type }, { loadMessage });
        } catch (e) { if (!IGNORED.some(x => String(e).includes(x))) console.error(e); }
    });

    // ── Anti-delete ───────────────────────────────────────────────
    sock.ev.on('messages.update', async updates => {
        if (!(cfg().features?.antidelete || cfg().antiDelete)) return;
        for (const u of updates) {
            if (u.update?.messageStubType !== 1) continue;
            const del = msgs.get(`${u.key.remoteJid}:${u.key.id}`);
            if (!del?.message) continue;
            const txt = del.message.conversation || del.message.extendedTextMessage?.text || '[Media]';
            const tgt = cfg().antiDeleteTarget === 'owner' ? cfg().owner + '@s.whatsapp.net' : u.key.remoteJid;
            sock.sendMessage(tgt, { text: `🗑️ *[LIAM EYES Anti-Delete]*\n\n${txt}` }).catch(() => {});
        }
    });

    // ── Welcome ───────────────────────────────────────────────────
    sock.ev.on('group-participants.update', async ({ id, participants, action }) => {
        if (!cfg().features?.welcome) return;
        try {
            const meta = await sock.groupMetadata(id);
            for (const jid of participants) {
                const n = jid.split('@')[0];
                if (action === 'add')
                    sock.sendMessage(id, {
                        text: `👋 Welcome @${n} to *${meta.subject}*!\n\n👥 Members: ${meta.participants.length}\n\n_👁️ LIAM EYES_`,
                        mentions: [jid],
                    }).catch(() => {});
                else if (action === 'remove')
                    sock.sendMessage(id, { text: `👋 Goodbye @${n}!\n_👁️ LIAM EYES_`, mentions: [jid] }).catch(() => {});
            }
        } catch (_) {}
    });

    // ── Always online ─────────────────────────────────────────────
    setInterval(() => {
        if (cfg().features?.alwaysonline) sock.sendPresenceUpdate('available').catch(() => {});
    }, 15000);

    // ── Helpers ───────────────────────────────────────────────────
    sock.public = cfg().status?.public ?? true;

    sock.downloadMediaMessage = async msg => {
        const mime   = (msg.msg || msg).mimetype || '';
        const type   = msg.mtype ? msg.mtype.replace(/Message/gi,'') : mime.split('/')[0];
        const stream = await downloadContentFromMessage(msg, type);
        let buf = Buffer.from([]);
        for await (const c of stream) buf = Buffer.concat([buf, c]);
        return buf;
    };

    const { getBuffer } = require('./library/function');
    const { videoToWebp, writeExifImg, writeExifVid, addExif } = require('./library/exif');

    sock.sendImageAsSticker = async (jid, p, quoted, opts = {}) => {
        const buff = Buffer.isBuffer(p) ? p : /^https?:\/\//.test(p) ? await getBuffer(p) : fs.readFileSync(p);
        const out  = (opts?.packname || opts?.author) ? await writeExifImg(buff, opts) : await addExif(buff);
        return sock.sendMessage(jid, { sticker: { url: out }, ...opts }, { quoted });
    };

    sock.sendVideoAsSticker = async (jid, p, quoted, opts = {}) => {
        const buff = Buffer.isBuffer(p) ? p : /^https?:\/\//.test(p) ? await getBuffer(p) : fs.readFileSync(p);
        const out  = (opts?.packname || opts?.author) ? await writeExifVid(buff, opts) : await videoToWebp(buff);
        return sock.sendMessage(jid, { sticker: { url: out }, ...opts }, { quoted });
    };

    sock.sendText = (jid, text, q, opts) => sock.sendMessage(jid, { text, ...opts }, { quoted: q });

    sock.downloadAndSaveMediaMessage = async (message, filename, ext = true) => {
        const q      = message.msg || message;
        const mime   = (message.msg || message).mimetype || '';
        const mtype  = message.mtype ? message.mtype.replace(/Message/gi,'') : mime.split('/')[0];
        const stream = await downloadContentFromMessage(q, mtype);
        let buf = Buffer.from([]);
        for await (const c of stream) buf = Buffer.concat([buf, c]);
        const ft    = await FileType.fromBuffer(buf);
        const fname = ext && ft ? `${filename}.${ft.ext}` : filename;
        fs.writeFileSync(fname, buf);
        return fname;
    };

    sock.decodeJid = jid => {
        if (!jid) return jid;
        if (/:\d+@/gi.test(jid)) { const d = jidDecode(jid)||{}; return d.user&&d.server ? `${d.user}@${d.server}` : jid; }
        return jid;
    };

    return sock;
};

clientstart();

let _f = require.resolve(__filename);
require('fs').watchFile(_f, () => { delete require.cache[_f]; });
