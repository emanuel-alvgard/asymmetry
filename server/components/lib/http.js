const http_builtin = require("http")
const https_builtin = require("https")
const fs_builtin = require("fs")
const util = require("./util.js")


const _404_not_found = `
    <html>
    <body style="display:flex;width:100%;height:100%;align-items:center;justify-content:center;font-family:Tahoma">
        <h1>
            404 | Not found.
        </h1>
    </body>
    </html>
`

// @DONE
function setup() {

    let data = {

        done: false,
        fail: false,
        responses: { value: 0 },
        raw: [],
        parsed: [],
        formatted: {} // change to array?
    }

    return data;
}

// @DONE
function reset(http) {

    http.done = false
    http.fail = false
    http.responses.value = 0
    http.raw = []
    http.parsed = []
    http.formatted = {}

}

// @DONE
async function get(urls, result, headers={}) {
    
    for (let i = 0; i < urls.length; i++) {

        let _http
        let _options = {}
        if (urls[i].substring(0, 8) === "https://") { 
            _http = https_builtin
            _options.rejectUnauthorized = false
        }
        else if (urls[i].substring(0, 7) === "http://") { 
            _http = http_builtin 
        }

        _options.headers = headers

        result.raw.push({ string: "" });
        result.parsed.push({});
        
        const req = _http.get(urls[i], _options, res => {
            
            res.setEncoding("utf-8")
            res.on('data', function (data) {
                result.raw[i].string += data.toString()
                return
            })

            res.on('end', function () {
                result.responses.value += 1
                return
            })
        })

        req.on('error', function () {
            result.fail = true
        })

    }
    
    let condition = (task) => { if (task.responses.value === urls.length) { task.done = true }} 
    await util.wait(result, condition)

}

// @DONE
async function set(method, type, messages, urls, result, headers={}) {

    headers["Content-Type"] = type
    headers["Content-Length"] = Buffer.from(messages[i]).length

    for (let i = 0; i < urls.length; i++) {

        result.raw.push({ string: "" })
        result.parsed.push({})
        
        let options = { 
            method: method, 
            headers: headers
        }

        const req = http_builtin.request(urls[i], options, function (res) {
            
            res.setEncoding("utf-8")
            res.on('data', function (data) {
                result.raw[i].string += data.toString()
                console.log(data.toString())
                return
            })

            res.on('end', function () {
                result.responses.value += 1
                return
            })
        })

        req.on('error', function () {
            result.fail = true
        });
        
        req.write(messages[i])
        req.end()
    }
    
    let condition = (task) => { if (task.responses.value === urls.length) { task.done = true }} 
    await util.wait(result, condition)
}

// @DONE
function parse(result, func) {

    for (let i = 0; i < result.raw.length; i++) {
        Object.assign(result.parsed[i], func(result.raw[i].string))
    }

    return;
}

// @DONE
function server(context, router, cert=null) {

    let _http
    let _options
    if (cert !== null) { 
        _http = https_builtin
        _options = {
            pfx: fs_builtin.readFileSync(cert), 
            passphrase: context.config.cert_passphrase
        }
    }
    else { 
        _http = http_builtin
        _options = {} 
    }

    let result = _http.createServer(_options, router)
    result.listen(context.config.port)
    
    return result
}

// @DONE
function router(context, routes=[], triggers=[]) {

        async function request(req, res) {
            
            let incoming = {
                type: "external",
                request: req,
                response: res,
                host: req.headers.host,
                
                method: req.method,
                url: req.url,
                parts: util.parts(req.url, "/"),
                pointer: { position: 0, lenght: 0},

                data: "",
                result: _404_not_found
            }

            req.on("data", function (d) {
                incoming.data += d.toString()
            })

            req.on("end", async function () {
                
                res.setHeader("Referrer-Policy", "no-referrer")
                // @HERE
                /*res.setHeader("Content-Security-Policy", 
                    "default-src 'self' data:; script-src 'self' 'unsafe-inline'; worker-src 'self' blob:; style-src 'self' 'unsafe-inline'; upgrade-insecure-requests;")
                */
                res.statusCode = 404
                let index = util.match(incoming.url, triggers, "/")
                try { await routes[index](context, incoming) } catch (e) { console.log(e) }
                res.end(incoming.result)
            })

            req.on("error", (error) => { console.log(error) })
            req.on("timeout", ()=>{})
        }

    return request
}

// @EXPORT
exports.setup = setup
exports.reset = reset
exports.get = get
exports.set = set
exports.parse = parse
exports.server = server
exports.router = router