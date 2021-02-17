CREATE TABLE orders(
    index serial PRIMARY KEY NOT NULL,
    id VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(100) NOT NULL,
    product TEXT NOT NULL,
    payment int NOT NULL,
    order_status VARCHAR(100) NOT NULL
);