import fs from "fs";
import { parse } from "csv-parse";
import { fileURLToPath } from 'url'
import path from 'path';

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

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
  } = {
    gaFlights: [],
    rptTrips: [],
    rptFlights: [],
    routes: [],
    airports: [],
    timeZones: [],
    cities: [],
    countries: [],
  };

fs.createReadStream("./src/openflights.org/airports.csv")
    .pipe(parse({ delimiter: ",", from_line: 2 }))
    .on("data", function (row) {
        console.log(`🛫  Importing airport ${row[1]}`)
        data.airports.push({
            id: Buffer.from(`airport: ${row[5]}`).toString('base64'),
            name: row[1],
            city: Buffer.from(`city: ${row[2]}, ${row[3]}`).toString('base64'),
            iata: row[4] == "\\N" ? null : row[4],
            icao: row[5],
            latitude: parseFloat(row[6]),
            longitude: parseFloat(row[7]),
            altitude: row[9] == "\\N" ? null : parseInt(row[9]),
            timeZone: Buffer.from(`timeZone: ${row[11]}`).toString('base64'),
        })

        if (!data.cities.find(city => city.id === Buffer.from(`city: ${row[2]}, ${row[3]}`).toString('base64'))) {
            console.log(`🏢  Importing city ${row[2]}, ${row[3]}`)
            data.cities.push({
                id: Buffer.from(`city: ${row[2]}, ${row[3]}`).toString('base64'),
                name: row[2],
                country: Buffer.from(`country: ${row[3]}`).toString('base64'),
            })
        }

        if (!data.countries.find(country => country.id === Buffer.from(`country: ${row[3]}`).toString('base64'))) {
            console.log(`🚩  Importing country ${row[3]}`)
            data.countries.push({
                id: Buffer.from(`country: ${row[3]}`).toString('base64'),
                name: row[3],
            })
        }

        if (!data.timeZones.find(timeZone => timeZone.id === Buffer.from(`timeZone: ${row[11]}`).toString('base64'))) {
            console.log(`🕝  Importing timeZone ${row[11]}`)
            data.timeZones.push({
                id: Buffer.from(`timeZone: ${row[11]}`).toString('base64'),
                name: row[11]
            })
        }
    })
    .on("end", function () {
        fs.createReadStream("./src/coley.au/rptlog.csv")
            .pipe(parse({ delimiter: ",", from_line: 2 }))
            .on("data", function (row) {
                console.log(`✈️  Importing RPT flight ${row[3]} ${row[1]}`)
                data.rptFlights.push({
                    id: Buffer.from(`rptFlight: ${row[3]}`).toString('base64'),
                    rptTrip: Buffer.from(`rptTrip: ${row[0]}`).toString('base64'),
                    flight: row[1],
                    route: Buffer.from(`route: ${row[2]}`).toString('base64'),
                    departure: row[3],
                    arrival: row[4],
                    registration: row[10],
                    type: row[11],
                })

                if (!data.rptTrips.find(trip => trip.id === Buffer.from(`rptTrip: ${row[0]}`).toString('base64'))) {
                    console.log(`🛫  Importing RPT trip ${row[0]}`)
                    data.rptTrips.push({
                        id: Buffer.from(`rptTrip: ${row[0]}`).toString('base64'),
                        name: row[0],
                    })
                }

                if (!data.routes.find(route => route.id === Buffer.from(`route: ${row[2]}`).toString('base64'))) {
                    console.log(`🛫  Importing route ${row[2]}`)
                    data.routes.push({
                        id: Buffer.from(`route: ${row[2]}`).toString('base64'),
                        airports: [
                            data.airports.find(airport => airport.iata === row[2].split("-")[0])?.id,
                            data.airports.find(airport => airport.iata === row[2].split("-")[1])?.id
                        ]
                    })
                }
            })
            .on("end", function () {
                
                fs.createReadStream("./src/coley.au/galog.csv")
                    .pipe(parse({ delimiter: ",", from_line: 2 }))
                    .on("data", function (row) {
                        console.log(`✈️  Importing GA flight ${row[0]} ${row[3]} ${row[5]}`)
                        data.gaFlights.push({
                            id: Buffer.from(`gaFlight: ${row[0]}${row[3]}${row[5]}`).toString('base64'),
                            date: row[0],
                            type: row[1],
                            reg: row[2],
                            pic: row[3],
                            crew: row[4],
                            route: row[5],
                            details: row[6],
                            blog_link: row[8],
                            photos_link: row[9],
                            singleengine_dual: row[7] == "\\N" ? null : parseFloat(row[7]),
                            singleengine_command: row[10] == "\\N" ? null : parseFloat(row[10]),
                            instrument_simulator: row[11] == "\\N" ? null : parseFloat(row[11])
                        })
                      })
                    .on("end", function () {
                        const dataJSON = JSON.stringify(data);

                        fs.writeFileSync(`${__dirname}/data.json`, dataJSON);

                        console.log(`🛫  Imported ${data.airports.length} airports`);
                        console.log(`🏢  Imported ${data.cities.length} cities`);
                        console.log(`🚩  Imported ${data.countries.length} countries`);
                        console.log(`🕝  Imported ${data.timeZones.length} timeZones`);
                        console.log(`✈️  Imported ${data.rptFlights.length} RPT flights`);
                        console.log(`🛫  Imported ${data.rptTrips.length} RPT trips`);
                        console.log(`🛫  Imported ${data.routes.length} routes`);
                        console.log(`🛫  Imported ${data.gaFlights.length} GA flights`);
                    })
              })
    });
