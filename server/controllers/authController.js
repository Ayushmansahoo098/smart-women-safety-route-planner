const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const signup = async (req, res) => {
    res.json({
        message: "Signup working"
    });
};

const login = async (req, res) => {
    res.json({
        message: "Login working"
    });
};

module.exports = { signup, login };