CREATE TABLE public."supplier" (
    id     UUID        NOT NULL DEFAULT gen_random_uuid (),
    name    VARCHAR     NOT NULL,
    added_by  UUID   NOT NULL,
    rating    REAL,
    
    PRIMARY KEY (id)
);