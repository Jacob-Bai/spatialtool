const express = require('express');
const routes = require('./routes/index.js');

const app = express();
app.use(express.json());
app.use('/', routes);

const db = require("./models/index.js");
db.sequelize.authenticate().then(() => {
    console.log('Connection has been established successfully.');
  }).catch(err => {
    console.log('Unable to connect to the database:', err);
  });

db.sequelize.sync()
  .then(() => {
    console.log("Connected and Synced db.");
  })
  .catch((err) => {
    console.log("Failed to sync db: " + err.message);
  });

const port = process.env.API_PORT||5001;
app.listen(port, () => {
  console.log(`Listening on port ${port}`)
});
