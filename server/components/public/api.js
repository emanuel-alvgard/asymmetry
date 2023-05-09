// BUILTIN
const zlib_builtin = require("node:zlib")

// ROUTES
const login = require("./login.js")
const password = require("./password.js")

// @DONE
async function _authenticate(context, token, rights) {
    const index = context.active_tokens.indexOf(token)
    const user = context.active_users[index]
    if (index > -1) {
        const role = context.db.list_role((x)=>{
            if (x.name === user.role) { return true }
            else { return false } 
        })
        if (role[0].permissions.includes(rights)) { return true }
    }         
    return false
}


// @DONE
async function _private(context, incoming, path/*, rights*/) {

    if (!"token" in incoming.data) { return false }
    if (!"message" in incoming.data) { return false }

    if (incoming.parts[1] === path && incoming.parts.length === 2) {
        return true
        //if (await _authenticate(context, incoming.data.token, rights)) { return true } 
    }
    return false
}

module.exports = async (context, incoming) => {

    if (incoming.method !== "POST") { return }

    // PUBLIC
    if (incoming.parts[1] === "login" && incoming.parts.length === 2) { await login(context, incoming) }
    if (incoming.parts[1] === "password" && incoming.parts.length === 3) { await password(context, incoming) }
    
    // PRIVATE
    let data
    try { data = JSON.parse(incoming.data) }
    catch (e) { return }

    incoming.data = data

    //if (await _private(context, incoming, "example"/*, "/options"*/)) { await customers(context, incoming) }

    // RESPONSE
    incoming.result = zlib_builtin.gzipSync(incoming.result, { level: 1 })
    incoming.response.writeHead(200, {
        "Content-Length": Buffer.from(incoming.result).length,
        "Content-Type": "application/json; charset=utf-8",
        "Content-Encoding": "gzip"
    })
}