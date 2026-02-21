// LIAM EYES — exif.js (jimp v1 compatible)

const fs      = require('fs')
const { tmpdir } = require('os')
const Crypto  = require('crypto')
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path
const ff      = require('fluent-ffmpeg')
const webp    = require('node-webpmux')
const path    = require('path')
ff.setFfmpegPath(ffmpegPath)

const tmpRand = (ext) => path.join(tmpdir(), `${Crypto.randomBytes(6).readUIntLE(0,6).toString(36)}.${ext}`)

async function imageToWebp(media) {
    const tmpOut = tmpRand('webp')
    const tmpIn  = tmpRand('jpg')
    fs.writeFileSync(tmpIn, media)
    await new Promise((resolve, reject) => {
        ff(tmpIn)
            .on('error', reject)
            .on('end', () => resolve(true))
            .addOutputOptions([
                '-vcodec', 'libwebp',
                '-vf', "scale='min(320,iw)':min'(320,ih)':force_original_aspect_ratio=decrease,fps=15,pad=320:320:-1:-1:color=white@0.0,split[a][b];[a]palettegen=reserve_transparent=on:transparency_color=ffffff[p];[b][p]paletteuse"
            ])
            .toFormat('webp').save(tmpOut)
    })
    const buff = fs.readFileSync(tmpOut)
    try { fs.unlinkSync(tmpOut); fs.unlinkSync(tmpIn) } catch (_) {}
    return buff
}

async function videoToWebp(media) {
    const tmpOut = tmpRand('webp')
    const tmpIn  = tmpRand('mp4')
    fs.writeFileSync(tmpIn, media)
    await new Promise((resolve, reject) => {
        ff(tmpIn)
            .on('error', reject)
            .on('end', () => resolve(true))
            .addOutputOptions([
                '-vcodec', 'libwebp',
                '-vf', "scale='min(320,iw)':min'(320,ih)':force_original_aspect_ratio=decrease,fps=15,pad=320:320:-1:-1:color=white@0.0,split[a][b];[a]palettegen=reserve_transparent=on:transparency_color=ffffff[p];[b][p]paletteuse",
                '-loop', '0', '-ss', '00:00:00', '-t', '00:00:05',
                '-preset', 'default', '-an', '-vsync', '0'
            ])
            .toFormat('webp').save(tmpOut)
    })
    const buff = fs.readFileSync(tmpOut)
    try { fs.unlinkSync(tmpOut); fs.unlinkSync(tmpIn) } catch (_) {}
    return buff
}

function buildExif(packname, author, categories = ['']) {
    const json = {
        'sticker-pack-id':        Crypto.randomBytes(16).toString('hex'),
        'sticker-pack-name':      packname || 'LIAM EYES',
        'sticker-pack-publisher': author   || 'Liam',
        'emojis':                 categories,
    }
    const exifAttr = Buffer.from([0x49,0x49,0x2A,0x00,0x08,0x00,0x00,0x00,0x01,0x00,0x41,0x57,0x07,0x00,0x00,0x00,0x00,0x00,0x16,0x00,0x00,0x00])
    const jsonBuff = Buffer.from(JSON.stringify(json), 'utf-8')
    const exif = Buffer.concat([exifAttr, jsonBuff])
    exif.writeUIntLE(jsonBuff.length, 14, 4)
    return exif
}

async function writeExifImg(media, metadata) {
    const wMedia  = await imageToWebp(media)
    const tmpIn   = tmpRand('webp')
    const tmpOut  = tmpRand('webp')
    fs.writeFileSync(tmpIn, wMedia)
    const img = new webp.Image()
    await img.load(tmpIn)
    try { fs.unlinkSync(tmpIn) } catch (_) {}
    img.exif = buildExif(metadata.packname, metadata.author, metadata.categories)
    await img.save(tmpOut)
    return tmpOut
}

async function writeExifVid(media, metadata) {
    const wMedia  = await videoToWebp(media)
    const tmpIn   = tmpRand('webp')
    const tmpOut  = tmpRand('webp')
    fs.writeFileSync(tmpIn, wMedia)
    const img = new webp.Image()
    await img.load(tmpIn)
    try { fs.unlinkSync(tmpIn) } catch (_) {}
    img.exif = buildExif(metadata.packname, metadata.author, metadata.categories)
    await img.save(tmpOut)
    return tmpOut
}

async function writeExif(media, metadata) {
    let wMedia
    if (/webp/.test(media.mimetype))   wMedia = media.data
    else if (/image/.test(media.mimetype)) wMedia = await imageToWebp(media.data)
    else if (/video/.test(media.mimetype)) wMedia = await videoToWebp(media.data)
    else return null
    const tmpIn  = tmpRand('webp')
    const tmpOut = tmpRand('webp')
    fs.writeFileSync(tmpIn, wMedia)
    const img = new webp.Image()
    await img.load(tmpIn)
    try { fs.unlinkSync(tmpIn) } catch (_) {}
    img.exif = buildExif(metadata.packname, metadata.author, metadata.categories)
    await img.save(tmpOut)
    return tmpOut
}

async function addExif(webpSticker, packname, author, categories = ['']) {
    const img = new webp.Image()
    await img.load(webpSticker)
    img.exif = buildExif(packname, author, categories)
    return await img.save(null)
}

async function exifAvatar(buffer, packname, author, categories = [''], extra = {}) {
    const img = new webp.Image()
    const json = { 'sticker-pack-id': 'liam-eyes', 'sticker-pack-name': packname, 'sticker-pack-publisher': author, 'emojis': categories, 'is-avatar-sticker': 1, ...extra }
    const exifAttr = Buffer.from([0x49,0x49,0x2A,0x00,0x08,0x00,0x00,0x00,0x01,0x00,0x41,0x57,0x07,0x00,0x00,0x00,0x00,0x00,0x16,0x00,0x00,0x00])
    const jsonBuff = Buffer.from(JSON.stringify(json), 'utf8')
    const exif = Buffer.concat([exifAttr, jsonBuff])
    exif.writeUIntLE(jsonBuff.length, 14, 4)
    await img.load(buffer)
    img.exif = exif
    return await img.save(null)
}

module.exports = { imageToWebp, videoToWebp, writeExifImg, writeExifVid, writeExif, exifAvatar, addExif }
