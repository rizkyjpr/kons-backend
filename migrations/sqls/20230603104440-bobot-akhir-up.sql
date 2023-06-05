CREATE TABLE public."bobot_akhir" (
    id     UUID        NOT NULL DEFAULT gen_random_uuid (),
    id_kriteria UUID,
    nilai REAL,
    
    PRIMARY KEY (id)
);