CREATE TABLE verifytoken(
    index serial PRIMARY KEY NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    token VARCHAR(100) NOT NULL,
    expired VARCHAR(100) NOT NULL
);