function getSafetyLevel(risk){

if(risk < 0.5){
    return {
        level: "SAFE",
        color: "green",
        emoji: "🟢"
    }
}

if(risk < 0.8){
    return {
        level: "MODERATE",
        color: "yellow",
        emoji: "🟡"
    }
}

return {
    level: "DANGEROUS",
    color: "red",
    emoji: "🔴"
}

}

module.exports = getSafetyLevel