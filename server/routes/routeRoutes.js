const express = require("express")
const router = express.Router()

const { getSafestRoute } = require("../controllers/routeController")

router.post("/safest", getSafestRoute)

module.exports = router