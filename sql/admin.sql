CREATE TABLE administrator(
    index serial PRIMARY KEY NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL
);