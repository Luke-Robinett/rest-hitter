const express = require("express");
const { json } = require("express");
const PORT = 3000;
const app = express();

app.use(express.static("./"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => res.sendFile("./index.html"));
app.post("/", (req, res) => {
    console.log(JSON.stringify(req.body));
    res.json(req.body);
});

app.listen(3000, error => {
    if (error)
        return console.error(error);
    console.log(`Listening on port ${PORT}`);
});