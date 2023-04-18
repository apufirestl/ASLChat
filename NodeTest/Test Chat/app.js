const Chat = require("../models/chatschema.js");
const connect = require("../dbConnect.js");

const bodyParser = require("body-parser");
const chatRouter = require("./route/chatroute");

//bodyparser middleware
app.use(bodyParser.json());

//routes
app.use("/Chats", chatRouter);

//Require the express moule
const express = require("express");

//create a new express application
const app = express()

//require the http module
const http = require("http").Server(app)

// require the socket.io module
const io = require("socket.io");

const port = 500;

const socket = io(http);
//create an event listener

//To listen to messages
socket.on("connection", (socket) => {
    console.log("user connected");
});

//wire up the server to listen to our port 500
http.listen(port, () => {
    console.log("connected to port: "+ port)
});


socket.on("chat message", function (msg) {
    console.log("message: " + msg);
    //broadcast message to everyone in port:5000 except yourself.
    socket.broadcast.emit("received", { message: msg });
});


//setup event listener
socket.on("connection", socket => {
    console.log("user connected");
    socket.on("disconnect", function () {
        console.log("user disconnected");
    });
    socket.on("chat message", function (msg) {
        console.log("message: " + msg);
        //broadcast message to everyone in port:5000 except yourself.
        socket.broadcast.emit("received", { message: msg });

        //save chat to the database
        connect.then(db => {
            console.log("connected correctly to the server");

            let chatMessage = new Chat({ message: msg, sender: "Anonymous" });
            chatMessage.save();
        });
    });
});


const connectdb = require("../dbConnect.js");;
const Chats = require("../models/chatschema.js");

const router = express.Router();

router.route("/").get((req, res, next) => {
    res.setHeader("Content-Type", "application/json");
    res.statusCode = 200;
    connectdb.then(db => {
        Chats.find({}).then(chat => {
            res.json(chat);
        });
    });
});

module.exports = router;