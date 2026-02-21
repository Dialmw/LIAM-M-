// ai_tools.js — GPT, Gemini, and AI commands
const axios  = require('axios');
const config = require('../settings/config');

const THINK = '🤔';
const ERR   = '❌';

// ── Helper: react + reply ──────────────────────────────────────
const go = async (sock, m, reply, emoji, fn) => {
    await sock.sendMessage(m.chat, { react: { text: emoji, key: m.key } }).catch(() => {});
    try {
        const result = await fn();
        await sock.sendMessage(m.chat, { react: { text: '✅', key: m.key } }).catch(() => {});
        return reply(result);
    } catch (e) {
        await sock.sendMessage(m.chat, { react: { text: ERR, key: m.key } }).catch(() => {});
        return reply(`❌ *Error:* ${e.message}\n\n> 𝐋𝐈𝐀𝐌 𝐄𝐘𝐄𝐒 👁️`);
    }
};

// ── Free API endpoints ─────────────────────────────────────────
const apis = {
    // GPT-style via pollinations (free, no key)
    gpt: async prompt => {
        const r = await axios.get(
            `https://text.pollinations.ai/${encodeURIComponent(prompt)}`,
            { timeout: 20000, headers: { 'User-Agent': 'LIAM-EYES-Bot/1.0' } }
        );
        return r.data?.toString()?.trim() || 'No response';
    },

    // Gemini-style via another free endpoint
    gemini: async prompt => {
        const r = await axios.post(
            'https://api.kastela.org/v1/chat/completions',
            { model: 'gemini-pro', messages: [{ role: 'user', content: prompt }] },
            { timeout: 20000, headers: { 'Content-Type': 'application/json' } }
        );
        return r.data?.choices?.[0]?.message?.content?.trim() || 'No response';
    },

    // Blackbox AI (free)
    blackbox: async prompt => {
        const r = await axios.post(
            'https://www.blackbox.ai/api/chat',
            { messages: [{ id: '1', content: prompt, role: 'user' }], agentMode: {} },
            { timeout: 20000, headers: { 'Content-Type': 'application/json', 'Origin': 'https://www.blackbox.ai' } }
        );
        return (r.data?.toString() || 'No response').replace(/\$@\$.*?\$@\$/g, '').trim();
    },

    // Image generation via pollinations
    imagine: async prompt => {
        return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=800&height=800&nologo=true&seed=${Date.now()}`;
    },
};

// ── Format AI response ─────────────────────────────────────────
const fmt = (model, prompt, answer) =>
    `╭──『 ${model} 』\n│\n│ 🔍 *Query:* ${prompt.length > 60 ? prompt.slice(0, 60) + '…' : prompt}\n│\n│ 💬 *Answer:*\n${answer.split('\n').map(l => '│ ' + l).join('\n')}\n╰${'─'.repeat(28)}\n\n> 👁️ 𝐋𝐈𝐀𝐌 𝐄𝐘𝐄𝐒`;

module.exports = [
    // ── GPT ────────────────────────────────────────────────────
    {
        command: 'gpt', category: 'ai',
        execute: async (sock, m, { text, reply }) => {
            if (!text) return reply('❓ Usage: *.gpt <question>*\n\nExample: _.gpt explain quantum computing_');
            await go(sock, m, reply, THINK, async () => {
                const ans = await apis.gpt(text);
                return fmt('🤖 GPT', text, ans);
            });
        }
    },

    // ── Gemini ─────────────────────────────────────────────────
    {
        command: 'gemini', category: 'ai',
        execute: async (sock, m, { text, reply }) => {
            if (!text) return reply('❓ Usage: *.gemini <question>*\n\nExample: _.gemini what is dark matter_');
            await go(sock, m, reply, THINK, async () => {
                const ans = await apis.gemini(text);
                return fmt('♊ Gemini', text, ans);
            });
        }
    },

    // ── Blackbox ────────────────────────────────────────────────
    {
        command: 'blackbox', category: 'ai',
        execute: async (sock, m, { text, reply }) => {
            if (!text) return reply('❓ Usage: *.blackbox <question>*\n\nExample: _.blackbox write a python script_');
            await go(sock, m, reply, THINK, async () => {
                const ans = await apis.blackbox(text);
                return fmt('⬛ Blackbox AI', text, ans);
            });
        }
    },

    // ── AI Image Generator ──────────────────────────────────────
    {
        command: 'imagine', category: 'ai',
        execute: async (sock, m, { text, reply }) => {
            if (!text) return reply('❓ Usage: *.imagine <description>*\n\nExample: _.imagine a futuristic city at night_');
            await sock.sendMessage(m.chat, { react: { text: '🎨', key: m.key } }).catch(() => {});
            try {
                const url = await apis.imagine(text);
                // Small delay for image to generate
                await new Promise(r => setTimeout(r, 2000));
                await sock.sendMessage(m.chat, {
                    image: { url },
                    caption:
                        `🎨 *AI Image*\n\n` +
                        `🖼️ *Prompt:* ${text}\n\n` +
                        `> 👁️ 𝐋𝐈𝐀𝐌 𝐄𝐘𝐄𝐒`,
                    contextInfo: { externalAdReply: {
                        title: '𝐋𝐈𝐀𝐌 𝐄𝐘𝐄𝐒 — AI Art',
                        body: '👁️ Your Eyes in the WhatsApp World',
                        thumbnailUrl: config.thumbUrl,
                        sourceUrl: 'https://whatsapp.com/channel/0029VbBeZTc1t90aZjks9v2S',
                        mediaType: 1,
                    }}
                }, { quoted: m });
                await sock.sendMessage(m.chat, { react: { text: '✅', key: m.key } }).catch(() => {});
            } catch (e) {
                await sock.sendMessage(m.chat, { react: { text: ERR, key: m.key } }).catch(() => {});
                reply(`❌ Image generation failed: ${e.message}`);
            }
        }
    },

    // ── AI Ask (alias) ──────────────────────────────────────────
    {
        command: 'ask', category: 'ai',
        execute: async (sock, m, { text, reply }) => {
            if (!text) return reply('❓ Usage: *.ask <question>*');
            await go(sock, m, reply, THINK, async () => {
                const ans = await apis.gpt(text);
                return fmt('🤖 AI', text, ans);
            });
        }
    },

    // ── AI Code helper ──────────────────────────────────────────
    {
        command: 'code', category: 'ai',
        execute: async (sock, m, { text, reply }) => {
            if (!text) return reply('❓ Usage: *.code <description>*\n\nExample: _.code python fibonacci function_');
            await go(sock, m, reply, '💻', async () => {
                const ans = await apis.gpt('Write clean, well-commented code for: ' + text + '. Include only the code and brief explanation.');
                return fmt('💻 Code AI', text, ans);
            });
        }
    },

    // ── Translate ───────────────────────────────────────────────
    {
        command: 'translate', category: 'ai',
        execute: async (sock, m, { args, reply }) => {
            if (args.length < 2) return reply('❓ Usage: *.translate <language> <text>*\n\nExample: _.translate spanish Hello how are you_');
            const lang = args[0];
            const txt  = args.slice(1).join(' ');
            await go(sock, m, reply, '🌍', async () => {
                const ans = await apis.gpt(`Translate the following to ${lang}. Reply with ONLY the translation, nothing else: "${txt}"`);
                return `🌍 *Translation → ${lang}*\n\n*Original:* ${txt}\n*Translated:* ${ans}\n\n> 👁️ 𝐋𝐈𝐀𝐌 𝐄𝐘𝐄𝐒`;
            });
        }
    },

    // ── Summarize ───────────────────────────────────────────────
    {
        command: 'summarize', category: 'ai',
        execute: async (sock, m, { text, reply, quoted }) => {
            const input = text || quoted?.text || '';
            if (!input) return reply('❓ Usage: *.summarize <text>* or reply to a message');
            await go(sock, m, reply, '📝', async () => {
                const ans = await apis.gpt('Summarize this in 3-5 bullet points: ' + input);
                return fmt('📝 Summary', input.slice(0, 40) + '…', ans);
            });
        }
    },
];
