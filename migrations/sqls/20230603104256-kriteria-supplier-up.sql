CREATE TABLE public."kriteria_supplier" (
    id     UUID        NOT NULL DEFAULT gen_random_uuid (),
    id_kriteria UUID,
    id_supplier UUID,
    nilai       REAL,
    nilai_normalisasi REAL,

    PRIMARY KEY (id)
);