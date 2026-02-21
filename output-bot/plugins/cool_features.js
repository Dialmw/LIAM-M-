// Cool Extra Features — sticker, tts, weather, quote, fact, joke, calculator, qr, translate
const config = require('../settings/config');
const axios  = require('axios');

module.exports = [
    {
        command: 'sticker', description: 'Convert image/video to sticker', category: 'tools',
        execute: async (sock, m, { reply, isMedia, quoted }) => {
            const q = m.quoted || m;
            if (!q?.mimetype && !q?.msg?.mimetype) return reply('❗ Reply to an image or video to make a sticker!');
            await sock.sendMessage(m.chat, { react: { text: '🎨', key: m.key } });
            try {
                const mime = (q.msg || q).mimetype || '';
                if (mime.includes('video'))
                    await sock.sendVideoAsSticker(m.chat, await sock.downloadMediaMessage(q), m, { packname: 'LIAM EYES', author: 'Liam' });
                else
                    await sock.sendImageAsSticker(m.chat, await sock.downloadMediaMessage(q), m, { packname: 'LIAM EYES', author: 'Liam' });
                await sock.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
            } catch (e) { reply('❌ Sticker failed: ' + e.message); }
        }
    },
    {
        command: 'toimg', description: 'Convert sticker to image', category: 'tools',
        execute: async (sock, m, { reply }) => {
            const q = m.quoted || m;
            if (!(q?.msg?.mimetype || '').includes('webp')) return reply('❗ Reply to a sticker!');
            try {
                const buf = await sock.downloadMediaMessage(q.msg || q);
                await sock.sendMessage(m.chat, { image: buf, caption: '🖼️ *Converted!*\n> 𝐋𝐈𝐀𝐌 𝐄𝐘𝐄𝐒' }, { quoted: m });
                await sock.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
            } catch (e) { reply('❌ ' + e.message); }
        }
    },
    {
        command: 'fact', description: 'Random interesting fact', category: 'fun',
        execute: async (sock, m, { reply }) => {
            try {
                const { data } = await axios.get('https://uselessfacts.jsph.pl/random.json?language=en', { timeout: 5000 });
                reply(`💡 *Random Fact*\n\n${data.text}\n\n> 𝐋𝐈𝐀𝐌 𝐄𝐘𝐄𝐒`);
            } catch (_) { reply('💡 Did you know? Honey never spoils — archaeologists have found 3000-year-old honey in Egyptian tombs!'); }
        }
    },
    {
        command: 'joke', description: 'Random joke', category: 'fun',
        execute: async (sock, m, { reply }) => {
            try {
                const { data } = await axios.get('https://official-joke-api.appspot.com/random_joke', { timeout: 5000 });
                reply(`😂 *Joke Time*\n\n*${data.setup}*\n\n${data.punchline}\n\n> 𝐋𝐈𝐀𝐌 𝐄𝐘𝐄𝐒`);
            } catch (_) { reply('😂 Why don\'t scientists trust atoms? Because they make up everything!'); }
        }
    },
    {
        command: 'quote', description: 'Random inspirational quote', category: 'fun',
        execute: async (sock, m, { reply }) => {
            const quotes = [
                ['The only way to do great work is to love what you do.','Steve Jobs'],
                ['Stay hungry, stay foolish.','Steve Jobs'],
                ['In the middle of every difficulty lies opportunity.','Albert Einstein'],
                ['It does not matter how slowly you go as long as you do not stop.','Confucius'],
                ['The secret of getting ahead is getting started.','Mark Twain'],
                ['Life is what happens when you\'re busy making other plans.','John Lennon'],
                ['The future belongs to those who believe in the beauty of their dreams.','Eleanor Roosevelt'],
                ['You miss 100% of the shots you don\'t take.','Wayne Gretzky'],
                ['Whether you think you can or you think you can\'t, you\'re right.','Henry Ford'],
                ['The best time to plant a tree was 20 years ago. The second best is now.','Chinese Proverb'],
            ];
            const [q, a] = quotes[~~(Math.random() * quotes.length)];
            reply(`✨ *Quote of the Moment*\n\n"${q}"\n\n— *${a}*\n\n> 𝐋𝐈𝐀𝐌 𝐄𝐘𝐄𝐒`);
        }
    },
    {
        command: 'calc', description: 'Calculator — evaluate math expression', category: 'tools',
        execute: async (sock, m, { text, prefix, reply }) => {
            if (!text) return reply(`🔢 Usage: *${prefix}calc 5 * 9 + 3*`);
            try {
                const safe = text.replace(/[^0-9+\-*/.()%^ ]/g,'');
                const result = Function(`"use strict"; return (${safe})`)();
                reply(`🔢 *Calculator*\n\n\`${text}\`\n\n= *${result}*\n\n> 𝐋𝐈𝐀𝐌 𝐄𝐘𝐄𝐒`);
            } catch (_) { reply('❌ Invalid expression!'); }
        }
    },
    {
        command: 'weather', description: 'Get weather for a city', category: 'tools',
        execute: async (sock, m, { text, prefix, reply }) => {
            if (!text) return reply(`☀️ Usage: *${prefix}weather Nairobi*`);
            try {
                const { data } = await axios.get(`https://wttr.in/${encodeURIComponent(text)}?format=j1`, { timeout: 6000 });
                const cur = data.current_condition[0];
                const loc = data.nearest_area[0];
                const city = loc.areaName[0].value + ', ' + loc.country[0].value;
                reply(
                    `☀️ *Weather — ${city}*\n` +
                    `━━━━━━━━━━━━━━━━━━━━\n` +
                    `🌡️ *Temp:* ${cur.temp_C}°C / ${cur.temp_F}°F\n` +
                    `💧 *Humidity:* ${cur.humidity}%\n` +
                    `💨 *Wind:* ${cur.windspeedKmph} km/h\n` +
                    `☁️ *Condition:* ${cur.weatherDesc[0].value}\n` +
                    `👀 *Visibility:* ${cur.visibility} km\n` +
                    `━━━━━━━━━━━━━━━━━━━━\n` +
                    `> 𝐋𝐈𝐀𝐌 𝐄𝐘𝐄𝐒`
                );
            } catch (_) { reply('❌ Could not get weather. Check city name.'); }
        }
    },
    {
        command: 'define', description: 'Define a word', category: 'tools',
        execute: async (sock, m, { text, prefix, reply }) => {
            if (!text) return reply(`📖 Usage: *${prefix}define serendipity*`);
            try {
                const { data } = await axios.get(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(text.split(' ')[0])}`, { timeout: 5000 });
                const entry = data[0];
                const meaning = entry.meanings[0];
                const def = meaning.definitions[0];
                reply(
                    `📖 *${entry.word}*\n` +
                    `_${meaning.partOfSpeech}_\n\n` +
                    `${def.definition}\n` +
                    (def.example ? `\n💬 _"${def.example}"_` : '') +
                    `\n\n> 𝐋𝐈𝐀𝐌 𝐄𝐘𝐄𝐒`
                );
            } catch (_) { reply('❌ Word not found!'); }
        }
    },
    {
        command: 'tts', description: 'Text to speech (audio)', category: 'tools',
        execute: async (sock, m, { text, prefix, reply }) => {
            if (!text) return reply(`🔊 Usage: *${prefix}tts Hello World*`);
            await sock.sendMessage(m.chat, { react: { text: '🔊', key: m.key } });
            try {
                const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=en&client=tw-ob`;
                await sock.sendMessage(m.chat, { audio: { url }, mimetype: 'audio/mpeg', ptt: true }, { quoted: m });
                await sock.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
            } catch (_) { reply('❌ TTS failed. Try a shorter text.'); }
        }
    },
    {
        command: 'time', description: 'Current time for a timezone/city', category: 'tools',
        execute: async (sock, m, { text, reply }) => {
            const tz = text || 'Africa/Nairobi';
            try {
                const now = new Date().toLocaleString('en-US', { timeZone: tz, dateStyle: 'full', timeStyle: 'long' });
                reply(`🕒 *Time — ${tz}*\n\n${now}\n\n> 𝐋𝐈𝐀𝐌 𝐄𝐘𝐄𝐒`);
            } catch (_) { reply('❌ Invalid timezone. Use format like *Africa/Nairobi* or *America/New_York*'); }
        }
    },
    {
        command: 'speed', description: 'Test bot response speed', category: 'general',
        execute: async (sock, m, { reply }) => {
            const start = Date.now();
            await sock.sendMessage(m.chat, { react: { text: '⚡', key: m.key } });
            const ping = Date.now() - start;
            const mem = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(1);
            reply(`⚡ *Speed Test*\n\n> 🏓 Response: ${ping}ms\n> 💾 RAM Used: ${mem}MB\n> 🕒 ${new Date().toLocaleString()}\n\n> 𝐋𝐈𝐀𝐌 𝐄𝐘𝐄𝐒`);
        }
    },
    {
        command: 'info', description: 'Get info about a WhatsApp user (reply/mention)', category: 'tools',
        execute: async (sock, m, { reply, quoted }) => {
            const target = m.quoted?.sender || m.mentionedJid?.[0] || m.sender;
            const num = target.split('@')[0];
            let pp = config.thumbUrl;
            try { pp = await sock.profilePictureUrl(target, 'image'); } catch (_) {}
            await sock.sendMessage(m.chat, {
                image: { url: pp },
                caption:
                    `👤 *User Info*\n` +
                    `━━━━━━━━━━━━━━━━\n` +
                    `> 📱 *Number:* +${num}\n` +
                    `> 🔗 *JID:* ${target}\n` +
                    `> 💬 *WA.me:* wa.me/${num}\n` +
                    `━━━━━━━━━━━━━━━━\n` +
                    `> 𝐋𝐈𝐀𝐌 𝐄𝐘𝐄𝐒`
            }, { quoted: m });
        }
    },
    {
        command: 'profilepic', description: 'Get profile picture of user', category: 'tools',
        execute: async (sock, m, { reply }) => {
            const target = m.quoted?.sender || m.mentionedJid?.[0] || m.sender;
            try {
                const pp = await sock.profilePictureUrl(target, 'image');
                await sock.sendMessage(m.chat, { image: { url: pp }, caption: `📸 Profile Picture\n+${target.split('@')[0]}\n> 𝐋𝐈𝐀𝐌 𝐄𝐘𝐄𝐒` }, { quoted: m });
            } catch (_) { reply('❌ No profile picture available or privacy settings block it.'); }
        }
    },
];
