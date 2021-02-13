-- SQL Queries to create products table for your database
CREATE TABLE products(
    index serial PRIMARY KEY,
    id VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(100) NOT NULL,
    description text NOT NULL,
    price int NOT NULL,
    image TEXT UNIQUE NOT NULL
);