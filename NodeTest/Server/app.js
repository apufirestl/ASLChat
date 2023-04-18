const BodyParser = require("body-parser");
const MongoClient = require("mongodb").MongoClient;
const ObjectId = require("mongodb").ObjectID;
const CONNECTION_URL = "mongodb://localhost:27017/?serverSelectionTimeoutMS=5000&connectTimeoutMS=10000&3t.uriVersion=3&3t.connection.name=Mongo+test";
const DATABASE_NAME = "UserLogin";
var database, collection;

const express = require("express");
var app = express();
app.use(BodyParser.json());
app.use(BodyParser.urlencoded({ extended: true }));

//app.use(express.static(__dirname));
app.use(express.static(__dirname + "../HTML"));
var cors = require('cors');
app.use(cors());

//app.listen(5000, () => {
//    MongoClient.connect(CONNECTION_URL, { useNewUrlParser: true }, (error, client) => {
//        if (error) {
//            throw error;
//        }
//        database = client.db(DATABASE_NAME);
//        collection = database.collection("user");
//        console.log("Connected to `" + DATABASE_NAME + "`!");
//    });
//});




//try catch
try {
    // config for your database
    app.listen(5000, () => {
        MongoClient.connect(CONNECTION_URL, { useNewUrlParser: true }, (error, client) => {
            if (error) {
                throw error;
            }
            database = client.db(DATABASE_NAME);
            //collection = database.collection("user");
            console.log("Connected to `" + DATABASE_NAME + "`!");
        });
    });

    // getting all users registered
    app.get('/allUser', function (req, res) {

        console.log("get request");
        collection = database.collection("user");
        collection.find({}, { '_id': 0, 'name': 1 }).toArray(function (err, result) {

            if (err) throw err;
             console.log(result);	
            res.send(result);

        });
    });
    //----------------------------------- 

    // getting all users' profile using Name registered
    app.get('/userName=:usrNm', function (req, res) {


        // connect to your database
        collection = database.collection("UserProfile");
        var query = { "name": req.params.usrNm };
        collection.find(query).toArray(function (err, result) {

            if (err) throw err;
            // console.log(result);	
            res.send(result);
            

        });
    });
    //-----------------------------------



    // getting all details about user using his/her email address
    app.get('/user=:email', function (req, res) {


        // connect to your database

        collection = database.collection("user");

        collection = database.collection("user");
        collection.find({ "email": req.params.email }).toArray(function (err, result) {

            if (err) throw err;
            // console.log(result);	
            res.send(result);

        });

    });
    //-----------------------------------
    // posting user updated information
    app.post('/addr=:addr,mob=:mob,dob=:dob,mail=:mail,usr=:usr', function (req, res) {
        collection = database.collection("UserProfile");
        var myquery = { "name": req.params.usr };
        var newvalues = { $set: { "address": req.params.addr, "mobileNo": req.params.mob, "DOB": req.params.dob, "email": req.params.mail } };
        collection.updateOne(myquery, newvalues, function (err, result) {
            if (err) throw err;
            res.send(result);
        });
    });

    // posting user login status with token
    app.post('/u=:user,t=:token,s=:status', function (req, res) {

        var t = new Date();
        var time = t.getHours() + ":" + t.getMinutes() + ":" + t.getSeconds();
        collection = database.collection("Token");
        collection.insert({ "Token": req.params.token, "UserMail": req.params.user, "TokInTime": time, "loggedInStatus": req.params.status }, function (err, result) {

            if (err) throw err;
            res.send(result);

        });
    });

        //--------------------------------------------------
        var server = app.listen(1234, function () {
            console.log("the server is started and running with the port " + server.address().port);
        });
    }
catch (e) {
    console.log(e.message);
}








