-- SQL Queries to create cart table for your database
CREATE TABLE cart(
    index serial PRIMARY KEY NOT NULL,
    id VARCHAR(100) UNIQUE NOT NULL,
    qty int NOT NULL,
    price int NOT NULL
);