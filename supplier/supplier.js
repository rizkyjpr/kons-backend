const newClient = require("../connection");

const addsupplier = async (data) => {
    return new Promise(async (resolve, reject) => {
        const client = newClient();
        client.connect();
        var supplier_id =
            await client.query(`INSERT INTO supplier (name, added_by) 
                      VALUES ('${data.name}','${data.added_by}') RETURNING id`);
        // var supplier_id = await client.query(
        //     `SELECT id FROM supplier WHERE name = '${data.name}' AND added_by='${data.added_by}'`
        // );

        for (var i = 0; i < data.rating.length; i++) {
            await client.query(`INSERT INTO kriteria_supplier (id_kriteria, id_supplier, nilai)
                              VALUES ('${data.rating[i].id_kriteria}', '${supplier_id.rows[0].id}', '${data.rating[i].nilai}')`);
        }
        resolve({ status: 201, message: "insertion-was-successful" });
        client.end();
    });
};

const getallsupplier = async (data) => {
    return new Promise(async (resolve, reject) => {
        const client = newClient();
        client.connect();
        const data = await client.query(
            `SELECT supplier.id, supplier.name, supplier.added_by, supplier.rating, u.name username from supplier JOIN public."user" AS u ON u.id = supplier.added_by`
        );
        const queries = [];
        for (var i = 0; i < data.rowCount; i++) {
            queries.push(
                `SELECT * FROM kriteria_supplier WHERE id_supplier = '${data.rows[i].id}'`
            );
        }
        const result = [];
        try {
            index = 0;
            for (query of queries) {
                const temp = await client.query(query);
                result.push({
                    id: data.rows[index].id,
                    name: data.rows[index].name,
                    added_by: data.rows[index].username,
                    kriteria: temp.rows,
                });
                index += 1;
            }
            resolve(result);
        } catch (error) {
            reject(error);
        } finally {
            client.end();
        }
    });
};

const deletesupplier = async (data) => {
    return new Promise(async (resolve, reject) => {
        const client = newClient();
        client.connect();
        client.query(
            `DELETE FROM supplier
                      WHERE id = '${data.id}';
             DELETE FROM kriteria_supplier
                      WHERE id_supplier = '${data.id}'`,
            (err) => {
                if (err) reject(err.message);
                resolve({ status: 202, message: "deletion-was-successful" });
                client.end();
            }
        );
    });
};

//kurang update rating kriteria dari supplier
const updatesupplier = async (data) => {
    return new Promise(async (resolve, reject) => {
        const client = newClient();
        client.connect();
        client.query(
            `UPDATE supplier SET name='${data.name}', added_by='${data.added_by}' WHERE id = '${data.id_supplier}'`,
            (err) => {
                if (err) reject(err.message);
            }
        );

        for (var i = 0; i < data.rating.length; i++) {
            await client.query(`UPDATE kriteria_supplier SET nilai='${data.rating[i].nilai}'
                            WHERE id_kriteria = '${data.rating[i].id_kriteria}' AND id_supplier='${data.rating[i].id_supplier}'`);
        }
        resolve({ status: 202, message: "update-was-successful" });
        client.end();
    });
};

// TODO
// benefit = (ci - cmin) / (cmax - cmin)
// cost = (cmax - ci) / (cmax - cmin)

const normalisasisupplier = async (id_supplier) => {
    return new Promise(async (resolve, reject) => {
        const client = newClient();
        client.connect();

        console.log(id_supplier);

        const min_max = await client.query(
            `SELECT id_kriteria, MIN(nilai) min, MAX(nilai) max FROM kriteria_supplier WHERE id_supplier IN (${id_supplier}) GROUP BY id_kriteria;`
        );
        const idsup = id_supplier.split(",");
        // console.log(min_max.rows);
        // const benefit = (data.rows[i].nilai - min_max.rows[i].min) / (min_max.rows[i].max- min_max.rows[i].min)

        for (var i = 0; i < min_max.rowCount; i++) {
            for (var j = 0; j < idsup.length; j++) {
                const data = await client.query(
                    `SELECT ks.id id, ks.nilai nilai, k.id id_kriteria, k.type type FROM kriteria_supplier ks JOIN kriteria k ON ks.id_kriteria = k.id WHERE id_kriteria = '${min_max.rows[i].id_kriteria}' AND id_supplier = ${idsup[j]}`
                );
                const normalisasi =
                    data.rows[0].type == "Benefit"
                        ? (data.rows[0].nilai - min_max.rows[i].min) /
                          (min_max.rows[i].max - min_max.rows[i].min)
                        : (min_max.rows[i].max - data.rows[0].nilai) /
                          (min_max.rows[i].max - min_max.rows[i].min);
                await client.query(
                    `UPDATE kriteria_supplier SET nilai_normalisasi = '${normalisasi}' WHERE id = '${data.rows[0].id}'`
                );
            }
        }
        const result = await client.query(
            `SELECT id_kriteria, id_supplier, nilai_normalisasi FROM kriteria_supplier`
        );
        resolve(result.rows);
    });
};

// TODO : MAKE RATING USE SELECTED KRITERIA AND SUPPLIER (BODY: ID_SUPPLIER DAN ID_KRITERIA)
// {
//     id_supplier : [id1, id2, id3]
//     id_kriteria: [id1,id2,id3]
// }

//
const rating = async (idsup) => {
    return new Promise(async (resolve, reject) => {
        const client = newClient();
        client.connect();
        const data = await client.query(
            `SELECT sup.id_supplier id_supplier, SUM(ahp.nilai * sup.nilai_normalisasi) rating FROM kriteria_supplier sup JOIN bobot_akhir ahp ON ahp.id_kriteria = sup.id_kriteria WHERE id_supplier IN(${idsup}) GROUP BY sup.id_supplier`
        );
        for (var i = 0; i < data.rowCount; i++) {
            client.query(
                `UPDATE supplier SET rating = '${data.rows[i].rating}' WHERE id = '${data.rows[i].id_supplier}'`
            );
        }
        resolve({ status: 202, message: "deletion-was-successful" });
    });
};

// TODO : MAKE RATING USE SELECTED KRITERIA AND SUPPLIER (BODY: ID_SUPPLIER DAN ID_KRITERIA)
// {
//     id_supplier : [id1, id2, id3]
//     id_kriteria: [id1,id2,id3]
// }

const rank = async (id) => {
    return new Promise(async (resolve, reject) => {
        const client = newClient();
        client.connect();
        client.query(
            `SELECT name, rating FROM supplier WHERE id IN(${id}) ORDER BY rating DESC`,
            (err, result) => {
                if (err) reject(err);
                resolve(result.rows);
            }
        );
    });
};

module.exports = {
    addsupplier,
    getallsupplier,
    deletesupplier,
    updatesupplier,
    normalisasisupplier,
    rating,
    rank,
};
