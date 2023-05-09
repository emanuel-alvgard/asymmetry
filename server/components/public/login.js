// @DONE
function _token(buffer, length) {

    function _generate() {  

        const digit = 48
        const upper = 65
        const lower = 97
        
        let id = ""

        for (let i=0; i < length; i++) {
            const type = Math.random() * 3
            let code
        
            if (type < 1) { code = digit + Math.round(Math.random() * 9) }
            else if (type < 2) { code = upper + Math.round(Math.random() * 25) }
            else { code = lower + Math.round(Math.random() * 25) }

            id += String.fromCharCode(code)
        }
        return id
    }

    let id = _generate()
    while (buffer.includes(id)) {
        id = _generate()
    }
    return id
}

// @DONE
function _activate(context, user, result) {
    
    const token = _token(context.active_tokens, 64)
    const role = context.db.list_role((x)=>{
        if (x.name === user.role) { return true }
        else { return false } 
    })
    
    result.token = token
    result.permissions = role[0].permissions
    result.user = user

    context.active_tokens.push(token)
    context.active_users.push(user)
    context.active_timers.push(0.0)
    return
}

// @DONE
module.exports = async (context, incoming) => {

    let data
    try { data = JSON.parse(incoming.data) }
    catch(e) {}

    try {
        if (!"email" in data) { return }
        if (!"password" in data) { return }

        let result = {
            status: "success",
            message: "",
            token: "",
            permissions: []
        }

        const search = context.db.list_user((user)=>{
            if (user.email === data.email) { return true }
            else { return false }
        })

        if (search.length === 0) {
            result.status = "fail" 
            result.message = "Invalid account." 
        }
        else if (search[0].password !== data.password) {
            result.status = "fail" 
            result.message = "Invalid password."
        }
        else { _activate(context, search[0], result) }

        incoming.result = JSON.stringify(result)
    }
    catch(e) {}

}