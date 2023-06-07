const newClient = require("../connection")

const addSuplier = async (data) => {
    return new Promise(async (resolve,reject) => {
        const client = newClient();
        client.connect();
        var result_suplier = await client.query(`INSERT INTO supplier (name, added_by) 
                      VALUES ('${data.name}','${data.added_by}')`);
        var supplier_id = result_suplier.id

        var kriterias = await client.query(`SELECT * FROM kriteria`)
        var index = 0;
        kriterias.forEach( async (item) => {
          await client.query(`INSERT INTO kriteria_supplier (id_kriteria, id_supplier, nilai)
                            VALUES ('${item.id}', '${supplier_id}', '${data.nilai[index]}')`)
          index += 1;
        })
        client.end()
    })
}

const getSuplier = async (data) => {
  return new Promise(async (resolve,reject) => {
      const client = newClient();
      client.connect();
      client.query(`SELECT * from supplier`,
                    (err, result) => {
                      if(err) reject(err.message)
                      resolve({status:200, message:"OK", data: result.rows})
                      client.end();
                    })
  })
}

const deleteSuplier = async (data) => {
    return new Promise(async (resolve, reject) => {
        const client = newClient();
        client.connect();
        client.query(`DELETE FROM supplier
                      WHERE id = '${data.id}'`,
                      (err) => {
                        if(err) reject(err.message)
                        resolve({status:202, message:"deletion-was-successful"})
                        client.end();

                      })
    })
}

[{
  name:"nama",
  added_by:"added by",
  id_supplier:"id supp"
 },
 {id_supplier:"id supp", 
  id_kriteria:"id kri", 
  nilai:"nilai"
 },

 {
  id_supplier:"id supp", 
  id_kriteria:"id kri", 
  nilai:"nilai"
 },

 {
  id_supplier:"id supp", 
  id_kriteria:"id kri", 
  nilai:"nilai"
 },

 {
  id_supplier:"id supp", 
  id_kriteria:"id kri", 
  nilai:"nilai"
 }]

//kurang update rating kriteria dari supplier
const updateSuplier = async (data) => {
  return new Promise(async (resolve, reject) => {
      const client = newClient();
      client.connect();
      client.query(`UPDATE supplier SET name='${data.name}', added_by='${data.added_by}' FROM supplier
                    WHERE id = '${data.id_supplier}'`,
                    (err) => {
                      if(err) reject(err.message)
                      resolve({status:202, message:"update-was-successful"})
                    })
      for(var i = 1; i < data.length; i++){
        await client.query(`UPDATE kriteria_supplier SET nilai='${data[i].nilai}'
                            WHERE id_kriteria = '${data[i].id_kriteria}' AND id_supplier='${data[i].id_supplier}'`)
        
      }
      client.end();
  })
}

// TODO
// benefit = (ci - cmin) / (cmax - cmin)
// cost = (cmax - ci) / (cmax - cmin)
const normalisasiSuplier = async () => {
    return new Promise(async (resolve, reject) => {
        const q1 = newClient();
        const q2 = newClient();
        q1.connect();
        q2.connect();
  
    try {
      const arr1 = await q1.query(
        `SELECT DISTINCT id_suplier_1 FROM perbandingan_suplier ORDER BY id_suplier_1`
      );
      const arr2 = await q2.query(
        `SELECT nilai FROM perbandingan_suplier ORDER BY id_suplier_2, id_suplier_1`
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
            `UPDATE perbandingan_suplier SET nilai_normalisasi = '${arr2.rows[j+i*arr1.rowCount].nilai/result}'
             WHERE id_suplier_1 = '${arr1.rows[j].id_suplier_1}' AND id_suplier_2 = '${arr1.rows[i].id_suplier_1}'`
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

module.exports = {
  addSuplier,
  getSuplier,
  deleteSuplier,
  updateSuplier,
  normalisasiSuplier
}