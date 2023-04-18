var express = require("express");
var app = new express();
var http = require("http").Server(app);
var io = require("socket.io")(http);
var cors = require('cors');
var lineReader = require('line-reader');
var rl = require('readline-specific');
var readLastLines = require('read-last-lines');
var fs = require("fs");
app.use(cors());

var typing = false;
var timeout = undefined;
var user;

var Log = require('log'),
    log = new Log('debug');

var port = process.env.PORT || 43673;

app.use(express.static(__dirname + "../HTML"));
const MongoClient = require("mongodb").MongoClient;
const ObjectId = require("mongodb").ObjectID;
const CONNECTION_URL = "mongodb://localhost:27017/?serverSelectionTimeoutMS=5000&connectTimeoutMS=10000&3t.uriVersion=3&3t.connection.name=Mongo+test";
const DATABASE_NAME = "UserLogin";
var database, collection;


//global array for storing userSok jsons
var userSokArray = [];
//global array for storing userSok jsons

    MongoClient.connect(CONNECTION_URL, { useNewUrlParser: true }, (error, client) => {
        if (error) {
            throw error;
        }
        database = client.db(DATABASE_NAME);
        //collection = database.collection("user");
        console.log("Connected to `" + DATABASE_NAME + "`!");
    });

    io.sockets.on('connection', function (socket) {

        //let chat = database.collection("message");

        //function for sending online users' array
        function onlineUsers() {
            io.emit('onlineUsers', userSokArray);
        }
        //function for sending online users' array

        //socket disconnect part
        socket.on('disconnect', function () {
            userSokArray.forEach(itemInArray);

            function itemInArray(item, index) {
                if (socket.id === item.slice(item.indexOf('withSocket') + 10)) {
                    userSokArray.splice(index, 1);
                    //sending online users' array to the client
                    onlineUsers();
                    //sending online users' array to the client
                    console.log('the ID ' + item + ' has been removed from the connection!');
                    //the status of the connection array
                    console.log('the connected client list is: ' + userSokArray);
                    //the status of the connection array
                }
            }

        });
        //socket disconnect part

        //pushing user-socket bindings to the array
        socket.on('usrSocketId', function (data) {
            userSokArray.push(data);
            //sending online users' array to the client
            onlineUsers();
            //sending online users' array to the client
            console.log('A new connection has the socket ID ' + data);
            //the status of the connection array
            console.log('the connected client list is: ' + userSokArray);
            //the status of the connection array
        });
        //pushing user-socket bindings to the array


        //chat data or user msg
        socket.on('sentMsg', function (data) {           


            //if sender and receiver is same then history will be saved just once
            if (data.slice(data.indexOf('userDT:') + 7, (data.indexOf('msgDT:') - 1)) == data.slice(data.indexOf('sentToDT:') + 9, (data.indexOf('fileDtAs:') - 1))) {


                var string = "History-" + data.slice(data.indexOf('userDT:') + 7, (data.indexOf('msgDT:') - 1)) + "";
                let chat = database.collection(string);

                chat.insert({ name: data }, function (error, result) {

                    if (error) throw err;
                    console.log("sender copy saved");

                });
            }
            else
            {
                var string = "History-" + data.slice(data.indexOf('userDT:') + 7, (data.indexOf('msgDT:') - 1)) + "";
                let chat = database.collection(string);

                chat.insert({ name: data }, function (error, result) {
                    if (error) throw err;
                  
                    console.log("sender copy saved");
                });

                var string2 = "History-" + data.slice(data.indexOf('sentToDT:') + 9, (data.indexOf('fileDtAs:') - 1)) + "";
                let chatS = database.collection(string2);

                chatS.insert({ name: data }, function (error, result) {

                    if (error) throw err;

                    console.log("receiver copy saved");

                });
            }
            //if sender and receiver is same then history will be saved just once

            //finally sending the data to the desired receiver
            userSokArray.forEach(itemInArray);

            function itemInArray(item, index) {
                //retrieving the socket id from the list
                var socketIDFrmDt = item.slice(item.indexOf('withSocket') + 10);
                var usrNameFrmDt = item.slice(0, item.indexOf('withSocket'));
                //retrieving the socket id from the list
                // selecting the socket id by comparing it from the received data
                if (usrNameFrmDt == data.slice(data.indexOf('sentToDT:') + 9, (data.indexOf('fileDtAs:') - 1))) {
                    io.to(socketIDFrmDt).compress(true).emit('sndToRcvr', data);
                    // selecting the socket id by comparing it from the received data
                    //acknowledgement in the console
                    console.log("the data has been successfully emitted to the receiver!!!");
                    //acknowledgement in the console

                }
                // selecting the socket id by comparing it from the received data

            }

            //finally sending the data to the desired receiver
        });

        var loadData = [];
        //logged in user's socket detect
        socket.on('userName', function (data) {
            ////Loading history after click            
            var j;
            //Loading history after click
            var string3 = "History-"+data+"";
            let load = database.collection(string3);
            load.find({}, { 'name': 1, '_id': 0 }).sort({ '_id': -1 }).limit(8).toArray(function (error, result) {
                if (error) {
                    throw error;
                }

                for (j = 0; j < result.length; j++) {
                    console.log(result[j].name);
                    loadData[j] = result[j].name;
                }
            });

            loadData.reverse().forEach(dataLinesDefine);

                    function dataLinesDefine(dataLine, index) {
                        io.sockets.emit('umhist' + data, dataLine);
                    }

        });
        
        var loadMoreData = [];

        //processing loadMore
        socket.on('childLoader', function (data) {

            console.log(data.slice(data.indexOf("has:") + 4));

                var string5 = "History-" + data.slice(0, data.indexOf("has:")) + "";
                let loadnew = database.collection(string5);

            loadnew.find({}, { 'name': 1, '_id': 0 }).sort({ '_id': -1 }).skip(parseInt(data.slice(data.indexOf("has:") + 4))).limit(8).toArray(function (error, result) {
            //loadnew.find({}, { 'name': 1, '_id': 0 }).sort({ '_id': 1 }).toArray(function (error, result) {

                    if (error) console.log(error); //handling error
                      
                for (var k = 0; k < result.length; k++) {
                    //console.log(result[index].name);
                    loadMoreData[k] = result[k].name;
                    console.log(result[k].name);
                }
            });



            loadMoreData.reverse().forEach(childEmitter);
            //loadMoreData.forEach(childEmitter);
                       function childEmitter(item, index) {                           
                            io.sockets.emit('umHistLoadMore' + data.slice(0, data.indexOf("has:")), item.slice(item.indexOf("userDT:")));
                       }

        });

     });
http.listen(port, function () {
    log.info('Server running on port number ', port);
});




