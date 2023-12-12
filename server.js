const http = require("http");
const fs = require('fs');
const path = require("path");
const express = require("express");
const fetch = require('node-fetch');
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
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
    } 
}

app.post("/viewCard", async (request, response) => { 
    var email = request.body.email;
    var name;
    var recipientName;
    var message;
    var cardMessage;
    var image;

    const cursor = client.db(dbName).collection(collectionName).find({email: email});
    const result = await cursor.toArray();
    let res = result[0]

    if (res === undefined) {
        alert("Email not found");
    } else {
        name = res.name;
        recipientName = res.recipientName;
        message = res.message;
        cardMessage = res.cardMessage;
        image = res.image;
    }
    try {
        if (image === "holiday1") {
            image = "https://images.unsplash.com/photo-1482517967863-00e15c9b44be?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";
        } else if (image === "holiday2") {
            image = "https://images.unsplash.com/photo-1519751138087-5bf79df62d5b?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";
        } else {
            image = "https://images.unsplash.com/photo-1530196606945-81ab3df90d91?q=80&w=1948&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";
        }
        const backgroundImage = image;

        if (message === "happyHolidays") {
            message = "Happiest Holidays and a Wonderful New Year!";
        } else if (message == "merryChristmas") {
            message = "Merry Christmas!";
        } else {
            message = "Season's Greetings to You and Yours!";
        }

        //aText: "Dear recipient,"
        const aText = `Dear ${recipientName},`;
        const aColor = 'white';
        const aFontFamily = 'Playfair Display';
        const aFontSize = '80';
        const aTextAlign = 'left';
        const aTop = '400';
    
        //bText: message
        const bText = message;
        const bWidth = '1500';
        const bColor = 'white';
        const bFontFamily = 'Poppins';
        const bFontWeight = '800';
        const bFontSize = '150';
        const bTextAlign = 'center';

        //cText: Personalized message
        const cText = cardMessage;
        const cColor = 'white';
        const cFontFamily = 'Poppins';
        const cFontSize = '100';
        const cTextAlign = 'center';
        const cOriginY = 'top';
        const cTop = '1700';

        //dText: "From, name"
        const dText = `From, ${name}`;
        const dColor = 'white';
        const dFontFamily = 'Playfair Display';
        const dFontSize = '80';
        const dTextAlign = 'right';
        const dOriginY = 'top';
        const dTop = '2100';

        const apiUrl = `https://img.bruzu.com/?backgroundImage=${backgroundImage}`
        + `&a.text=${aText}&a.color=${aColor}&a.fontFamily=${aFontFamily}&a.fontSize=${aFontSize}&a.textAlign=${aTextAlign}&a.top=${aTop}`
        + `&b.text=${bText}&b.width=${bWidth}&b.textAlign=${bTextAlign}&b.color=${bColor}&b.fontFamily=${bFontFamily}&b.fontSize=${bFontSize}&b.fontWeight=${bFontWeight}`
        + `&c.text=${cText}&c.color=${cColor}&c.fontFamily=${cFontFamily}&c.fontSize=${cFontSize}&c.textAlign=${cTextAlign}&c.top=${cTop}&c.originY=${cOriginY}`
        + `&d.text=${dText}&d.color=${dColor}&d.fontFamily=${dFontFamily}&d.fontSize=${dFontSize}&d.textAlign=${dTextAlign}&d.top=${dTop}&d.originY=${dOriginY}`
        + `&width=2400&height=2400`;

        const apiResponse = await fetch(apiUrl);
        const imageBuffer = await apiResponse.buffer();

        // Convert the image buffer to a base64 string
        const imageBase64 = imageBuffer.toString('base64');
        
        // Construct an HTML string with an image tag and a link to the home page
        const htmlContent = `
            <div style="display: flex; justify-content: center; align-items: center; height: 100vh;">
                <div style="text-align: center;">
                    <img src="data:image/png;base64,${imageBase64}" alt="Card Image" width="750" height="750" />
                    <br><br>
                    <a href="/">Back to Home</a>
                    <br><br>
                </div>
            </div>
        `;

        response.send(htmlContent);
        
    } catch (error) {
        console.error('Error fetching data from Bruzu API:', error);
        response.status(500).json({ error: 'Internal server error' });
    }
});


app.listen(port);