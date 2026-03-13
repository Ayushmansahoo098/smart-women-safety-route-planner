const express = require("express")
require("dotenv").config()

const { connectDatabase } = require("./config/db")

const app = express()

// connect to MongoDB
connectDatabase()

// middleware
app.use(express.json())

// routes
const authRoutes = require("./routes/authRoutes")
const routeRoutes = require("./routes/routeRoutes")
const predictRoutes = require("./routes/predictRoutes")
const heatmapRoutes = require("./routes/heatmapRoutes")
const alertRoutes = require("./routes/alertRoutes")

app.use("/api/auth", authRoutes)
app.use("/api/routes", routeRoutes)
app.use("/api/predict", predictRoutes)
app.use("/api/heatmap", heatmapRoutes)
app.use("/api/alert", alertRoutes)

// server start
const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
console.log(`Server running on port ${PORT}`)
})