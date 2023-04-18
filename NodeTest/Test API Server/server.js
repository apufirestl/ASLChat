//Initiallising node modules

var sql = require("mssql");
var app = express();

// Setting Base directory
app.use(bodyParser.json());

const bodyParser = require("body-parser");
const MongoClient = require("mongodb").MongoClient;
const ObjectId = require("mongodb").ObjectID;
const CONNECTION_URL = "mongodb://localhost:27017/?serverSelectionTimeoutMS=5000&connectTimeoutMS=10000&3t.uriVersion=3&3t.connection.name=Mongo+test";
const DATABASE_NAME = "UserLogin";

const express = require("express");
var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
var database, collection;

app.listen(5000, () => {
    MongoClient.connect(CONNECTION_URL, { useNewUrlParser: true }, (error, client) => {
        if (error) {
            throw error;
        }
        database = client.db(DATABASE_NAME);
        collection = database.collection("user");
        console.log("Connected to `" + DATABASE_NAME + "`!");
    });
});
// const express = require("express");
// const app = express();

// var server=app.listen(process.env.PORT || 8080, function () {
// var port = server.address().port;
// console.log("App now running on port", port);
// });



app.get('/api', function (req, res) {
    console.log("get request");
    collection.find({}).toArray(function (err, result) {

        if (err) throw err;
        // console.log(result);	
        res.send(result);

    });
});

app.get('/api/get', function (req, res) {
    console.log("get request");
    var myquery = { "name": 'Tuna' };
    collection.find(myquery).toArray(function (error, result) {

        if (error) throw error;
        // console.log(result);	
        res.send(result);

    });
});


app.post("/api/user", (request, response) => {
    console.log("post request");
    var myobj = { "name": "Mofiz", "password": "123" };
    collection.insert(myobj, (error, result) => {
        if (error) {
            return response.status(500).send(error);
        }
        response.send("Inserted Succesfully" + myobj);

    });
});

app.delete("/api/delete", (request, response) => {
    console.log("Delete request");
    var myquery = { "name": 'Tuna' };
    collection.deleteOne(myquery, function (error, obj) {
        if (error) {
            return response.status(500).send(error);
        }
        response.send("Deleted Succesfully");

    });


});

app.put("/api/update", (request, response) => {
    console.log("Update request");
    var myquery = { "name": "Jumon" };
    var newvalues = { $set: { "password": "123456789" } };
    collection.updateOne(myquery, newvalues, function (error, result) {
        if (error) {
            return response.send(error);
        }
        response.send("Updated Succesfully");
    });

});



//CORS Middleware
app.use(function (req, res, next) {
    //Enabling CORS 
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, contentType,Content-Type, Accept, Authorization");
    next();
});

//Setting up server
var server = app.listen(process.env.PORT || 8080, function () {
    var port = server.address().port;
    console.log("App now running on port", port);
});

//Initiallising connection string
var dbConfig = {
    user: 'sa',
    password: 'zseertsdfApu2017',
    server: 'localhost',
    database: 'UserLogin'
};

//Function to connect to database and execute query
function executeQuery(res, query) {
    sql.connect(dbConfig, function (err) {
        if (err) {
            console.log("Error while connecting database :- " + err);
            res.send(err);
        }
        else {
            // create Request object
            var request = new sql.Request();
            // query to the database
            request.query(query, function (err, res) {
                if (err) {
                    console.log("Error while querying database :- " + err);
                    res.send(err);
                }
                else {
                    res.send(res);
                }
            });
        }
    });
}

//GET API
app.get("/api/user ", function (req, res) {
    var query = "select * from [user]";
    executeQuery(res, query);
});

//POST API
app.post("/api/user ", function (req, res) {
    var query = "INSERT INTO [user] (Name,Email,Password) VALUES (req.body.Name,req.body.Email,req.body.Password)";
    executeQuery(res, query);
});

//PUT API
app.put("/api/user/:id", function (req, res) {
    var query = "UPDATE [user] SET Name= " + req.body.Name + " , Email=  " + req.body.Email + "  WHERE Id= " + req.params.id;
    executeQuery(res, query);
});

// DELETE API
app.delete("/api/user /:id", function (req, res) {
    var query = "DELETE FROM [user] WHERE Id=" + req.params.id;
    executeQuery(res, query);
});
