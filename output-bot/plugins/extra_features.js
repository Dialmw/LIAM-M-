// Extra Cool Features — 8ball, ship, roast, tictactoe, poll, broadcast, lyrics, gpt-style, hug, slap
const config = require('../settings/config');
const axios  = require('axios');

module.exports = [
    {
        command: '8ball', description: 'Ask the magic 8ball anything', category: 'fun',
        execute: async (sock, m, { text, prefix, reply }) => {
            if (!text) return reply(`🎱 Usage: *${prefix}8ball Will I be rich?*`);
            const answers = [
                '✅ It is certain!', '✅ Without a doubt!', '✅ Yes, definitely!',
                '✅ You may rely on it.', '✅ Most likely.', '🤔 Ask again later.',
                '🤔 Cannot predict now.', '🤔 Concentrate and ask again.',
                '❌ Don\'t count on it.', '❌ My reply is no.', '❌ Very doubtful.',
                '❌ Outlook not so good.', '✨ Signs point to yes!', '🌟 Absolutely!',
                '😂 Lol no.', '👁️ The eyes say YES!', '👁️ The eyes see... NO.',
            ];
            const ans = answers[~~(Math.random() * answers.length)];
            reply(`🎱 *Magic 8-Ball*\n\n❓ _${text}_\n\n${ans}\n\n> 𝐋𝐈𝐀𝐌 𝐄𝐘𝐄𝐒 👁️`);
        }
    },
    {
        command: 'ship', description: 'Ship two people together ❤️', category: 'fun',
        execute: async (sock, m, { text, prefix, reply }) => {
            if (!text || !text.includes('and')) return reply(`💘 Usage: *${prefix}ship Liam and Zara*`);
            const [a, b] = text.split(/\s+and\s+/i);
            const pct = ~~(Math.random() * 101);
            const bar = '█'.repeat(~~(pct/10)) + '░'.repeat(10 - ~~(pct/10));
            const emoji = pct >= 80 ? '💞' : pct >= 50 ? '💛' : pct >= 30 ? '🤝' : '💔';
            reply(`💘 *Love Ship*\n\n${emoji} *${a?.trim()}* × *${b?.trim()}*\n\n[${bar}] *${pct}%*\n\n${pct >= 80 ? 'Perfect match! 🔥' : pct >= 50 ? 'Pretty good! 💛' : pct >= 30 ? 'Could work... 🤔' : 'Not looking great 😬'}\n\n> 𝐋𝐈𝐀𝐌 𝐄𝐘𝐄𝐒 👁️`);
        }
    },
    {
        command: 'roast', description: 'Roast someone (fun, not mean)', category: 'fun',
        execute: async (sock, m, { text, prefix, reply, sender }) => {
            const target = m.mentionedJid?.[0] || null;
            const name   = text?.replace(/@\d+/g,'').trim() || 'you';
            const roasts = [
                `${name} is so slow, they'd lose a race to a dial-up modem. 🐌`,
                `${name} tried to take a selfie but the phone said "no filter can fix this." 📵`,
                `${name}'s WiFi password is their IQ — and it's single digits. 📡`,
                `I'd roast ${name} more but my mum said I shouldn't burn trash. 🗑️`,
                `${name} is the human equivalent of a 1% battery warning. 🔋`,
                `${name} said they'd be here at 5. It's 8. Classic ${name}. ⏰`,
                `${name} has the energy of a wet paper towel. 🙂`,
                `${name}'s plan B is just plan A written in a different font. 📝`,
            ];
            const roast = roasts[~~(Math.random() * roasts.length)];
            await sock.sendMessage(m.chat, { react: { text: '🔥', key: m.key } });
            reply(`🔥 *Roast Session*\n\n${roast}\n\n> 𝐋𝐈𝐀𝐌 𝐄𝐘𝐄𝐒 👁️ — just jokes!`);
        }
    },
    {
        command: 'compliment', description: 'Give someone a compliment', category: 'fun',
        execute: async (sock, m, { text, prefix, reply }) => {
            const name = text?.replace(/@\d+/g,'').trim() || 'you';
            const compliments = [
                `${name} lights up every room they walk into. ✨`,
                `${name} has the kind of energy that makes people feel welcome. 💛`,
                `${name} is genuinely one of a kind — keep being amazing! 🌟`,
                `The world is a better place with ${name} in it. 🌍`,
                `${name} has a heart of gold and the mind to match. 💎`,
                `${name} is that rare person who actually makes a difference. 🔥`,
                `${name} could make even a Monday feel like a Friday. 😄`,
            ];
            const pick = compliments[~~(Math.random() * compliments.length)];
            await sock.sendMessage(m.chat, { react: { text: '💛', key: m.key } });
            reply(`💛 *Compliment*\n\n${pick}\n\n> 𝐋𝐈𝐀𝐌 𝐄𝐘𝐄𝐒 👁️`);
        }
    },
    {
        command: 'dare', description: 'Random dare challenge', category: 'fun',
        execute: async (sock, m, { reply }) => {
            const dares = [
                'Send a voice note singing the chorus of any song 🎤',
                'Change your WhatsApp status to "I lost a dare" for 1 hour 😂',
                'Send a selfie with the silliest face you can make 🤪',
                'Tag 3 people and tell them something nice 💛',
                'Write a 3-sentence story using only emojis 📖',
                'Send a GIF that describes your personality perfectly 🎭',
                'Guess the first name of everyone in this chat 🔍',
                'Do 10 pushups and send proof 💪',
            ];
            await sock.sendMessage(m.chat, { react: { text: '😈', key: m.key } });
            reply(`😈 *DARE*\n\n${dares[~~(Math.random() * dares.length)]}\n\n> 𝐋𝐈𝐀𝐌 𝐄𝐘𝐄𝐒 👁️`);
        }
    },
    {
        command: 'truth', description: 'Random truth question', category: 'fun',
        execute: async (sock, m, { reply }) => {
            const truths = [
                'What\'s the most embarrassing thing you\'ve Googled? 🔍',
                'Have you ever lied to get out of plans? Be honest! 😅',
                'What\'s your biggest fear you haven\'t told anyone? 😨',
                'What\'s the last lie you told? 🤥',
                'Who in this chat would you call at 3AM? 📞',
                'What\'s something you pretend to like but actually don\'t? 🙂',
                'What\'s the weirdest thing you do when you\'re alone? 🤷',
                'Have you ever blamed someone else for something you did? 😬',
            ];
            await sock.sendMessage(m.chat, { react: { text: '🎯', key: m.key } });
            reply(`🎯 *TRUTH*\n\n${truths[~~(Math.random() * truths.length)]}\n\n> 𝐋𝐈𝐀𝐌 𝐄𝐘𝐄𝐓 👁️`);
        }
    },
    {
        command: 'coinflip', description: 'Flip a coin', category: 'fun',
        execute: async (sock, m, { reply }) => {
            const result = Math.random() > 0.5 ? '🪙 HEADS' : '🪙 TAILS';
            await sock.sendMessage(m.chat, { react: { text: '🪙', key: m.key } });
            reply(`🪙 *Coin Flip*\n\n*${result}!*\n\n> 𝐋𝐈𝐀𝐌 𝐄𝐘𝐄𝐒 👁️`);
        }
    },
    {
        command: 'dice', description: 'Roll a dice', category: 'fun',
        execute: async (sock, m, { args, reply }) => {
            const sides = parseInt(args[0]) || 6;
            if (sides < 2 || sides > 100) return reply('❓ Roll a dice with 2–100 sides. E.g. *.dice 20*');
            const roll = ~~(Math.random() * sides) + 1;
            await sock.sendMessage(m.chat, { react: { text: '🎲', key: m.key } });
            reply(`🎲 *Dice Roll (d${sides})*\n\nYou rolled: *${roll}*\n\n> 𝐋𝐈𝐀𝐌 𝐄𝐘𝐄𝐒 👁️`);
        }
    },
    {
        command: 'rps', description: 'Rock Paper Scissors vs bot', category: 'fun',
        execute: async (sock, m, { text, prefix, reply }) => {
            const choices = ['rock', 'paper', 'scissors'];
            const emojis  = { rock: '🪨', paper: '📄', scissors: '✂️' };
            const pick = (text || '').toLowerCase().trim();
            if (!choices.includes(pick)) return reply(`✂️ Usage: *${prefix}rps rock* | *paper* | *scissors*`);
            const bot = choices[~~(Math.random() * 3)];
            let result;
            if (pick === bot) result = "🤝 It's a tie!";
            else if ((pick==='rock'&&bot==='scissors')||(pick==='paper'&&bot==='rock')||(pick==='scissors'&&bot==='paper')) result = '🏆 You win!';
            else result = '🤖 Bot wins!';
            await sock.sendMessage(m.chat, { react: { text: result.includes('You') ? '🏆' : result.includes('tie') ? '🤝' : '🤖', key: m.key } });
            reply(`✂️ *Rock Paper Scissors*\n\n👤 You: ${emojis[pick]} *${pick}*\n🤖 Bot: ${emojis[bot]} *${bot}*\n\n*${result}*\n\n> 𝐋𝐈𝐀𝐌 𝐄𝐘𝐄𝐒 👁️`);
        }
    },
    {
        command: 'lyrics', description: 'Search song lyrics', category: 'tools',
        execute: async (sock, m, { text, prefix, reply }) => {
            if (!text) return reply(`🎵 Usage: *${prefix}lyrics Shape of You*`);
            try {
                await sock.sendMessage(m.chat, { react: { text: '🎵', key: m.key } });
                const { data } = await axios.get(`https://some-random-api.com/lyrics?title=${encodeURIComponent(text)}`, { timeout: 7000 });
                if (!data?.lyrics) return reply('❌ Lyrics not found. Try a different search.');
                const lyrics = data.lyrics.length > 1800 ? data.lyrics.slice(0, 1800) + '\n... _(truncated)_' : data.lyrics;
                reply(`🎵 *${data.title}* — _${data.author}_\n\n${lyrics}\n\n> 𝐋𝐈𝐀𝐌 𝐄𝐘𝐄𝐒 👁️`);
            } catch (_) { reply('❌ Couldn\'t find lyrics. Try: *.lyrics Song Name Artist*'); }
        }
    },
    {
        command: 'number', description: 'Random number between range', category: 'fun',
        execute: async (sock, m, { args, prefix, reply }) => {
            const min = parseInt(args[0]) || 1;
            const max = parseInt(args[1]) || 100;
            if (min >= max) return reply(`❓ Usage: *${prefix}number 1 100*`);
            const rand = ~~(Math.random() * (max - min + 1)) + min;
            reply(`🔢 *Random Number*\n\nRange: ${min}–${max}\nResult: *${rand}*\n\n> 𝐋𝐈𝐀𝐌 𝐄𝐘𝐄𝐒 👁️`);
        }
    },
    {
        command: 'choose', description: 'Let bot choose between options', category: 'fun',
        execute: async (sock, m, { text, prefix, reply }) => {
            if (!text || !text.includes(',')) return reply(`🎯 Usage: *${prefix}choose pizza, sushi, burgers*`);
            const opts = text.split(',').map(o => o.trim()).filter(Boolean);
            const pick = opts[~~(Math.random() * opts.length)];
            await sock.sendMessage(m.chat, { react: { text: '🎯', key: m.key } });
            reply(`🎯 *Bot Chooses*\n\nOptions: ${opts.map(o=>`_${o}_`).join(', ')}\n\n👉 *${pick}*\n\n> 𝐋𝐈𝐀𝐌 𝐄𝐘𝐄𝐒 👁️`);
        }
    },
    {
        command: 'rate', description: 'Bot rates something or someone /100', category: 'fun',
        execute: async (sock, m, { text, prefix, reply }) => {
            if (!text) return reply(`⭐ Usage: *${prefix}rate your cooking*`);
            const score = ~~(Math.random() * 101);
            const stars = '⭐'.repeat(Math.ceil(score/20));
            const comment = score >= 90 ? 'Legendary! 🔥' : score >= 70 ? 'Pretty solid! 💛' : score >= 50 ? 'Could be better 😅' : score >= 30 ? 'Needs work... 🤔' : 'Absolutely not 💀';
            reply(`⭐ *LIAM EYES Rating*\n\n"${text}" — *${score}/100*\n${stars}\n\n${comment}\n\n> 𝐋𝐈𝐀𝐌 𝐄𝐘𝐄𝐒 👁️`);
        }
    },
    {
        command: 'aesthetic', description: 'Convert text to aesthetic style', category: 'fun',
        execute: async (sock, m, { text, prefix, reply }) => {
            if (!text) return reply(`✨ Usage: *${prefix}aesthetic liam eyes*`);
            const map = 'abcdefghijklmnopqrstuvwxyz';
            const aes = 'ａｂｃｄｅｆｇｈｉｊｋｌｍｎｏｐｑｒｓｔｕｖｗｘｙｚ';
            const out = text.toLowerCase().split('').map(c => {
                const i = map.indexOf(c);
                return i >= 0 ? aes[i] : c === ' ' ? '　' : c;
            }).join('');
            reply(`✨ *Aesthetic*\n\n${out}\n\n> 𝐋𝐈𝐀𝐌 𝐄𝐘𝐄𝐒 👁️`);
        }
    },
    {
        command: 'hug', description: 'Send a virtual hug', category: 'fun',
        execute: async (sock, m, { reply, sender }) => {
            const num = sender.split('@')[0];
            const hugs = ['(っ˘̩╭╮˘̩)っ', 'づ｡◕‿‿◕｡づ', '(づ￣ ³￣)づ', '⊂(•‿•⊂)', '(⊃｡•́‿•̀｡)⊃'];
            const hug = hugs[~~(Math.random() * hugs.length)];
            await sock.sendMessage(m.chat, { react: { text: '🤗', key: m.key } });
            reply(`🤗 *Virtual Hug!*\n\n${hug}\n\nSending warmth to everyone! 💛\n\n> 𝐋𝐈𝐀𝐌 𝐄𝐘𝐄𝐒 👁️`);
        }
    },
];
