const crimeRiskMap = {
    "Homicide": 1.0,
    "Assault": 0.9,
    "Robbery": 0.8,
    "Domestic Violence": 0.85,
    "Burglary": 0.6,
    "Drug Offense": 0.5,
    "Theft": 0.4,
    "Vandalism": 0.3,
    "Fraud": 0.2,
    "Arson": 0.7
}

function calculateRisk(crimeSeverity, lighting, crowd, hour){

    let timeRisk = 1

    if(hour >= 22 || hour <= 5){
        timeRisk = 1.5
    }

    const lightingRisk = 1 - lighting
    const crowdRisk = 1 - crowd

    const risk =
        (0.50 * crimeSeverity) +
        (0.25 * lightingRisk) +
        (0.15 * crowdRisk) +
        (0.10 * timeRisk)

    return risk
}

module.exports = calculateRisk