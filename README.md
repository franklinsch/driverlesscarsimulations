# SAVN - A Simulation Platform for Autonomous Vehicle Networks

SAVN is a simulation platform (in development) allowing researchers to visualize and benchmark traffic control algorithms for autonomous vehicle fleets.

The platform allows to test algorithms against real-world data such as popular origin/destination pairs and realistic traffic data (car, pedestrian, road hazards, etc.). It is also possible to use multiple algorithms together, in the same simulation.

## How it works

SAVN is separated into three components:

- Website: Create, configure, visualize and benchmark algorithms
- Python framework: Use to connect an algorithm to SAVN, providing fleet information in real-time
- Server: Stores data and handles communication between the website and the algorithm

## Installation

First, install the libraries required for the webserver by executing the following command within the `webserver` directory:

    npm install

If desired, install the dummy data (including default cities):

    node backend/insert-dummy-data.js

The MongoDB data will be stored in the folder `webserver/backend/data/db`, so make sure that it is writable.

If you want to use our sample algorithm, you also need to install the python dependencies by executing the following command within the `sample_algorithms` directory:

    python3 setup.py install

## Usage

First, start up ``mongod`` and load the database:

    mongod --dbpath webserver/backend/data/db

In order to start the webserver, run the following command within the `webserver` directory:

    npm run dev

If you want to attach our sample algorithm to a simulation, make sure that it is marked active in the frontend, and then run the following command within the `sample_algorithms` directory:

    python3 non_colliding.py

You should then start seeing your specified objects like cars on the map in the frontend.