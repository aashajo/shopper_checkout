const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");

const url = require('url');
const querystring = require('querystring');
const app = express();


app.set("views", path.join(__dirname, "app/view"));
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

const serverRouter = require("./app/route/route");

app.get('/checkout/:TOTALAMOUNT', serverRouter);
app.post('/checkout/:TOTALAMOUNT', serverRouter);
app.post('/payments', serverRouter);


app.get('/', serverRouter);

app.listen(5000)