const { Op } = require("sequelize");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const os = require("os");

const { User, Profile, ProfilePhoto } = require('../models');

let io;

module.exports = (_io) => {
    io = _io;

    return {
        login: async (req, res) => {
            const { username, password } = req.body;
            try {
                const user = await User.findOne({
                    where: { 
                        username,
                        role: {
                            [Op.in]: ['SuperAdmin', 'Admin', 'Management', 'HR', 'Finance']
                        }
                    }
                });
                if (!user) {
                    return res.status(404).json({
                        errors: [
                            {
                                type: "field",
                                value: username,
                                msg: "User not found",
                                path: "username",
                                location: "body",
                            },
                        ],
                    });
                }
                if (user.status === 'Suspended') {
                    return res.status(404).json({
                        errors: [
                            {
                                type: "field",
                                value: username,
                                msg: "Account suspended. Please contact administrator.",
                                path: "username",
                                location: "body",
                            },
                        ],
                    });
                }

                const today = new Date().toDateString();
                const lastFailed = user.lastFailedLogin ? new Date(user.lastFailedLogin).toDateString() : null;
                
                if (lastFailed !== today) {
                    user.failedLoginAttempts = 0;
                    await user.save();
                }

                const isMatch = await bcrypt.compare(password, user.password);
                if (!isMatch) {
                    user.failedLoginAttempts += 1;
                    user.lastFailedLogin = new Date();

                    if (user.failedLoginAttempts >= 4) {
                        user.status = 'suspended'; // suspend account on 4th failure
                        await user.save();
                        return res.status(401).json({
                            errors: [
                                {
                                    type: "field",
                                    value: username,
                                    msg: "Account suspended due to multiple failed attempts! Please contact administrator.",
                                    path: "username",
                                    location: "body",
                                }
                            ],
                        });
                    }

                    await user.save();
                    return res.status(401).json({
                        errors: [
                            {
                                type: "field",
                                value: username,
                                msg: `Invalid credentials. ${3 - user.failedLoginAttempts} attempts remaining.`,
                                path: "username",
                                location: "body",
                            }
                        ],
                    });
                }

                user.failedLoginAttempts = 0;
                await user.save();

                const profile = await User.findOne({
                    where: {
                        id: user.id
                    },
                    attributes: [
                        'id', 'username', 'name', 'role', 'status', 'avatar'
                    ]
                })
                const token = jwt.sign({ 
                    id: user.id,
                    role: user.role
                }, process.env.JWT_SECRET, { 
                    expiresIn: "8h" 
                });
                res.json({ 
                    user: profile, 
                    token 
                });
            } catch (error) {
                console.error("Login error:", error); // Log the error for debugging
                res.status(500).json({ error: error.message || "An unexpected error occurred during login." }); // Use 500 for server errors
            }
        },
        EmployeeLogin: async (req, res) => {
            const { username, password } = req.body;
            try {
                const user = await User.findOne({
                    where: { 
                        username,
                        role: 'Employee'
                    }
                });
                if (!user) {
                    return res.status(404).json({
                        errors: [
                            {
                                type: "field",
                                value: username,
                                msg: "User not found",
                                path: "username",
                                location: "body",
                            },
                        ],
                    });
                }
                if (user.status === 'Suspended') {
                    return res.status(404).json({
                        errors: [
                            {
                                type: "field",
                                value: username,
                                msg: "Account suspended. Please contact administrator.",
                                path: "username",
                                location: "body",
                            },
                        ],
                    });
                }

                const today = new Date().toDateString();
                const lastFailed = user.lastFailedLogin ? new Date(user.lastFailedLogin).toDateString() : null;
                
                if (lastFailed !== today) {
                    user.failedLoginAttempts = 0;
                    await user.save();
                }

                const isMatch = await bcrypt.compare(password, user.password);
                if (!isMatch) {
                    user.failedLoginAttempts += 1;
                    user.lastFailedLogin = new Date();

                    if (user.failedLoginAttempts >= 4) {
                        user.status = 'suspended'; // suspend account on 4th failure
                        await user.save();
                        return res.status(401).json({
                            errors: [
                                {
                                    type: "field",
                                    value: username,
                                    msg: "Account suspended due to multiple failed attempts! Please contact administrator.",
                                    path: "username",
                                    location: "body",
                                }
                            ],
                        });
                    }

                    await user.save();
                    return res.status(401).json({
                        errors: [
                            {
                                type: "field",
                                value: username,
                                msg: `Invalid credentials. ${3 - user.failedLoginAttempts} attempts remaining.`,
                                path: "username",
                                location: "body",
                            }
                        ],
                    });
                }

                user.failedLoginAttempts = 0;
                await user.save();

                const profile = await User.findOne({
                    where: {
                        id: user.id
                    },
                    include: [
                        {
                            model: Profile,
                            as: 'profile',
                            attributes: [
                                'firstname', 'middlename', 'lastname', 'suffix'
                            ],
                            include: [
                                {
                                    model: ProfilePhoto,
                                    as: 'photos',
                                    attributes: [
                                        'file'
                                    ]
                                }
                            ]
                        }
                    ],
                    attributes: [
                        'id', 'username', 'role', 'status'
                    ]
                })
                const token = jwt.sign({ 
                    id: user.id,
                    role: user.role
                }, process.env.JWT_SECRET, { 
                    expiresIn: "8h" 
                });
                res.json({ 
                    user: profile, 
                    token 
                });
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
