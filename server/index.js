const express = require("express");
const cors = require("cors");
const routeRoutes = require("./routes/routeRoutes")
// Import routes
const riskRoutes = require("./routes/riskRoutes");
const heatmapRoutes = require("./routes/heatmapRoutes")
const predictRoutes = require("./routes/predictRoutes")
const alertRoutes = require("./routes/alertRoutes")
const app = express();

app.use(cors());
app.use(express.json());

// Register API routes
app.use("/api/risk", riskRoutes);
app.use("/api/routes", routeRoutes)
app.use("/api/heatmap", heatmapRoutes)
app.use("/api/predict", predictRoutes)
app.use("/api/alert", alertRoutes)
// Root route
app.get("/", (req,res)=>{
    res.send("Women Safety Route Planner Backend Running");
});

app.listen(5000, ()=>{
    console.log("Server running on port 5000");
});