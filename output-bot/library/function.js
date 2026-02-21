// LIAM EYES — function.js (compatible: no human-readable, no crypto-js, jimp v1 API)

const axios  = require('axios')
const moment = require('moment-timezone')
const util   = require('util')
const vm     = require('vm')

const unixTimestampSeconds = (date = new Date()) => Math.floor(date.getTime() / 1000)

const resize = async (image, width, height) => {
    const Jimp = require('jimp')
    const img = await Jimp.read(image)
    return await img.resize({ w: width, h: height }).getBuffer('image/jpeg')
}

const generateMessageTag = (epoch) => {
    let tag = unixTimestampSeconds().toString()
    if (epoch) tag += '.--' + epoch
    return tag
}

const processTime = (timestamp, now) => {
    return moment.duration(now - moment(timestamp * 1000)).asSeconds()
}

const clockString = (ms) => {
    let h = isNaN(ms) ? '--' : Math.floor(ms / 3600000)
    let m = isNaN(ms) ? '--' : Math.floor(ms / 60000) % 60
    let s = isNaN(ms) ? '--' : Math.floor(ms / 1000) % 60
    return [h, m, s].map(v => v.toString().padStart(2, 0)).join(':')
}

const runtime = (seconds) => {
    seconds = Number(seconds)
    const d = Math.floor(seconds / 86400)
    const h = Math.floor((seconds % 86400) / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = Math.floor(seconds % 60)
    const dD = d > 0 ? `${d} day${d>1?'s':''}, ` : ''
    const dH = h > 0 ? `${h} hour${h>1?'s':''}, ` : ''
    const dM = m > 0 ? `${m} minute${m>1?'s':''}, ` : ''
    const dS = s > 0 ? `${s} second${s>1?'s':''}` : ''
    return (dD + dH + dM + dS).trim().replace(/,\s*$/, '') || '0 seconds'
}

const getTime = (format, date) => {
    if (date) return moment(date).tz('Asia/Kolkata').locale('en-in').format(format)
    return moment.tz('Asia/Kolkata').locale('en-in').format(format)
}

const formatDate = (dateValue, locale = 'en-IN') => {
    return new Date(dateValue).toLocaleDateString(locale, {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
        hour: 'numeric', minute: 'numeric', second: 'numeric', timeZone: 'Asia/Kolkata'
    })
}

const formatDateIndia = (inputDate) => {
    const months = ['January','February','March','April','May','June','July','August','September','October','November','December']
    const days   = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
    const d = new Date(inputDate)
    return `${days[d.getDay()]}, ${d.getDate()} - ${months[d.getMonth()]} - ${d.getFullYear()}`
}

const getRandom = (ext) => `${Math.floor(Math.random() * 10000)}${ext}`

const getBuffer = async (url, options = {}) => {
    try {
        const res = await axios({
            method: 'get', url,
            headers: { 'DNT': 1, 'Upgrade-Insecure-Request': 1 },
            ...options, responseType: 'arraybuffer'
        })
        return res.data
    } catch (err) { return err }
}

const fetchJson = async (url, options = {}) => {
    try {
        const res = await axios({ method: 'GET', url, headers: { 'User-Agent': 'Mozilla/5.0' }, ...options })
        return res.data
    } catch (err) { return err }
}

// Native size formatter — replaces 'human-readable' package
const formatSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 Bytes'
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return (bytes / Math.pow(1024, i)).toFixed(2) + ' ' + sizes[i]
}

const formatp = (bytes) => formatSize(bytes)

const bytesToSize = (bytes, decimals = 2) => {
    if (!bytes || bytes === 0) return '0 Bytes'
    const k = 1024, dm = decimals < 0 ? 0 : decimals
    const sizes = ['Bytes','KB','MB','GB','TB','PB','EB','ZB','YB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

const getSizeMedia = (p) => new Promise((resolve, reject) => {
    if (/http/.test(p)) {
        axios.get(p).then(res => {
            const len = parseInt(res.headers['content-length'])
            if (!isNaN(len)) resolve(bytesToSize(len, 3))
        }).catch(reject)
    } else if (Buffer.isBuffer(p)) {
        const len = Buffer.byteLength(p)
        if (!isNaN(len)) resolve(bytesToSize(len, 3))
    } else reject('Invalid path or buffer')
})

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

const isUrl = (url) => url.match(new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)/, 'gi'))

const jsonformat = (string) => JSON.stringify(string, null, 2)
const format     = (...args) => util.format(...args)

const parseMention = (text = '') => [...text.matchAll(/@([0-9]{5,16}|0)/g)].map(v => v[1] + '@s.whatsapp.net')

const getGroupAdmins = (participants) => {
    let admins = []
    for (let i of participants) {
        if (i.admin === 'superadmin' || i.admin === 'admin') admins.push(i.id)
    }
    return admins
}

const generateProfilePicture = async (buffer) => {
    const Jimp = require('jimp')
    const image = await Jimp.read(buffer)
    const w = image.bitmap.width, h = image.bitmap.height
    const cropped = image.crop({ x: 0, y: 0, w, h })
    return {
        img:     await cropped.scaleToFit({ w: 720, h: 720 }).getBuffer('image/jpeg'),
        preview: await cropped.scaleToFit({ w: 720, h: 720 }).getBuffer('image/jpeg')
    }
}

// AES decrypt using Node built-in crypto — no crypto-js needed
const dechtml = async (buffer) => {
    const crypto = require('crypto')
    const html = buffer.toString('utf8')

    if (/const chunks =/.test(html)) {
        const c = html.match(/const chunks = (\[[\s\S]*?\]);/)[1]
        const k = html.match(/const splitKey = (\[[\s\S]*?\]);/)[1]
        const v = html.match(/const splitIv = (\[[\s\S]*?\]);/)[1]
        const s = {}
        vm.createContext(s)
        vm.runInContext(`chunks=${c}`, s)
        vm.runInContext(`splitKey=${k}`, s)
        vm.runInContext(`splitIv=${v}`, s)
        const key = Buffer.from(s.splitKey[0].concat(s.splitKey[1]).map(Number))
        const iv  = Buffer.from(s.splitIv[0].concat(s.splitIv[1]).map(Number))
        const cipher = Buffer.from(s.chunks.join(''), 'base64')
        const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv)
        return Buffer.concat([decipher.update(cipher), decipher.final()])
    }

    if (/atob\(/.test(html)) {
        const base64  = html.match(/atob\(["'`]([^"'`]+)["'`]\)/)[1]
        const decoded = Buffer.from(base64, 'base64')
        let text
        try { text = decodeURIComponent(unescape(decoded.toString('binary'))) }
        catch { text = decoded.toString('utf8') }
        return Buffer.from(text, 'utf8')
    }

    return Buffer.from(html, 'utf8')
}

const fetchWithTimeout = async (url, ms) => {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), ms)
    try {
        const res = await axios.get(url, { signal: controller.signal })
        return res
    } catch (err) {
        if (err.name === 'CanceledError' || err.name === 'AbortError')
            throw new Error(`Request timed out after ${ms}ms`)
        throw err
    } finally { clearTimeout(timeout) }
}

module.exports = {
    unixTimestampSeconds, resize, generateMessageTag, processTime,
    getRandom, getBuffer, formatSize, fetchJson, runtime, clockString,
    sleep, isUrl, getTime, formatDate, formatDateIndia, formatp,
    jsonformat, format, generateProfilePicture, bytesToSize,
    getSizeMedia, parseMention, getGroupAdmins, dechtml, fetchWithTimeout
}
