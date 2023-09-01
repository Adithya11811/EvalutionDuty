const express = require('express')
const bodyparser = require('body-parser')

const ad_login = express.Router()

ad_login.use(bodyparser.json())

ad_login.use(bodyparser.urlencoded({extended:true}))

ad_login.get("/",(req,res)=>{
    res.sendFile(__dirname+"/ad_login.html")
})
ad_login.post("/",(req,res)=>{
    let un = req.body.un
    let pwd = req.body.pwd
    if(un === "Admin12" && pwd === "azax123" ){
        res.sendFile(__dirname+"/ad_page.html")
    }
    else{
        res.send("Try Again")
    }

})

module.exports = ad_login