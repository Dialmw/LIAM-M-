<div align="center">

<img src="https://raw.githubusercontent.com/Dialmw/LIAM-EYES/main/thumbnail/logo.jpg" width="200" alt="LIAM EYES Bot"/>

# 👁️ 𝐋𝐈𝐀𝐌 𝐄𝐘𝐄𝐒 Bot

### *See Everything. Know Everything.*

[![Version](https://img.shields.io/badge/Version-Alpha-00d4ff?style=for-the-badge&logo=whatsapp&logoColor=white)](https://github.com/Dialmw/LIAM-EYES)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Baileys](https://img.shields.io/badge/Baileys-Latest-a29bfe?style=for-the-badge)](https://github.com/whiskeysockets/baileys)
[![Creator](https://img.shields.io/badge/Creator-Liam-fdcb6e?style=for-the-badge)](https://github.com/Dialmw/LIAM-EYES)

<img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=700&size=22&pause=1000&color=00D4FF&center=true&vCenter=true&width=600&lines=👁️+LIAM+EYES+WhatsApp+Bot;See+Everything.+Know+Everything.;Music+%7C+Groups+%7C+AI+%7C+Status;80%2B+Commands+%7C+Alpha+Version;Created+by+Liam+%E2%9C%A6" alt="Typing SVG"/>

</div>

---

## 🔗 Quick Links

| 🌐 Pairing Site | 📡 WhatsApp Channel | 💻 GitHub |
|:---:|:---:|:---:|
| [liam-pannel.onrender.com/pair](https://liam-pannel.onrender.com/pair) | [Join Channel](https://whatsapp.com/channel/0029VbBeZTc1t90aZjks9v2S) | [Dialmw/LIAM-EYES](https://github.com/Dialmw/LIAM-EYES) |

---

## ⚡ Features

| Category | Commands |
|---|---|
| 🎵 **Music** | `.play` `.song` `.video` |
| 👁️ **Status** | `.tostatus` `.savestatus` `.autoviewstatus` `.autoreactstatus` `.autosavestatus` |
| 🖼️ **Media / Identity** | `.toprofile` `.tomenuimg` `.autobio` `.menustyle` |
| 🛡️ **Privacy** | `.antidelete` `.antiviewonce` `.vv` `.vv2` |
| 👥 **Groups** | `.kick` `.promote` `.demote` `.tagall` `.mute` `.unmute` `.antilink` `.antibadword` `.welcome` |
| 🤖 **AI** | `.chatbot` `.ask` `.gpt` `.gemini` `.imagine` `.blackbox` `.code` `.summarize` `.translate` |
| 🎨 **Tools** | `.sticker` `.toimg` `.tts` `.weather` `.define` `.calc` `.time` `.speed` `.info` `.profilepic` |
| 🔧 **Utility** | `.password` `.encode` `.decode` `.bmi` `.currency` `.morse` `.binary` `.hash` `.textcount` `.age` `.ipinfo` |
| 🎮 **Fun** | `.8ball` `.ship` `.roast` `.compliment` `.dare` `.truth` `.coinflip` `.dice` `.rps` `.trivia` `.wyr` `.spin` `.challenge` |
| ⚙️ **Owner** | `.pair` `.share` `.mode` `.restart` `.update` `.addbot` `.sessions` `.sudo` `.settings` `.setbotname` `.setprefix` `.broadcast` |
| 🔢 **Auto** | `.autoread on/off` `.autoreact on/off` `.alwaysonline on/off` `.autotyping on/off` `.autobio on/off` |

---

## 🚀 Setup Guide

### 1. Get Your Session ID
Visit **[https://liam-pannel.onrender.com/pair](https://liam-pannel.onrender.com/pair)** and pair your WhatsApp number.

### 2. Configure Settings
Open `settings/settings.js` and fill in:
```js
sessionId:   "LIAM~your_session_id_here",   // From pairing site
adminNumber: "254743285563",                  // Your number
sudo:        ["254712345678"],                // Optional sudo users
```

### 3. Install & Run
```bash
npm install
npm start
```

### 4. Pair directly from WhatsApp chat
```
.pair 254712345678
```
The bot will request a pairing code and send it back to you!

### 5. Toggle features on/off
```
.autotyping on
.autotyping off
.autobio on
.autobio set 👁️ LIAM EYES | Online {time}
```

### 6. Switch menu styles
```
.menustyle 1    ← Classic boxed
.menustyle 2    ← Compact minimal  
.menustyle 3    ← Fancy emoji grid
```

### 7. Image commands (reply to a photo)
```
.tostatus      ← Post image as your WA status
.toprofile     ← Set image as bot's profile pic
.tomenuimg     ← Set image as .menu thumbnail
```

---

## 📁 Folder Structure

```
LIAM-EYES-BOT/
├── index.js                   ← Main entry point
├── message.js                 ← Message handler & plugin loader
├── settings/
│   ├── settings.js            ← ⭐ YOUR CONFIG FILE (edit this!)
│   └── config.js              ← Auto-generated from settings.js
├── plugins/
│   ├── alive.js
│   ├── auto_features.js       ← All on/off toggles
│   ├── cool_features.js
│   ├── extra_features.js
│   ├── advanced_features.js   ← 20+ new utility commands
│   ├── media_tools.js         ← .pair .share .tostatus .toprofile .tomenuimg .autobio .menustyle
│   ├── group_tools.js
│   ├── owner_controls.js
│   ├── play.js / song.js / video.js
│   └── status_tools.js
├── library/                   ← Internal helpers
├── sessions/                  ← Bot session data
└── thumbnail/
    └── logo.jpg               ← Bot logo (LIAM EYES)
```

---

## ⚙️ Key Settings (`settings/settings.js`)

| Setting | Description | Default |
|---|---|---|
| `sessionId` | Your bot session from pairing site | `LIAM~...` |
| `adminNumber` | Your WhatsApp number | `254743285563` |
| `sudo` | Trusted users array | `[]` |
| `menuStyle` | Menu layout: 1/2/3 | `1` |
| `autoBio` | Auto-update WA bio | `false` |
| `autoBioText` | Bio template (`{time}` = clock) | see file |
| `antiDelete` | Recover deleted messages | `false` |
| `mode` | `public` or `private` | `public` |

---

## 🖥️ Deploy (VPS / PM2)

```bash
npm install pm2 -g
pm2 start index.js --name LIAM-EYES
pm2 save
pm2 startup
```

---

<div align="center">

<img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=600&size=16&pause=2000&color=A29BFE&center=true&vCenter=true&width=500&lines=👁️+LIAM+EYES+%E2%80%94+Alpha+by+Liam;%F0%9F%93%A1+Join+our+WhatsApp+Channel!" alt="Footer"/>

**Created with ❤️ by Liam**

[⭐ Star on GitHub](https://github.com/Dialmw/LIAM-EYES) · [📡 Join Channel](https://whatsapp.com/channel/0029VbBeZTc1t90aZjks9v2S) · [🔗 Pair Your Bot](https://liam-pannel.onrender.com/pair)

</div>
