CREATE TABLE public."user" (
    id     UUID        NOT NULL DEFAULT gen_random_uuid (),
    name    VARCHAR     NOT NULL,
    email       VARCHAR     NOT NULL,
    password    VARCHAR     NOT NULL,
    
    PRIMARY KEY (id)
);