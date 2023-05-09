const fs_builtin = require("fs")
const util = require("../lib/util.js")

const types = {
    js: "text/javascript",
    mjs: "text/javascript",
    html: "text/html",
    svg: "image/svg+xml",
    woff2: "application/font-woff2",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    ico: "image/png"
}

// @DONE
exports.component = async (context, incoming) => { // @ADD config

    let path = "..";  
    let file_type = util.filetype(incoming.url);
    let content_type = "";
    if (file_type in types) { content_type = types[file_type]; }

    switch (incoming.url) {
        case "/robots.txt": path += "../../client/assets/misc/robots.txt"; break;
        case "/sitemap.xml": path += "../../client/assets/misc/sitemap.xml"; break;
        case "/site.manifest": path += "../../client/assets/misc/site.manifest"; break;
        case "/favicon.ico": path += "../../client/assets/images/favicon.ico"; break;
        default: path += incoming.url
    }


    // @ADD check context.file_cache first

    try { incoming.result = await fs_builtin.promises.readFile(path); } catch(e) {}
    incoming.response.writeHead(200, {
        'Content-Length': Buffer.from(incoming.result).length,
        'Content-Type': content_type
    });
}