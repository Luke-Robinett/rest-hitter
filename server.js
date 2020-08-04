const express = require("express");
const PORT = 3000;
const app = express();

app.use(express.static("./"));

app.get("/", (req, res) => res.sendFile("./index.html"));

app.listen(3000, error => {
    if (error)
        return console.error(error);
    console.log(`Listening on port ${PORT}`);
});