// // Import express
// let express = require('express');
// // Import Body parser
// let bodyParser = require('body-parser');
// // Import Mongoose
// let mongoose = require('mongoose');
// // Initialize the app
// let app = express();

// // Import routes
// let apiRoutes = require("../api-routes");
// // Configure bodyparser to handle post requests
// app.use(bodyParser.urlencoded({
//     extended: true
// }));
// app.use(bodyParser.json());

// // Connect to Mongoose and set connection variable
// mongoose.connect('mongodb://XXXX:XXXX@cluster0-shard-00-00-ov74c.mongodb.net:27017,cluster0-shard-00-01-ov74c.mongodb.net:27017,cluster0-shard-00-02-ov74c.mongodb.net:27017/test?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin&retryWrites=true&w=majority', {useNewUrlParser: true})
//     .then(()=>console.log("DB server connect"))
//     .catch(e => console.log("DB error", e));


// var db = mongoose.connection;

// // Added check for DB connection

// if(!db)
//     console.log("Error connecting db")
// else
//     console.log("Db connected successfully")

// // Setup server port
// var port = process.env.PORT || 8080;

// // Send message for default URL
// app.get('/', (req, res) => res.send('Hello World with Express'));

// // Use Api routes in the App
// app.use('/api', apiRoutes);
// // Launch app to listen to specified port
// app.listen(port, function () {
//     console.log("Running RestHub on port " + port);
// });
// const { MongoClient } = require('mongodb');
// const uri = "mongodb+srv://juanpi:40592251@cluster0.cnxib.mongodb.net/Cluster0?retryWrites=true&w=majority";
// const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
// client.connect(err => {
//   const collection = client.db("test").collection("devices");
//   // perform actions on the collection object
//   client.close();
// });

const {MongoClient} = require('mongodb');

async function main(){
    /**
     * Connection URI. Update <username>, <password>, and <your-cluster-url> to reflect your cluster.
     * See https://docs.mongodb.com/ecosystem/drivers/node/ for more details
     */
    
    const uri = "mongodb+srv://admin:jDCxN4CS1WApc5m1@cluster0.jebzx.mongodb.net";
    const uri2 = "mongodb+srv://juanpi:40592251@cluster0.cnxib.mongodb.net/Cluster0?retryWrites=true&w=majority";
    
    const client = new MongoClient(uri);
 
    try {
        // Connect to the MongoDB cluster
        await client.connect();
 
        // Make the appropriate DB calls
        await  listDatabases(client);
 
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
}

async function listDatabases(client){
    databasesList = await client.db().admin().listDatabases();
 
    console.log("Databases:");
    databasesList.databases.forEach(db => console.log(` - ${db.name}`));
};

main().catch(console.error);