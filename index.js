const express = require("express");
const cors = require("cors");
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const app = express();
const port = 3000

const saltRounds = 10
const secretKey = "aydin is cool";

const users = []
app.use(express.json())

app.get('/hello', async(req,res) => {
    res.send("Hello from Aydin")
})

app.post("/register", async(req, res) => {
    const {email, pwd} = req.body
    const hashedPwd = await bcrypt.hash(pwd, saltRounds)
    users.push({email, pwd:hashedPwd})
    res.status(201).send({message: `Registered successfully!${email}${hashedPwd}`})
})
app.post("/login", async(req, res) => {
    const {email, pwd} = req.body
    const user = users.find(u => u.email === email)
    if (!user) return res.status(404).send({message: "User not found"})
    const isValid = await bcrypt.compare(pwd, user.pwd)
    if (!isValid) return res.status(401).send({message: "Invalid password"})
    const token = jwt.sign({id: users.indexOf(user), email}, secretKey, {expiresIn: "1h"})
    res.send(token)
})

// middleware function for priviledged acces
function authenticateToken (req, res, next) {
    const authHeader = req.headers["author"]

    const token = authHeader
    if (token == null) return res.sendStatus(401)
    jwt.verify(token, secretKey, (err, user) => {
        if (err) return res.sendStatus(403)
        req.user = user
        // next()
        })
}
app.get("/protected", authenticateToken, (req, res) => {
    res.send("Protected route")
})

app.listen(port, () => {
    console.log("your server is running")
})

