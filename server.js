const http = require("http");
const fs = require('fs');
const path = require("path");
const express = require("express");
const fetch = require('node-fetch');
const app = express(); 
const bodyParser = require("body-parser");
const port = 4000;
require("dotenv").config({ path: path.resolve(__dirname, '.env') })

process.stdin.setEncoding("utf8");
console.log(`Web server is running at http://localhost:${port}`);
const prompt = "Type stop to shutdown the server: ";
process.stdout.write(prompt);
process.stdin.on("readable", function () {
  let dataInput = process.stdin.read();
  if (dataInput !== null) {
    let command = dataInput.trim();
    if (command === "stop") {
      console.log("Shutting down the server");
      process.exit(0)
    }
    process.stdout.write(prompt);
    process.stdin.resume();
  }
});

// MongoDB stuff
const userName = process.env.MONGO_DB_USERNAME;
const password = process.env.MONGO_DB_PASSWORD;
const dbName = process.env.MONGO_DB_NAME;
const collectionName = process.env.MONGO_COLLECTION;

const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${userName}:${password}@cluster0.c5oudhu.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

// API stuff
const apiBaseURL = "https://img.bruzu.com/";

// create an express app
app.use(express.static(path.join(__dirname, "")));

app.get('/', (request, response) => {
    response.sendFile('index.html', { root: __dirname });
});

app.get('/createCard', (request, response) => {
    response.sendFile('createCard.html', { root: __dirname });
});

app.get('/viewCard', (request, response) => {
    response.sendFile('viewCardForm.html', { root: __dirname });
});

app.use(bodyParser.urlencoded({extended:false}));

app.post('/generateCard', async (request, response) => {
    await submitForm(request, response);
    let {name, email, recipientName, image, message, cardMessage} = request.body;
    const variables = {
        name:name,
        email:email,
        recipientName:recipientName,
        message:message,
        cardMessage:cardMessage,
        image:image
    }
    insertapplications(client, dbName, collectionName, variables);
    response.sendFile('index.html', { root: __dirname });
});

async function insertapplications(client, dbName, collectionName, newapplication) {
    const result = await client.db(dbName).collection(collectionName).insertOne(newapplication);
}

async function submitForm(request, response) {
    const form = request.body;
    try {
        await client.connect();
        const database = client.db(dbName);
        const collection = database.collection(collectionName);
        const result = await collection.insertOne(form);
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
}

/*app.post('/viewCards', async (request, response) => {
    let result = await getOneForm(request, response);
    //const { name, email, recipientName, message, cardMessage } = result;
    await logMovies();
    fetch(apiBaseURL + "?backgroundImage=https://source.unsplash.com/U-Kty6HxcQc/500x500")
        .then(response => response.json())
        .then(data => {
            let characterName = data.name;
            response.render("reviewCharacter", { name, age, charNum, characterName });
        }) 
}); */

async function getOneForm(request, response) {
    let filter = {name: request.body.name};
    try {
        await client.connect();
        const database = client.db(dbName);
        const collection = database.collection(collectionName);
        const result = await collection.findOne(filter);
        return result;
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
}

app.listen(port);