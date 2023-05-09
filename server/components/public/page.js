const http = require("../lib/http.js")
const util = require("../lib/util.js")

// BUILTIN
const zlib_builtin = require("node:zlib")
const fs_builtin = require("fs")

// @DONE
exports.component = async (context, incoming) => {

    if (context.html_cache === null) {
        
        const result = { done: 0 }
        const interval = setInterval(() => {
            if (context.html_cache !== null) {
                result.done = 1
                clearInterval(interval)
            }
        })     
        
        await util.wait(result)
    }

    incoming.result = zlib_builtin.gzipSync(context.html_cache, { level: 1 }) 
    if (context.mode === "dev") { console.log(incoming.result.length) }
    incoming.response.writeHead(200, {
        "Content-Length": Buffer.from(incoming.result).length,
        "Content-Type": "text/html; charset=utf-8",
        "Content-Encoding": "gzip"
    })
}