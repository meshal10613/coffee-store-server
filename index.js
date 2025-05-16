const express = require("express");
const cors = require("cors");
const app = express();
require('dotenv').config();
const port = process.env.port || 3000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@meshal10613.mbbtx0s.mongodb.net/?retryWrites=true&w=majority&appName=meshal10613`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

app.get("/", (req, res) => {
    res.send("Coffee Server is Running.....");
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();

        const coffeesCollection = client.db("coffeeDB").collection("coffees");
        const usersCollection = client.db("coffeeDB").collection("users");

        app.get("/coffees", async(req, res) => {
            const cursor = coffeesCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        });

        app.get("/coffees/:id", async(req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await coffeesCollection.findOne(query);
            res.send(result);
        })

        app.post("/coffees", async(req, res) => {
            const newCoffee = req.body;
            const result = await coffeesCollection.insertOne(newCoffee);
            res.send(result); 
        });

        app.put("/coffees/:id", async(req, res) => {
            const id = req.params.id;
            const updatedCoffee = req.body;
            const filter = { _id: new ObjectId(id) };
            const updatedDoc = {
                $set: updatedCoffee
            };
            const options = {upsert: true};
            const result = await coffeesCollection.updateOne(filter, updatedDoc, options);
            res.send(result);
        })

        app.delete("/coffees/:id", async(req, res) => {
            const id = req.params.id;
            const query = {_id: new ObjectId(id)};
            const result = await coffeesCollection.deleteOne(query);
            res.send(result);
        });

        //User related APIs
        app.get("/users", async(req, res) => {
            const result = await usersCollection.find().toArray();
            res.send(result);
        })

        app.post("/users", async(req, res) => {
            const newUser = req.body;
            const result = await usersCollection.insertOne(newUser);
            res.send(result)
        })

        app.patch("/users", async(req, res) => {
            const {email, lastSignInTime} = req.body;
            const filter = {email: email};
            const updatedDoc = {
                $set: {
                    lastSignInTime: lastSignInTime
                }
            };
            const result = await usersCollection.updateOne(filter, updatedDoc);
            res.send(result);
        }) 

        app.delete("/users/:id", async(req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await usersCollection.deleteOne(query);
            res.send(result);
        })

        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
    }
}
run().catch(console.dir);

app.listen(port, () => {
    console.log(`Coffee Server is Running on port ${port}`);
});
