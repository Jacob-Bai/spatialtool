const express = require('express');
const routes = require('./routes/index.js');
const db = require("./models/index.js");
const managers = require('./managers/index.js'); 

db.sequelize.authenticate()
.then(() => {
    console.log('Connection has been established successfully.');
})
.catch(err => {
    console.log('Unable to connect to the database:' + err.message);
    process.exit(1);
});

managers.sessionManager.start();

const app = express();
const port = process.env.API_PORT||5001;
app.use(express.json());
app.use('/', routes);
app.listen(port, () => {
    console.log(`Listening on port ${port}`)
});
