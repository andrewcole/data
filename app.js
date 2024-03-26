import express from "express";
import jsonGraphqlExpress from 'json-graphql-server';
import * as fs from 'fs';


const app = express();
const hostname = "0.0.0.0";
const port = 39919;
const rpt = 

app.get("/.well-known/teapot", (req, res) => {
    // HTTP I'm a teapot
    res.status(418).send("I'm a teapot");
});

["rptlog","galog"].forEach(element => {
    console.log(`Serving graphql from ./json/${element}.json at /.well-known/graphql/${element}`);
    app.use(`/.well-known/graphql/${element}`, jsonGraphqlExpress.default(JSON.parse(fs.readFileSync(`./json/${element}.json`))));
});

["html"].forEach(element => {
    console.log(`Serving static files from ./${element} at /`);
    app.use(express.static(`./${element}`));
});

app.listen(port, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});