const scoreRoute = require("../services/routeScorer")
const getSafetyLevel = require("../utils/safetyPulse")

exports.getSafestRoute = (req,res)=>{

const { routes } = req.body

if(!routes){
    return res.status(400).json({
        error:"routes required"
    })
}

let safestRoute = null
let lowestRisk = Infinity

routes.forEach(route => {

    const risk = scoreRoute(route.points)

    if(risk < lowestRisk){
        lowestRisk = risk
        safestRoute = route
    }

})

const safety = getSafetyLevel(lowestRisk)

res.json({
    safestRoute,
    riskScore: lowestRisk,
    safetyPulse: safety
})

}