const express = require('express');
const { MongoClient } = require('mongodb');
const eventsRoutes = require('./routes/events');

const app = express();
const url = 'mongodb://localhost:27017';
const dbName = 'eventsDB';

let db;

// Middleware
app.use(express.json());

// Connect ->  MongoDB
(async function connectDB() {
  try {
    const client = await MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });
    db = client.db(dbName);
    console.log('CONNECTED TO mongoDB . . . . . .');

    // Use routes
    app.use(eventsRoutes(db));

    // Start server
    app.listen(3000, () => {
      console.log(`SERVER RUNNING ON PORT 3000 XD | > > > > > > > >`);
    });
  } catch (err) {
    console.error('Error connecting to MongoDB:', err);
  }
})();
