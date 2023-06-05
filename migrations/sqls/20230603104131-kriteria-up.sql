CREATE TABLE public."kriteria" (
    id          UUID        NOT NULL DEFAULT gen_random_uuid (),
    type        VARCHAR     NOT NULL,
    name        VARCHAR     NOT NULL,
    added_by    UUID     NOT NULL,
    PRIMARY KEY (id)
);