const mongoose = require("mongoose");

async function connectDatabase() {

mongoose.set("bufferCommands", false);

try {

await mongoose.connect(process.env.MONGO_URI, {
serverSelectionTimeoutMS: 5000
});

console.log("MongoDB connected");

return true;

} catch (error) {

console.error("MongoDB connection failed:", error.message);

throw error;

}

}

function isDatabaseConnected() {
return mongoose.connection.readyState === 1;
}

module.exports = { connectDatabase, isDatabaseConnected };