const crimes = require("../services/datasetService")

exports.getHeatmapData = (req, res) => {

const heatmap = crimes.map(crime => {

return {
    lat: parseFloat(crime.latitude),
    lng: parseFloat(crime.longitude),
    risk: parseFloat(crime.risk_score)
}

})

res.json({
    heatmap
})

}