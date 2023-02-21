const express = require('express');
const app = express();
const http = require("http").Server(app);

const port = 5000;

var comptes = new Map();

app.use(express.static(__dirname, ""));

app.get('/', function (req, res) {
    res.sendFile(__dirname + "/question-1.html");
});

http.listen(port, () => {
    console.log(`Now listening on port ${port}`);
});
