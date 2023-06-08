const express = require("express");
const app = express();
const cors = require("cors");
const { register, login } = require("./auth/auth");
const {
    add_criteria,
    addCriteria,
    getAllCriteria,
    deleteCriteria,
    insertPerbandingan,
    normalisasiKriteria,
    ahp,
    lambdaMax,
    ci,
    cr,
} = require("./criteria/criteria");
const {
    addsupplier,
    getallsupplier,
    updatesupplier,
    deletesupplier,
    normalisasisupplier,
} = require("./supplier/supplier");
const newClient = require("./connection");
const { getSupplierById } = require("./supplier/supplier");
const { rating } = require("./supplier/supplier");
const { rank } = require("./supplier/supplier");

app.use(express.json());
app.use(cors());

app.listen(8080, () => {
    console.log("works");
});

app.get("/", (_, res) => {
    console.log("halo");
    return res.json({
        message: "nice",
    });
});

app.get("/popop", async (_, res) => {});

app.post("/register", async (req, res) => {
    try {
        return register(req.body).then((result) => {
            res.json(result);
        });
    } catch (error) {
        return res.status(500).json(error.message);
    }
});

app.post("/login", async (req, res) => {
    try {
        return login(req.body).then((result) => {
            res.json(result);
        });
    } catch (error) {
        return res.status(500).json(error.message);
    }
});

//add kriteria
app.post("/kriteria", async (req, res) => {
    try {
        return addCriteria(req.body).then((result) => {
            res.json(result);
        });
    } catch (error) {
        return res.status(500).json(error.message);
    }
});

//get all kriteria
app.get("/kriteria", async (_, res) => {
    try {
        return getAllCriteria().then((result) => res.json(result));
    } catch (error) {}
});

//delete kriteria
app.delete("/kriteria/:id", async (req, res) => {
    try {
        return deleteCriteria(req.params).then((result) => res.json(result));
    } catch (error) {
        return res.status(500).json(error.message);
    }
});

//input bobot perbandingan kriteria
app.post("/kriteria/perbandingan", async (req, res) => {
    try {
        return insertPerbandingan(req.body).then((result) => res.json(result));
    } catch (error) {
        return res.status(500).json(error.message);
    }
});

//hitung normalisasi perbandingan kriteria
app.get("/kriteria/normalisasi", async (_, res) => {
    try {
        return normalisasiKriteria().then((result) => res.json(result));
    } catch (error) {
        return res.status(500).json(error.message);
    }
});

//hitung bobot AHP
app.get("/kriteria/ahp", async (_, res) => {
    try {
        return ahp().then((result) => res.json(result));
    } catch (error) {
        return res.status(500).json(error.message);
    }
});

//lm
app.get("/kriteria/lambdamax", async (_, res) => {
    try {
        return lambdaMax().then((result) => res.json(result));
    } catch (error) {}
});

//ci
app.get("/kriteria/ci", async (_, res) => {
    try {
        return ci().then((result) => res.json(result));
    } catch (error) {
        return res.status(500).json(error.message);
    }
});

//cr
app.get("/kriteria/cr", async (_, res) => {
    try {
        return cr().then((result) => res.json(result));
    } catch (error) {
        return res.status(500).json(error.message);
    }
});

//add supplier
app.post("/supplier", async (req, res) => {
    try {
        return addsupplier(req.body).then((result) => {
            res.json(result);
        });
    } catch (error) {
        return res.status(500).json(error.message);
    }
});

//edit supplier
app.patch("/supplier", async (req, res) => {
    try {
        return updatesupplier(req.body).then((result) => {
            res.json(result);
        });
    } catch (error) {
        return res.status(500).json(error.message);
    }
});

//delete supplier
app.delete("/supplier/:id", async (req, res) => {
    try {
        return deletesupplier(req.params).then((result) => {
            res.json(result);
        });
    } catch (error) {
        return res.status(500).json(error.message);
    }
});

//get all supplier
app.get("/supplier", async (_, res) => {
    try {
        return getallsupplier().then((result) => {
            res.json(result);
        });
    } catch (error) {
        return res.status(500).json(error.message);
    }
});

//hitung normalisasi semua supplier
app.post("/supplier/normalisasi", async (req, res) => {
    try {
        return normalisasisupplier(req.body.id_supplier).then((result) => {
            res.json(result);
        });
    } catch (error) {
        return res.status(500).json(error.message);
    }
});

//hitung rating supplier
app.post("/supplier/rating", async (req, res) => {
    try {
        return rating(req.body.id_supplier).then((result) => {
            res.json(result);
        });
    } catch (error) {
        return res.status(500).json(error.message);
    }
});

//list rank supplier sesuai rating
app.post("/supplier/rank", async (req, res) => {
    try {
        return rank(req.body.id_supplier).then((result) => {
            res.json(result);
        });
    } catch (error) {
        return res.status(500).json(error.message);
    }
});
