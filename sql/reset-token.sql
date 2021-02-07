CREATE TABLE resettoken(
    index serial PRIMARY KEY NOT NULL,
    useremail VARCHAR(100) UNIQUE NOT NULL,
    token VARCHAR(100) NOT NULL,
    expired VARCHAR(100) NOT NULL
);