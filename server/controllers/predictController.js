const crimes = require("../services/datasetService")
const calculateRisk = require("../services/riskEngine")
const getDistance = require("../utils/geoUtils")

const predictRisk = (req,res)=>{

const { lat, lng, hour } = req.body

let totalRisk = 0
let count = 0

crimes.forEach(crime => {

const distance = getDistance(
parseFloat(lat),
parseFloat(lng),
parseFloat(crime.latitude),
parseFloat(crime.longitude)
)

if(distance < 2){

const risk = calculateRisk(
parseFloat(crime.crime_severity),
parseFloat(crime.lighting_level),
parseFloat(crime.crowd_density),
parseInt(hour)
)

totalRisk += risk
count++

}

})

const predictedRisk = count === 0 ? 0 : totalRisk / count

res.json({
lat,
lng,
hour,
predictedRisk
})

}

module.exports = { predictRisk }