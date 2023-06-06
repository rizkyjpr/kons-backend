const newClient = require("../connection");

const addCriteria = async (data) => {
    return new Promise(async (resolve, reject) => {
        const client = newClient();
        client.connect();
        client.query(
            `INSERT INTO kriteria (type, name, added_by) 
                      VALUES ('${data.type}','${data.name}','${data.added_by}')`,
            (err) => {
                if (err) reject(err.message);
                resolve({ status: 201, message: "insertion-was-successful" });
                client.end();
            }
        );
    });
};

const getAllCriteria = async () => {
    return new Promise(async (resolve, reject) => {
        const client = newClient();
        client.connect();
        client.query(`SELECT * FROM kriteria`, (err, result) => {
            if (err) reject(err.message);
            if (!result) reject({ status: 404, message: "data-not-found" });
            resolve(result.rows);
            client.end();
        });
    });
};

const deleteCriteria = async (data) => {
    return new Promise(async (resolve, reject) => {
        const client = newClient();
        client.connect();
        client.query(
            `DELETE FROM kriteria
                      WHERE id = '${data.id}'`,
            (err) => {
                if (err) reject(err.message);
                resolve({ status: 202, message: "deletion-was-successful" });
            }
        );
    });
};

const insertPerbandingan = async (data) => {
    return new Promise(async (resolve, reject) => {
        const client = newClient();
        client.connect();
        const queries = [];
        for (var i = 0; i < data.nilai.length; i++) {
            queries.push(`INSERT INTO perbandingan_kriteria (id_kriteria_1, id_kriteria_2, nilai) 
                          VALUES ('${data.nilai[i].row}', '${data.nilai[i].column}', '${data.nilai[i].value}')`);
        }
        try {
            const reset = await client.query(`DELETE FROM perbandingan_kriteria
            WHERE EXISTS (SELECT 1 FROM perbandingan_kriteria);`);
            for (const query of queries) {
                const result = await client.query(query);
            }
            resolve({ status: 201, message: "insertion-was-successful" });
        } catch (error) {
            reject(error);
        } finally {
            client.end();
        }
    });
};

const normalisasiKriteria = async () => {
    return new Promise(async (resolve, reject) => {
        const q1 = newClient();
        const q2 = newClient();
        q1.connect();
        q2.connect();

        try {
            const arr1 = await q1.query(
                `SELECT DISTINCT id_kriteria_1 FROM perbandingan_kriteria ORDER BY id_kriteria_1`
            );
            const arr2 = await q2.query(
                `SELECT nilai FROM perbandingan_kriteria ORDER BY id_kriteria_2, id_kriteria_1`
            );
            var count = 0;
            var queries = [];
            for (let i = 0; i < arr1.rowCount; i++) {
                const temp = arr2.rows.slice(
                    (count / arr1.rowCount) * arr1.rowCount,
                    (count / arr1.rowCount) * arr1.rowCount + arr1.rowCount
                );
                let result = 0;
                temp.forEach((num) => {
                    result += num.nilai;
                });
                for (let j = 0; j < arr1.rowCount; j++) {
                    queries.push(
                        `UPDATE perbandingan_kriteria SET nilai_normalisasi = '${
                            arr2.rows[j + i * arr1.rowCount].nilai / result
                        }'
             WHERE id_kriteria_1 = '${
                 arr1.rows[j].id_kriteria_1
             }' AND id_kriteria_2 = '${arr1.rows[i].id_kriteria_1}'`
                    );
                    count += 1;
                }
            }
            queries.push(
                `SELECT id_kriteria_1, id_kriteria_2, nilai_normalisasi FROM perbandingan_kriteria;`
            );
            const q3 = newClient();
            q3.connect();
            try {
                let result;
                for (const query of queries) {
                    result = await q3.query(query);
                }

                resolve(result.rows);
            } catch (error) {
                reject(error);
            } finally {
                q3.end();
            }
        } catch (error) {
            reject(error);
        } finally {
            q1.end();
            q2.end();
        }
    });
};

const ahp = async () => {
    return new Promise(async (resolve, reject) => {
        const client = newClient();
        client.connect();
        const arr = await client.query(
            `select id_kriteria_1, sum(nilai_normalisasi)/count(id_kriteria_1) as bobot_akhir from perbandingan_kriteria group by id_kriteria_1;`
        );
        const reset = await client.query(`DELETE FROM bobot_akhir
        WHERE EXISTS (SELECT 1 FROM perbandingan_kriteria);`);
        const queries = [];
        for (var i = 0; i < arr.rowCount; i++) {
            queries.push(
                `INSERT INTO bobot_akhir(id_kriteria, nilai) VALUES('${arr.rows[i].id_kriteria_1}','${arr.rows[i].bobot_akhir}')`
            );
        }
        try {
          queries.push(`SELECT * FROM bobot_akhir;`)
          var result  
          for (const query of queries) {
              result = await client.query(query);
            }
            resolve(result.rows)
          } catch (error) {
            reject(error);
        } finally {
            client.end();
        }
    });
};

const lambdaMax = async () => {
    return new Promise((resolve, reject) => {
        const client = newClient();
        client.connect();
        client.query(
            `SELECT SUM(bobot_akhir.nilai * total.s) lambda_max FROM bobot_akhir
                      JOIN (SELECT id_kriteria_2, SUM(nilai) s FROM perbandingan_kriteria GROUP BY id_kriteria_2) total
                      ON bobot_akhir.id_kriteria = total.id_kriteria_2`,
            (err, result) => {
                if (err) reject(err.message);
                resolve(result.rows[0]);
            }
        );
    });
};

const ci = async () => {
  return new Promise(async (resolve,reject) => {
    const client = newClient();
    client.connect();
    const lambdaMax = await client.query(`SELECT SUM(bobot_akhir.nilai * total.s) lambda_max FROM bobot_akhir
                  JOIN (SELECT id_kriteria_2, SUM(nilai) s FROM perbandingan_kriteria GROUP BY id_kriteria_2) total
                  ON bobot_akhir.id_kriteria = total.id_kriteria_2;`)
    const arr1 = await client.query(
      `SELECT DISTINCT id_kriteria_1 FROM perbandingan_kriteria ORDER BY id_kriteria_1`
    );
    const result = (lambdaMax.rows[0].lambda_max - arr1.rowCount)/(arr1.rowCount-1)
    resolve(result)
  })
}

const cr = async () => {
  return new Promise(async (resolve,reject) => {
    const client = newClient();
    client.connect();
    const lambdaMax = await client.query(`SELECT SUM(bobot_akhir.nilai * total.s) lambda_max FROM bobot_akhir
                  JOIN (SELECT id_kriteria_2, SUM(nilai) s FROM perbandingan_kriteria GROUP BY id_kriteria_2) total
                  ON bobot_akhir.id_kriteria = total.id_kriteria_2;`)
    const arr1 = await q1.query(
      `SELECT DISTINCT id_kriteria_1 FROM perbandingan_kriteria ORDER BY id_kriteria_1`
    );
    const _ci = (lambdaMax.rows[0].lambda_max - arr1.rowCount)/(arr1.rowCount-1)

    const ri = [0,0,0, 0.52, 0.89, 1.11, 1.25, 1.35, 1.40, 1.45, 1.49]
    const _cr = _ci/ri[arr1.rowCount]
    resolve(_cr)
  })
}

module.exports = {
    addCriteria,
    getAllCriteria,
    deleteCriteria,
    insertPerbandingan,
    normalisasiKriteria,
    ahp,
    lambdaMax,
    ci,
    cr,
};
