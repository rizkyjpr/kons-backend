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
const newClient = require("./connection");

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
app.post("/kriteria/normalisasi", async (_, res) => {
    try {
        return normalisasiKriteria().then((result) => res.json(result));
    } catch (error) {
        return res.status(500).json(error.message);
    }
});

//hitung bobot AHP
app.post("/kriteria/ahp", async (_, res) => {
    try {
        return ahp().then((result) => res.json(result));
    } catch (error) {
        return res.status(500).json(error.message);
    }
});

//lm
app.post("/kriteria/lambdamax", async (_, res) => {
    try {
        return lambdaMax().then((result) => res.json(result));
    } catch (error) {}
});

//ci
app.post("/kriteria/ci", async (_, res) => {
    try {
        return ci().then((result) => res.json(result));
    } catch (error) {
        return res.status(500).json(error.message);
    }
});

//cr
app.post("/kriteria/cr", async (_, res) => {
    try {
        return cr.then((result) => res.json(result));
    } catch (error) {
        return res.status(500).json(error.message);
    }
});

//add supplier
//edit supplier
//delete supplier
//hitung normalisasi semua supplier
//rank supplier
