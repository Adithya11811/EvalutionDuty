const express = require('express')
const app = express()

app.set('view engine','ejs')
app.use(express.static('public'))

app.get("/",(req,res)=>{
    res.sendFile(__dirname+"/index.html")
})

app.use("/admin",require("./AdminRoutes/ad_login"))
app.use("/admin",require("./AdminRoutes/ad_userReg"))
app.use("/user",require("./userRoutes/user_login"))
app.use("/admin",require("./AdminRoutes/ad_faculty"))
app.use("/admin",require("./AdminRoutes/ad_slotBook"))
app.use("/admin",require("./AdminRoutes/ad_reports"))

app.listen(3000,()=>{
    console.log("Server at 3000")
})