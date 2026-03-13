const crimes = require("./datasetService")
const calculateRisk = require("./riskEngine")
const getDistance = require("../utils/geoUtils")

function scoreRoute(routePoints){

let totalRisk = 0
let count = 0

// find route bounding box
const lats = routePoints.map(p => parseFloat(p.lat))
const lngs = routePoints.map(p => parseFloat(p.lng))

const minLat = Math.min(...lats)
const maxLat = Math.max(...lats)
const minLng = Math.min(...lngs)
const maxLng = Math.max(...lngs)

// filter crimes roughly near route first
const nearbyCrimes = crimes.filter(crime => {

const lat = parseFloat(crime.latitude)
const lng = parseFloat(crime.longitude)

return (
lat >= minLat - 0.5 &&
lat <= maxLat + 0.5 &&
lng >= minLng - 0.5 &&
lng <= maxLng + 0.5
)

})

routePoints.forEach(point => {

const pointLat = parseFloat(point.lat)
const pointLng = parseFloat(point.lng)

nearbyCrimes.forEach(crime => {

const distance = getDistance(
pointLat,
pointLng,
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

})

return count === 0 ? 0 : totalRisk / count

}

module.exports = scoreRoute