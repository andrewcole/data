import express from "express";
import jsonGraphqlExpress from 'json-graphql-server';
import * as fs from 'fs';


const app = express();
const hostname = "0.0.0.0";
const port = 39919;

app.get("/.well-known/teapot", (req, res) => {
    res.status(418).send("I'm a teapot");
});

var files = fs.readdirSync('./json').filter(fn => fn.endsWith('.json'));
files.forEach(element => {
    console.log(`Serving graphql from ./json/${element} at /.well-known/graphql/${element.replace(/.json$/,'')}`);
    app.use(`/.well-known/graphql/${element.replace(/.json$/,'')}`, jsonGraphqlExpress.default(JSON.parse(fs.readFileSync(`./json/${element}`))));
});

["html"].forEach(element => {
    console.log(`Serving static files from ./${element} at /`);
    app.use(express.static(`./${element}`));
});

app.listen(port, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});