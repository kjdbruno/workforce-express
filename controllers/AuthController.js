const { Op } = require("sequelize");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const os = require("os");

const { User } = require('../models');

let io;

module.exports = (_io) => {
    io = _io;

    return {
        login: async (req, res) => {
            const { username, password } = req.body;
            try {
                const user = await User.findOne({
                    where: { 
                        username: username 
                    }
                });
                if (!user) {
                    return res.status(404).json({
                        errors: [
                            {
                                type: "field",
                                value: "",
                                msg: "User not found",
                                path: "username",
                                location: "body",
                            },
                        ],
                    });
                }
                const isMatch = await bcrypt.compare(password, user.password);
                if (!isMatch) {
                    return res.status(401).json({
                        errors: [
                            {
                                type: "field",
                                value: "",
                                msg: "Invalid credentials!",
                                path: "username",
                                location: "body",
                            },
                        ],
                    });
                }
                // The 'expiresIn' property handles token expiration
                const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "8h" }); // Token expires in 8 hours
                res.json({ user, token });
            } catch (error) {
                console.error("Login error:", error); // Log the error for debugging
                res.status(500).json({ error: error.message || "An unexpected error occurred during login." }); // Use 500 for server errors
            }
        },
        // New logout endpoint for JWT (optional but good practice)
        // For JWTs, logout is primarily client-side token deletion.
        // This server-side endpoint could be used for blacklist/revocation if you implement that.
        logout: (req, res) => {
            // With JWTs, there's no server-side session to destroy in the traditional sense.
            // "Logout" here means simply instructing the client to delete its token.
            // If you implement token blacklisting/revocation (more complex for JWTs),
            // this is where you'd add the token to a blacklist.
            res.status(200).json({ message: 'Logged out successfully (client should delete token).' });
        },

        // A new endpoint to check if the token is still valid (protected endpoint)
        checkToken: (req, res) => {
            // If verifyToken middleware passed, the token is valid
            // You can return user details or a simple success message
            res.json({ message: 'Token is valid', userId: req.userId });
        }
    };
};
