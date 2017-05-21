#!/bin/env node
var express = require('express')
var fs = require('fs')
var path = require('path')

var app = express()
app.use(require('express-fileupload')())

const PORT = process.env.PORT || 3000
const DIR = __dirname + '/saved'

if (!fs.lstatSync(DIR).isDirectory()) {
    console.error(`saved directory is missing? checked ${DIR}`)
    return process.exit(1)
}

function sanitize(filename) {
    if (!filename.match(/^([A-z0-9_-]+\.?)+$/))
        throw 'illegal filename'

    return filename
}

function link(req, upload) {
    const base = req.protocol + '://' + req.get('Host')
    return `<a href="${base}/saved/${upload}">${upload}</a>`
}

function respond(res, inner) {
    res.set('Content-Type', 'text/html')
    res.end(
        `<!DOCTYPE html><html><head>
        <link rel="shortcut icon" href="/favicon.ico?3" type="image/x-icon">
        <link rel="icon" href="/favicon.ico?3" type="image/x-icon">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        </head><body>
        <style>*{text-align: center !important;margin: auto !important;}</style>
        ${inner}</body></html>`)
}

app.get('/', (req, res) => {
    respond(res, 
        `<form action="/" method="post" enctype="multipart/form-data">
        <input type="file" name="upload" id="upload">
        <br><input type="submit" value="Upload" name="submit"></form>`)
})

app.get('/ls', (req, res) => {
    respond(res,
        fs.readdirSync(DIR)
            .map(link.bind(null, req))
            .join(`<br>`))
})

app.post('/', (req, res) => {
    var u = req.files.upload
    if (!u)
        return res.status(400).end("?")

    console.log(`upload: ${u.name}, encoding: ${u.encoding}, mimetype: ${u.mimetype}`)

    var savedName = sanitize(u.name)

    u.mv(`${DIR}/${savedName}`, function (err) {

        if (err) {
            console.error(`failed: ${savedName}, err: ${err}`)
            res.status(500)
            return respond(res, err)
        }

        console.log(`saved: ${savedName}`)

        res.status(201)
        respond(res, `${link(req, savedName)}<p>⚡🕊️</p>`)
    })
})

app.listen(PORT, function () {
    console.log(`thunderdove perched at port ${PORT}`)
})
