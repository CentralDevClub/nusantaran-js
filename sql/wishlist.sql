CREATE TABLE wishlist(
    index serial PRIMARY KEY,
    id VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(100) NOT NULL,
    product_id VARCHAR(100) NOT NULL
);