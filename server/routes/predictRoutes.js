const express = require("express")
const router = express.Router()

const { predictRisk } = require("../controllers/predictController")

router.post("/risk", predictRisk)

module.exports = router