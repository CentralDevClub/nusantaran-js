CREATE TABLE products(
    index serial PRIMARY KEY,
    id VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(100) UNIQUE NOT NULL,
    category VARCHAR(100) NOT NULL,
    description text NOT NULL,
    price int NOT NULL,
    image TEXT NOT NULL
);