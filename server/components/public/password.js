// @DONE
module.exports = async (context, incoming) => {

    let result = ""

    try {

        if (incoming.parts[2].length !== 64) { return }

        const token = incoming.parts[2]
        const index = context.password_tokens.indexOf(token)
        if (index < 0) { return }

        if (incoming.method === "GET") {
            result = `
                <!DOCTYPE html>
                <html lang="en" style="display:flex;width:100%;height:100%">
                
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, height=device-height, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=0, viewport-fit=cover">
                        <meta http-equiv="X-UA-Compatible" content="ie=edge">
                        <meta name="robots" content="index, nofollow">
                        <meta name="description" content="">
                    
                        <title>Monitor Roadshow</title>
                        <meta http-equiv="content-type" content="text/html; charset=UTF-8">
                        <link rel="icon" type="image/png" sizes="32x32" href="/client/assets/images/monitor_roadshow_32x32.png">
                    </head>
                
                    <body style="display:flex;width:100%;height:100%;align-items:center;justify-content:center;font-family:Tahoma">
                        <h1 id="password" style="display:flex;padding:25px;background-color:rgb(230,230,230);align-items:center;justify-content:center;border-radius:10px;letter-spacing:1px;cursor:pointer;border-style:none">
                            Show password
                        </h1>

                        <script>

                            let clicked = false
                            const password = document.getElementById("password")

                            password.onclick = () => {
                                if (clicked) { return }
                                clicked = true

                                let request = new XMLHttpRequest()
                                request.open("POST", "/api/password/${token}", true)
                            
                                request.setRequestHeader("Content-Type", "application/json; charset=utf8")
                                request.responseType = "text"
                            
                                request.onload = function () { 
                                    const result = JSON.parse(request.response)
                                    password.innerHTML = result.password
                                    password.style.cursor = "initial"
                                }
                                request.send()
                            }
                        </script>
                    </body>
                </html>
            `
            
            incoming.result = result                
            incoming.response.writeHead(200, {
                'Content-Length': Buffer.from(incoming.result).length,
                'Content-Type': "text/html"
            })

        }

        else if (incoming.method === "POST") {

            result = JSON.stringify({ password: context.passwords_real[index] })

            context.password_timers.splice(index, 1)
            context.passwords_real.splice(index, 1)
            context.password_tokens.splice(index, 1)

            incoming.result = result 
            incoming.response.writeHead(200, {
                'Content-Length': Buffer.from(incoming.result).length,
                'Content-Type': "application/json; charset=utf-8"
            })
        }
    }
    catch(e) { console.log(e) }
}