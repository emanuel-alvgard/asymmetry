// BUILTIN
const fs_builtin = require("fs")
const zlib_builtin = require("node:zlib")

// TOOLS
const http = require("./components/lib/http.js")
const util = require("./components/lib/util.js")
const dir = require("./components/lib/dir.js")
const database = require("./components/lib/database.js")

// ROUTE
const file = require("./components/public/file.js")
const api = require("./components/public/api.js")
const page = require("./components/public/page.js")

// NPM
const esbuild = require("./_runtime/node_modules/esbuild")

const _mode = process.argv[2]
const _platform = process.platform
const _config = JSON.parse(fs_builtin.readFileSync("../config.json"))

if (_mode === "dev") {}
else if (_mode === "live") {}
else { console.log("Please enter execution mode: (dev / live)."); process.exit() }

console.log("Server v.1.0.0 (" + _platform + ") (" + _mode + ") started on port " + _config.port)
console.log("Type 'help' for avalible commands.")


let context = {

    mode: _mode,
    time: performance.now(),
    delta: 0.0,
    db: database("./db", 1000),

    // ACTIVE USERS
    token_timeout: 3_600_000, // 1h
    active_tokens: [],
    active_users: [],
    active_timers: [],

    // PASSWORDS
    password_timeout: 604_800_000, // 7d
    password_timers: [],
    passwords_real: [],
    password_tokens: [], 
    
    protocol: "https://",
    config: _config,
    html_cache: null
}

if (_mode === "dev") {
    context.protocol = "http://";
    context.config.domain = "localhost:" + context.config.port;
}

let routes = [
    file.component,
    file.component,
    file.component,
    file.component,
    file.component, 
    api,
    page.component
]

let triggers = [
    "/client/",
    "/robots.txt",
    "/sitemap.xml",
    "/favicon.ico",
    "/site.manifest",
    "/api/",
    "/",
]

// TIMERS
const _interval = 500
setInterval(()=>{

    let time = performance.now()
    context.delta = (time - context.time) / 1000
    context.time = time

    // ACTIVE USERS
    for (let i=0; i < context.active_timers.length; i++) {
        context.active_timers[i] += context.delta * _interval
        if (context.active_timers[i] >= context.token_timeout) {
            context.active_timers.splice(i, 1)
            context.active_tokens.splice(i, 1)
            context.active_users.splice(i, 1)
            i --
        }
    }

    // PASSWORD
    for (let i=0; i < context.password_timers.length; i++) {
        context.password_timers[i] += context.delta * _interval
        if (context.password_timers[i] >= context.password_timeout) {
            context.password_timers.splice(i, 1)
            context.passwords_real.splice(i, 1)
            context.password_tokens.splice(i, 1)
            i --
        }
    }

}, _interval)



// RELOADING
let _reload = 0
let _load = true
function reload() {

    console.log(`Reload: ${_reload}`)
    _reload ++

    // REBUILD
    let build = ["../client/app.js"]
    let minified = null

    try {
        minified = esbuild.buildSync({
            loader: { ".js": "js" },
            entryPoints: build,
            bundle: true,
            minify: true,
            write: false,
            allowOverwrite: true,
        })
    }
    catch (e) {}
    
    
    try {
        let reload_script = ""
        let export_script = ""

        if (_mode === "dev") {
            if (_load) { _load = false }
            else { context.client_reload = true }
            reload_script = fs_builtin.readFileSync("./_runtime/client_reload.js").toString()
            export_script = fs_builtin.readFileSync("./_runtime/client_export.js").toString()
        }

        let html = fs_builtin.readFileSync("../client/app.html").toString()

        let pointer = { position:0, previous:0 }
        while (pointer.position < html.length) {
            if (util.string(html, "</body>", pointer)) { break }
            pointer.position ++
        }

        let html_start = html.substring(0, pointer.previous)
        let html_end = html.substring(pointer.previous, html.length)

        const _html = `
            ${html_start}
            <script> 
            ${reload_script} 
            </script>
            <script>
            ${minified.outputFiles[0].text} 
            </script>
            <script> 
            ${export_script} 
            </script>
            ${html_end}
        `
        context.html_cache = _html
    }
    catch(e) {}
}

// HOT RELOADING
if (_mode === "dev") {
        
    context.client_reload = false

    triggers.unshift("/client_reload")
    routes.unshift(async (context, incoming) => {

        const result = { done: 0 }

        const check = setInterval(() => {
            if (context.client_reload) {
                context.client_reload = false
                incoming.result = "reload"
                incoming.response.writeHead(200, {
                    'Content-Length': Buffer.from(incoming.result).length,
                    'Content-Type': "text/plain"
                })
                result.done = 1
                clearInterval(check)
            }
        }, 100)
        
        await util.wait(result)
    })
}


// WATCH HTML / JS
dir.watch("../client", [".js", ".html"], ["node_modules"], 100, reload)

let router = http.router(context, routes, triggers)
http.server(context, router, "./_runtime/cert.pfx")