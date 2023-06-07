const newClient = require("../connection");

const addsupplier = async (data) => {
    return new Promise(async (resolve, reject) => {
        const client = newClient();
        client.connect();
        var result_supplier =
            await client.query(`INSERT INTO supplier (name, added_by) 
                      VALUES ('${data.name}','${data.added_by}')`);
        var supplier_id = result_supplier.id;

        for (var i = 0; i < data.length; i++) {
            await client.query(`INSERT INTO kriteria_supplier (id_kriteria, id_supplier, nilai)
                              VALUES ('${data.rating[i].id_kriteria}', '${supplier_id}', '${data.rating[i].nilai}')`);
        }
        client.end();
    });
};

const getsupplier = async (data) => {
    return new Promise(async (resolve, reject) => {
        const client = newClient();
        client.connect();
        client.query(`SELECT * from supplier`, (err, result) => {
            if (err) reject(err.message);
            resolve({ status: 200, message: "OK", data: result.rows });
            client.end();
        });
    });
};

const deletesupplier = async (data) => {
    return new Promise(async (resolve, reject) => {
        const client = newClient();
        client.connect();
        client.query(
            `DELETE FROM supplier
                      WHERE id = '${data.id}'`,
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
            `UPDATE supplier SET name='${data.name}', added_by='${data.added_by}' FROM supplier
                    WHERE id = '${data.id_supplier}'`,
            (err) => {
                if (err) reject(err.message);
            }
        );
        for (var i = 1; i < data.length; i++) {
            await client.query(`UPDATE kriteria_supplier SET nilai='${data[i].nilai}'
                            WHERE id_kriteria = '${data[i].id_kriteria}' AND id_supplier='${data[i].id_supplier}'`);
        }
        resolve({ status: 202, message: "update-was-successful" });
        client.end();
    });
};

// TODO
// benefit = (ci - cmin) / (cmax - cmin)
// cost = (cmax - ci) / (cmax - cmin)
const normalisasisupplier = async () => {
    return new Promise(async (resolve, reject) => {
        const client = newClient();
        client.connect();
        // min_max = [{id_kriteria = 'id', min='min', max='max'}]
        const min_max = await client.query(
            `SELECT id_kriteria, MIN(nilai) min, MAX(nilai) max FROM kriteria_supplier GROUP BY id_kriteria;`
        );
    });
};

module.exports = {
    addsupplier,
    getsupplier,
    deletesupplier,
    updatesupplier,
    normalisasisupplier,
};
