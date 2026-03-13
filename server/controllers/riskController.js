const crimes = require("../services/datasetService")
const getCrimeRisk = require("../services/riskEngine")

exports.getRisk = (req, res) => {

let totalRisk = 0

crimes.forEach(crime => {
    const risk = getCrimeRisk(crime.crime_type)
    totalRisk += risk
})

const averageRisk = totalRisk / crimes.length

res.json({
    datasetSize: crimes.length,
    averageRisk: averageRisk
})

}