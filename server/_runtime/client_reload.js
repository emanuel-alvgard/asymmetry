let request = new XMLHttpRequest()

let failed = 0

// @DONE
function _request() {

    request.open("POST", window.location.origin + "/client_reload", true)
    request.setRequestHeader("Content-Type", "text/plain")
    request.onreadystatechange = () => { 
        if (request.responseText === "reload") { window.location.reload() }
    }
    request.onerror = () => { 
        if (failed === 5) { return }
        failed ++
        _request() 
    }
    request.ontimeout = () => {
        if (failed === 5) { return } 
        failed ++
        _request() 
    }
    request.send()
}

_request()