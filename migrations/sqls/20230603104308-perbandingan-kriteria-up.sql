CREATE TABLE public."perbandingan_kriteria" (
    id     UUID        NOT NULL DEFAULT gen_random_uuid (),
    id_kriteria_1 UUID,
    id_kriteria_2 UUID,
    nilai REAL,
    nilai_normalisasi REAL,
    
    PRIMARY KEY (id)
);