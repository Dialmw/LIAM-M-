module.exports = {
    command: 'ping', description: 'Check bot response speed', category: 'general',
    execute: async (sock, m, { reply }) => {
        const start = Date.now();
        await sock.sendMessage(m.chat, { react: { text: '🏓', key: m.key } });
        reply(`🏓 *Pong!*\n⚡ *Speed:* ${Date.now() - start}ms`);
    }
};
