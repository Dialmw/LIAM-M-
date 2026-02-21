// Group Tools — antilink, antibadword, welcome, kick, promote, demote, tagall
const config = require('../settings/config');
const toggle = async (feat, label, emoji, sock, m, reply) => {
    config.features[feat] = !config.features[feat];
    const on = config.features[feat];
    await sock.sendMessage(m.chat, { react: { text: on ? emoji : '❌', key: m.key } });
    reply(`${emoji} *${label}* is now *${on ? '✅ ON' : '❌ OFF'}*`);
};
const getMentioned = (m) =>
    m.message?.extendedTextMessage?.contextInfo?.mentionedJid ||
    m.message?.imageMessage?.contextInfo?.mentionedJid || [];

module.exports = [
    {
        command: 'antilink', description: 'Block links in group', category: 'group', group: true,
        execute: async (s,m,{reply,isAdmins,isCreator}) => {
            if (!isAdmins&&!isCreator) return reply(config.message.admin);
            toggle('antilink','🔗 Anti-Link','🔗',s,m,reply);
        }
    },
    {
        command: 'antibadword', description: 'Block bad words in group', category: 'group', group: true,
        execute: async (s,m,{reply,isAdmins,isCreator}) => {
            if (!isAdmins&&!isCreator) return reply(config.message.admin);
            toggle('antibadword','🤬 Anti Bad Word','🤬',s,m,reply);
        }
    },
    {
        command: 'welcome', description: 'Toggle welcome messages', category: 'group', group: true,
        execute: async (s,m,{reply,isAdmins,isCreator}) => {
            if (!isAdmins&&!isCreator) return reply(config.message.admin);
            toggle('welcome','👋 Welcome','👋',s,m,reply);
        }
    },
    {
        command: 'kick', description: 'Remove a member (reply or mention)', category: 'group', group: true, admin: true,
        execute: async (sock, m, { reply, isAdmins, isCreator, isBotAdmins }) => {
            if (!isAdmins&&!isCreator) return reply(config.message.admin);
            if (!isBotAdmins) return reply('❌ I need to be admin to kick members!');
            const target = getMentioned(m)[0] || m.quoted?.sender;
            if (!target) return reply('❓ Reply to or mention the member to kick.');
            await sock.groupParticipantsUpdate(m.chat, [target], 'remove');
            await sock.sendMessage(m.chat, { react: { text: '👢', key: m.key } });
            reply(`👢 *Kicked:* @${target.split('@')[0]}`, { mentions: [target] });
        }
    },
    {
        command: 'promote', description: 'Make member an admin', category: 'group', group: true, admin: true,
        execute: async (sock, m, { reply, isAdmins, isCreator, isBotAdmins }) => {
            if (!isAdmins&&!isCreator) return reply(config.message.admin);
            if (!isBotAdmins) return reply('❌ I need to be admin to promote!');
            const target = getMentioned(m)[0] || m.quoted?.sender;
            if (!target) return reply('❓ Mention or reply to the member.');
            await sock.groupParticipantsUpdate(m.chat, [target], 'promote');
            await sock.sendMessage(m.chat, { react: { text: '⬆️', key: m.key } });
            reply(`⬆️ *Promoted* @${target.split('@')[0]} to admin!`, { mentions: [target] });
        }
    },
    {
        command: 'demote', description: 'Remove admin status', category: 'group', group: true, admin: true,
        execute: async (sock, m, { reply, isAdmins, isCreator, isBotAdmins }) => {
            if (!isAdmins&&!isCreator) return reply(config.message.admin);
            if (!isBotAdmins) return reply('❌ I need to be admin to demote!');
            const target = getMentioned(m)[0] || m.quoted?.sender;
            if (!target) return reply('❓ Mention or reply to the member.');
            await sock.groupParticipantsUpdate(m.chat, [target], 'demote');
            await sock.sendMessage(m.chat, { react: { text: '⬇️', key: m.key } });
            reply(`⬇️ *Demoted* @${target.split('@')[0]} from admin!`, { mentions: [target] });
        }
    },
    {
        command: 'tagall', description: 'Mention all group members', category: 'group', group: true, admin: true,
        execute: async (sock, m, { reply, isAdmins, isCreator, participants, text }) => {
            if (!isAdmins&&!isCreator) return reply(config.message.admin);
            const members = participants.map(p => p.id).filter(Boolean);
            const tags = members.map(j => `@${j.split('@')[0]}`).join(' ');
            await sock.sendMessage(m.chat, {
                text: `📢 *Tag All*${text ? `\n\n${text}` : ''}\n\n${tags}`,
                mentions: members
            }, { quoted: m });
        }
    },
    {
        command: 'mute', description: 'Mute the group (admins only)', category: 'group', group: true, admin: true,
        execute: async (sock, m, { reply, isAdmins, isCreator, isBotAdmins }) => {
            if (!isAdmins&&!isCreator) return reply(config.message.admin);
            if (!isBotAdmins) return reply('❌ I need to be admin!');
            await sock.groupSettingUpdate(m.chat, 'announcement');
            await sock.sendMessage(m.chat, { react: { text: '🔇', key: m.key } });
            reply('🔇 *Group muted!* Only admins can send messages.');
        }
    },
    {
        command: 'unmute', description: 'Unmute the group', category: 'group', group: true, admin: true,
        execute: async (sock, m, { reply, isAdmins, isCreator, isBotAdmins }) => {
            if (!isAdmins&&!isCreator) return reply(config.message.admin);
            if (!isBotAdmins) return reply('❌ I need to be admin!');
            await sock.groupSettingUpdate(m.chat, 'not_announcement');
            await sock.sendMessage(m.chat, { react: { text: '🔊', key: m.key } });
            reply('🔊 *Group unmuted!* Everyone can send messages.');
        }
    },
];
