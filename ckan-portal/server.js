const express = require("express")
const axios = require("axios")
const path = require("path")

const app = express()

// =============================
// CONFIG
// =============================

const PORT = 3000
const CKAN_URL = "http://localhost:5000"

// axios instance (lebih efisien)
const ckan = axios.create({
    baseURL: CKAN_URL + "/api/3/action",
    timeout: 5000
})

// template engine
app.set("view engine", "ejs")

// views folder
app.set("views", path.join(__dirname, "views"))

// static assets
app.use(express.static(path.join(__dirname, "public")))


// =============================
// HOME PAGE
// =============================

app.get("/", async (req, res) => {

    try {

        const response = await ckan.get("/package_list")

        const datasets = response.data.result.slice(0, 30)

        res.render("index", { datasets })

    } catch (error) {

        console.error("CKAN ERROR:", error.message)

        res.status(500).render("error", {
            message: "Gagal mengambil dataset dari CKAN"
        })

    }

})


// =============================
// DATASET DETAIL
// =============================

app.get("/dataset/:id", async (req, res) => {

    try {

        const datasetId = req.params.id

        const response = await ckan.get(`/package_show?id=${datasetId}`)

        const dataset = response.data.result

        res.render("dataset", { dataset })

    } catch (error) {

        console.error("DATASET ERROR:", error.message)

        res.status(404).render("error", {
            message: "Dataset tidak ditemukan"
        })

    }

})


// =============================
// SEARCH DATASET
// =============================

app.get("/search", async (req, res) => {

    try {

        const q = req.query.q || ""

        const response = await ckan.get(`/package_search?q=${q}`)

        const datasets = response.data.result.results

        res.render("index", { datasets })

    } catch (error) {

        console.error("SEARCH ERROR:", error.message)

        res.status(500).send("Search gagal")

    }

})


// =============================
// PREVIEW DATASET
// =============================

app.get("/preview/:resourceId", async (req, res) => {

    try {

        const response = await ckan.get(
            `/datastore_search?resource_id=${req.params.resourceId}&limit=20`
        )

        const data = response.data.result

        res.render("preview", { data })

    } catch (error) {

        console.error("PREVIEW ERROR:", error.message)

        res.status(500).send("Preview data gagal")

    }

})


// =============================
// SERVER START
// =============================

app.listen(PORT, () => {

    console.log("===================================")
    console.log("Portal Data Kota Tangerang")
    console.log(`Server running: http://localhost:${PORT}`)
    console.log("===================================")

})