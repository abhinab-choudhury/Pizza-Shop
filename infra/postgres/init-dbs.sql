-- One database per service (data ownership rule #1). Runs only on first container start.
CREATE DATABASE identity;
CREATE DATABASE orders;
CREATE DATABASE payments;
CREATE DATABASE kitchen;
CREATE DATABASE delivery;
