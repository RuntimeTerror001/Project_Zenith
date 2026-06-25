"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = require("../models/User");
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_cosmos_key_zenith_12345';
class AuthController {
    static async register(req, res) {
        try {
            const { email, password, name } = req.body;
            if (!email || !password || !name) {
                return res.status(400).json({ message: 'Email, password, and name are required.' });
            }
            if (password.length < 6) {
                return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
            }
            const existingUser = await User_1.User.findOne({ email });
            if (existingUser) {
                return res.status(409).json({ message: 'A user with this email address already exists.' });
            }
            const salt = await bcryptjs_1.default.genSalt(10);
            const passwordHash = await bcryptjs_1.default.hash(password, salt);
            const user = new User_1.User({
                email,
                passwordHash,
                name
            });
            await user.save();
            const token = jsonwebtoken_1.default.sign({ userId: user._id.toString() }, JWT_SECRET, { expiresIn: '7d' });
            return res.status(201).json({
                token,
                user: {
                    id: user._id.toString(),
                    email: user.email,
                    name: user.name,
                    createdAt: user.createdAt
                }
            });
        }
        catch (error) {
            console.error('Registration error:', error);
            return res.status(500).json({ message: 'Server error during user registration.' });
        }
    }
    static async login(req, res) {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                return res.status(400).json({ message: 'Email and password are required.' });
            }
            const user = await User_1.User.findOne({ email });
            if (!user) {
                return res.status(401).json({ message: 'Invalid email or password.' });
            }
            const isMatch = await bcryptjs_1.default.compare(password, user.passwordHash);
            if (!isMatch) {
                return res.status(401).json({ message: 'Invalid email or password.' });
            }
            const token = jsonwebtoken_1.default.sign({ userId: user._id.toString() }, JWT_SECRET, { expiresIn: '7d' });
            return res.json({
                token,
                user: {
                    id: user._id.toString(),
                    email: user.email,
                    name: user.name,
                    createdAt: user.createdAt
                }
            });
        }
        catch (error) {
            console.error('Login error:', error);
            return res.status(500).json({ message: 'Server error during authentication login.' });
        }
    }
    static async getMe(req, res) {
        try {
            if (!req.userId) {
                return res.status(401).json({ message: 'Not authenticated.' });
            }
            const user = await User_1.User.findById(req.userId);
            if (!user) {
                return res.status(404).json({ message: 'User profile not found.' });
            }
            return res.json({
                id: user._id.toString(),
                email: user.email,
                name: user.name,
                createdAt: user.createdAt
            });
        }
        catch (error) {
            console.error('Profile fetch error:', error);
            return res.status(500).json({ message: 'Server error fetching user profile.' });
        }
    }
    static async updateProfile(req, res) {
        try {
            if (!req.userId) {
                return res.status(401).json({ message: 'Not authenticated.' });
            }
            const { name, password } = req.body;
            const user = await User_1.User.findById(req.userId);
            if (!user) {
                return res.status(404).json({ message: 'User not found.' });
            }
            if (name) {
                user.name = name;
            }
            if (password) {
                if (password.length < 6) {
                    return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
                }
                const salt = await bcryptjs_1.default.genSalt(10);
                user.passwordHash = await bcryptjs_1.default.hash(password, salt);
            }
            await user.save();
            return res.json({
                id: user._id.toString(),
                email: user.email,
                name: user.name,
                createdAt: user.createdAt
            });
        }
        catch (error) {
            console.error('Profile update error:', error);
            return res.status(500).json({ message: 'Server error updating user profile.' });
        }
    }
}
exports.AuthController = AuthController;
