import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import express from 'express';
import http from 'http';
import cors from 'cors';

import fs from "fs";
import LatLon, { Dms } from 'geodesy/latlon-spherical.js';
import { fileURLToPath } from 'url'
import path from 'path';

import morgan from 'morgan';

interface MyContext {
  token?: string;
}

function getResult(array: any[], test: Function, cursor: string, limit: number) {
  const collection = array.filter(obj => test(obj))
  const myCursor = (cursor && collection.find(obj => obj.id === cursor)) ? collection.indexOf(collection.find(obj => obj.id === cursor)) : 0
  if (!limit) {
    limit = 10;
  }
  return {
    data: collection.slice(myCursor, myCursor + limit),
    cursor: collection[myCursor + limit] ? collection[myCursor + limit].id : null,
    count: collection.length
  }
}

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const typeDefs = fs.readFileSync(`${__dirname}/schema.graphql`).toString();

// Load data from JSON files
const data: {
  gaFlights: {
    id: string,
    date: string,
    type: string,
    reg: string,
    pic: string,
    crew: string,
    route: string,
    details: string,
    blog_link: string,
    photos_link: string,
    singleengine_dual: number,
    singleengine_command: number,
    instrument_simulator: number
  }[],
  rptTrips: {
    id: string,
    name: string
  }[],
  rptFlights: {
    id: string,
    rptTrip: string,
    flight: string,
    route: string,
    departure: string,
    arrival: string,
    registration: string,
    type: string
  }[],
  routes: {
    id: string,
    airports: string[],
  }[],
  airports: {
    id: string,
    name: string,
    city: string,
    iata: string,
    icao: string,
    latitude: number,
    longitude: number,
    altitude: number,
    timeZone: string
  }[],
  timeZones: {
    id: string,
    name: string
  }[],
  cities: {
    id: string,
    name: string,
    country: string
  }[],
  countries: {
    id: string,
    name: string
  }[],
} = JSON.parse(fs.readFileSync(`${__dirname}/data.json`).toString());

const resolvers = {
  Query: {
    gaFlights: (parent, { cursor, limit }, contextValue, info) => {
      return getResult(data.gaFlights, function(obj) { return true }, cursor, limit)
    },
    rptTrips: (parent, { search, cursor, limit }, contextValue, info) => {
      const filter = search ? new RegExp(search, 'i') : new RegExp('', 'i');
      return getResult(data.rptTrips, function(obj) { return filter.test(obj.name) }, cursor, limit)
    },
    rptFlights: (parent, { search, cursor, limit }, contextValue, info) => {
      const filter = search ? new RegExp(search, 'i') : new RegExp('', 'i');
      return getResult(data.rptFlights, function(obj) { return filter.test(obj.flight) }, cursor, limit)
    },
  },
  RPTTrip: {
    rptFlights: (parent, { cursor, limit }, contextValue, info) => {
      return getResult(data.rptFlights, function(obj) { return obj.rptTrip === parent.id }, cursor, limit)
    }
  },
  RPTFlight: {
    rptTrip: (rptFlight: { rptTrip: string; }) => data.rptTrips.find(rptTrip => rptTrip.id === rptFlight.rptTrip),
    route: (rptFlight: { route: string; }) => data.routes.find(route => route.id === rptFlight.route),
  },
  Route: {
    name: (route: { airports: string[]; }) => route.airports.map(airportId => data.airports.find(airport => airport.id === airportId).iata).join('-'),
    airports: (route: { airports: string[]; }) => route.airports.map(airportId => data.airports.find(airport => airport.id === airportId)),
    distance: (route: { airports: string[]; }) => {
      const origin = data.airports.find(airport => airport.id === route.airports[0]);
      const destination = data.airports.find(airport => airport.id === route.airports[route.airports.length - 1]);
      if (origin && destination) {
        // Calculate distance between origin and destination
        const distanceMetres = new LatLon(origin.latitude, origin.longitude).distanceTo(new LatLon(destination.latitude, destination.longitude));
        // Return the distance in kilometres to 2 decimal places
        return Math.round(distanceMetres / 1000 * 100) / 100;
      }
      else {
        return -1;
      }
    }
  },
  Airport: {
    city: (airport: { city: string; }) => data.cities.find(city => city.id === airport.city),
    timeZone: (airport: { timeZone: string; }) => data.timeZones.find(timezone => timezone.id === airport.timeZone),
  },
  City: {
    country: (city: { country: string; }) => data.countries.find(country => country.id === city.country),
  }
};

const app = express();
const httpServer = http.createServer(app);

const server = new ApolloServer<MyContext>({
  typeDefs,
  resolvers,
  plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
});

await server.start();

app.use(
  '/graphql',
  cors<cors.CorsRequest>(),
  express.json(),
  expressMiddleware(server, {
    context: async ({ req }) => ({ token: req.headers.token }),
  }),
);

app.use(
  '/static',
  express.static(`${__dirname}/static/`)
);

app.use(morgan('combined'));

app.get("/*", (req, res) => {
  res.sendFile(`${__dirname}/static/index.html`);
});

await new Promise<void>((resolve) => httpServer.listen({ port: 4000 }, resolve));
console.log(`🚀 Server ready at http://localhost:4000/`);