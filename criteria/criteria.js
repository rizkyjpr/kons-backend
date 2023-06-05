const newClient = require("../connection")

const addCriteria = async (data) => {
    return new Promise(async (resolve,reject) => {
        const client = newClient();
        client.connect();
        client.query(`INSERT INTO kriteria (type, name, added_by) 
                      VALUES ('${data.type}','${data.name}','${data.added_by}')`,
                      (err) => {
                        if(err) reject(err.message)
                        resolve({status:201, message:"insertion-was-successful"})
                        client.end();
                      })
    })
}

const getAllCriteria = async () => {
    return new Promise(async (resolve, reject)=> {
        const client = newClient();
        client.connect();
        client.query(`SELECT * FROM kriteria`,
                      (err, result) => {
                        if(err) reject(err.message)
                        if(!result) reject({status:404, message:"data-not-found"})
                        resolve(result.rows)
                        client.end();
                      })
    })
}

const deleteCriteria = async (data) => {
    return new Promise(async (resolve, reject) => {
        const client = newClient();
        client.connect();
        client.query(`DELETE FROM kriteria
                      WHERE id = '${data.id}'`,
                      (err) => {
                        if(err) reject(err.message)
                        resolve({status:202, message:"deletion-was-successful"})
                      })
    })
}

const insertPerbandingan = async (data) => {
    return new Promise(async (resolve, reject) => {
        const client = newClient();
        client.connect();
        const queries = []
        for(var i = 0; i < data.nilai.length; i++){
            queries.push(`INSERT INTO perbandingan_kriteria (id_kriteria_1, id_kriteria_2, nilai) 
                          VALUES ('${data.nilai[i].row}', '${data.nilai[i].column}', '${data.nilai[i].value}')`)
        }
        try {
            for(const query of queries){
                const result = await client.query(query)
            }
            resolve({status:201, message:"insertion-was-successful"})
        } catch (error) {
            reject(error);
        } finally {
            client.end();
        }
    })
}

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
        `SELECT nilai FROM perbandingan_kriteria ORDER BY id_kriteria_1, id_kriteria_2`
      );
  
      var count = 0;
      var queries = [];
      for (let i = 0; i < arr1.rowCount; i++) {
        const temp = arr2.rows.slice(
          (count / arr1.rowCount) * arr1.rowCount,
          (count / arr1.rowCount) * arr1.rowCount + arr1.rowCount
        );
        let result = 0
        temp.forEach((num)=>{
          result+=num.nilai
        })
        for (let j = 0; j < arr1.rowCount; j++) {
          queries.push(
            `UPDATE perbandingan_kriteria SET nilai_normalisasi = '${arr2.rows[j].nilai/result}'
             WHERE id_kriteria_1 = '${arr1.rows[i].id_kriteria_1}' AND id_kriteria_2 = '${arr1.rows[j].id_kriteria_1}'`
          );
          count += 1;
        }
      }
      const q3 = newClient();
      q3.connect();
      try {
        for (const query of queries) {
          const result = await q3.query(query);
        }
        resolve({message:"data-was-normalize"})
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
    })
}

const lambdaMax = async () => {
    return new Promise((resolve,reject) => {
        
    })
}

module.exports = {
    addCriteria,
    getAllCriteria,
    deleteCriteria,
    insertPerbandingan,
    normalisasiKriteria
}