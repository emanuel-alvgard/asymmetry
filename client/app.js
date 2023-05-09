import { setup } from "./_runtime/context.js"

import main from "./components/main.js"

const app = setup()

app.component("main", main)

app.font("poppins_300", "poppins_300.woff2")
app.font("poppins_400", "poppins_400.woff2")
app.font("poppins_700", "poppins_700.woff2")

app.location("/main")

app.start()