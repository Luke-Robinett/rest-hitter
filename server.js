const express = require("express");
const axios = require("axios");
const https = require("https");
const path = require("path");
const { Agent } = require("http");
const PORT = process.env.PORT || 3000;
const app = express();

app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve the html page
app.get("/", (req, res) => res.sendFile(path.join(__dirname, "public", "index.html")));

// API POST route
app.post("/api", (req, res) => {
    const { method, endpoint, body, username, password } = req.body;

    // Configure the API request
    let axiosParams = {
        method: method,
        url: encodeURI(endpoint)
    };

    if (process.env.NODE_ENV === "development") {
        axiosParams.httpsAgent = new https.Agent({
            rejectUnauthorized: false,
        });
    }

    if (username.lenth > 0 && password.lenth > 0) {
        axiosParams.auth = {
            username: username,
            password: password
        };
    }

    if (body.lenth > 0) {
        axiosParams.data = JSON.parse(body);
    }

    // Make the API call
    axios(axiosParams)
        .then(response => {
            console.log(response.data);
            res.json(response.data).status(200);
        })
        .catch(error => {
            console.error(error);
            res.json(error).status(500);
        });
});

app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
