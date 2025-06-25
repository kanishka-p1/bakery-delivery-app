import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User';
import OTP from '../models/OTP';

// Utility function to generate JWT
const generateToken = (user: IUser) => {
    return jwt.sign(
        { id: user._id, email: user.email, role: user.role },
        process.env.JWT_SECRET as string,
        { expiresIn: '1d' }
    );
};

// Register a new user
export const registerUser = async (req: Request, res: Response) => {
    try {
        const { firstName, lastName, email, password, otp } = req.body;
        if (!firstName || !lastName || !email || !password || !otp) {
            return res.status(403).json({
                success: false,
                message: 'All fields are required'
            })
        }
        const existingUser = await User.findOne({ email });
        if (existingUser)
            return res.status(400).json({ success: false, message: 'User already exists with this email.' });
        const recentOtp = await OTP.find({ email }).sort({ createdAt: -1 }).limit(1);
        if (recentOtp.length == 0) {
            return res.status(400).json({
                success: false,
                message: 'OTP not found'
            })
        }
        else if (otp !== recentOtp[0].otp) {
            return res.status(400).json({
                success: false,
                message: 'Invalid OTP'
            })
        }
        const passwordHash = await bcrypt.hash(password, 10);

        const user = await User.create({
            email,
            firstName,
            lastName,
            passwordHash,
            role: 'customer',
            isAccountVerified: true,
        });

        res.status(201).json({
            success: true,
            message: "User Registered Successfully",
            User: user
        });
    } catch (error) {
        res.status(500).json({ message: 'Registration failed', error: (error as Error).message });
    }
};

// Login
export const loginUser = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        if(!email || !password) {
            return res.status(403).json({
                success : false,
                message : "All fields are required"
            })
        }
        const user = await User.findOne({ email });
        if (!user)
            return res.status(401).json({ success : false, message: 'Invalid email.' });

        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch)
            return res.status(401).json({ success : false, message: 'Invalid password.' });

        const token = generateToken(user);

        res.json({
            success : true,
            message : "User has been logged in successfully",
            token,
            user: {
                id: user._id,
                email: user.email,
                role: user.role,
            },
        });
    } catch (error) {
        res.status(500).json({ message: 'Login failed', error: (error as Error).message });
    }
};

export const sendotp = async (req: Request, res: Response) => {
    try {
        
    } catch (error) {
        
    }
};

export const forgotPassword = async (req: Request, res: Response) => {
    try {
        
    } catch (error) {
        
    }
};
