# SAVN - A Simulation Platform for Autonomous Vehicle Networks

SAVN is a simulation platform (in development) allowing researchers to visualize and benchmark traffic control algorithms for autonomous vehicle fleets.

The platform allows to test algorithms against real-world data such as popular origin/destination pairs and realistic traffic data (car, pedestrian, road hazards, etc.). It is also possible to use multiple algorithms together, in the same simulation.

## How it works

SAVN is separated into three components:

- Website: Create, configure, visualize and benchmark algorithms
- Python framework: Use to connect an algorithm to SAVN, providing fleet information in real-time
- Server: Stores data and handles communication between the website and the algorithm
