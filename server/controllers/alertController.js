const crimes = require("../services/datasetService")
const calculateRisk = require("../services/riskEngine")
const getDistance = require("../utils/geoUtils")

const checkDanger = (req,res)=>{

const { lat, lng } = req.body

let totalRisk = 0
let count = 0

crimes.forEach(crime => {

const distance = getDistance(
parseFloat(lat),
parseFloat(lng),
parseFloat(crime.latitude),
parseFloat(crime.longitude)
)

if(distance < 1){

const risk = calculateRisk(
parseFloat(crime.crime_severity),
parseFloat(crime.lighting_level),
parseFloat(crime.crowd_density),
parseInt(crime.hour)
)

totalRisk += risk
count++

}

})

const avgRisk = count === 0 ? 0 : totalRisk / count

let alert = "SAFE"

if(avgRisk > 0.8){
alert = "HIGH RISK AREA"
}
else if(avgRisk > 0.5){
alert = "CAUTION AREA"
}

res.json({
lat,
lng,
averageRisk: avgRisk,
alert
})

}

module.exports = { checkDanger }