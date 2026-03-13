const fs = require("fs")
const path = require("path")

let crimes = []

const filePath = path.join(__dirname, "../datasets/crime_data.csv")

try {
    const data = fs.readFileSync(filePath, 'utf8')
    const lines = data.split('\n')
    const headers = lines[0].split(',')
    
    for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim()) {
            const values = lines[i].split(',')
            const crime = {}
            headers.forEach((header, index) => {
                crime[header.trim()] = values[index].trim()
            })
            crimes.push(crime)
        }
    }
    console.log("Crime dataset loaded:", crimes.length)
} catch (error) {
    console.error("Error loading crime dataset:", error)
}

module.exports = crimes