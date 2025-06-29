import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import otpGenerator from 'otp-generator';
import OTP from '../models/OTP';
import User, { IUser } from '../models/User';
import { sendEmail } from '../utils/mailer';

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
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ success: false, message: 'Email is required' });
        }

        const existingUser = await User.findOne({ email });

        if (!existingUser) {
            return res.status(404).json({ success: false, message: 'User not found with this email' });
        }

        // Generate secure 6-digit numeric OTP
        const otp = otpGenerator.generate(6, { upperCaseAlphabets: false, specialChars: false, lowerCaseAlphabets: false });

        // Save OTP to DB
        await OTP.create({ email, otp });

        // Send OTP via email
        await sendEmail(email, 'Your OTP Code', `Your OTP for password reset is: ${otp}`);

        res.status(200).json({
            success: true,
            message: 'OTP sent to your email'
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to send OTP',
            error: (error as Error).message
        });
    }
};

export const forgotPassword = async (req: Request, res: Response) => {
    try {
        const { email } = req.body;

        if(!email) {
            return res.status(400).json({
                success: false,
                message: 'Email is required'
            });
        }

        const user = await User.findOne({ email });

        if(!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        user.resetLink = resetToken;
        await user.save();

        const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;

        await sendEmail(user.email, 'Password Reset', `Click this link to reset your password: ${resetUrl}`);

        res.status(200).json({
            success: true,
            message: 'Reset password link sent to your email',
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error sending reset link',
            error: (error as Error).message,
        });
    }
};

export const resetPassword = async (req: Request, res: Response) => {
    try {
        const { token, newPassword } = req.body;

        if (!token || !newPassword) {
            return res.status(400).json({ success: false, message: 'Token and new password are required' });
        }

        const user = await User.findOne({ resetLink: token });

        if (!user) {
            return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.passwordHash = hashedPassword;
        user.resetLink = undefined;
        await user.save();

        res.status(200).json({ success: true, message: 'Password reset successfully' });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error resetting password',
            error: (error as Error).message,
        });
    }
};
