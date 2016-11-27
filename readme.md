# Dreamlines Task

There are 2 nodejs applications in this repository.

 - [Server](server/readme.md)
 - [Loader](loader/readme.md)

## Demo Instructions

 - Please read readme files of both the Loader and Server applications.
 - Set a valid value for `MONGO_URL` in `server/devrun.sh` file `loader/devrun.sh` files
 - From the `server` directory, install dependencies and start the server `npm i && sh devrun.sh`
 - The API server will run on port 3000 by default (example: http://localhost:3000/api/all/stats)
 - From the `loader` directory, install dependencies and load example data `npm i && sh devrun.sh`
 - If the loading process ran successfully, example data will be available on the server

## Requirements

 - NodeJS v6
 - MongoDB v3.2
