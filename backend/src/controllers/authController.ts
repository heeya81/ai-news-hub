import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'your-refresh-secret-key';

const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
};

const accessTokenOptions = {
    ...cookieOptions,
    maxAge: 15 * 60 * 1000 // 15 mins
};

export const register = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, error: 'Email and password are required' });
        }

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ success: false, error: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                profile: {
                    create: {
                        keywords: JSON.stringify([]),
                        sources: JSON.stringify([])
                    }
                }
            }
        });

        res.status(201).json({ success: true, message: 'User created successfully' });
    } catch (error) {
        console.error('Registration Error:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }

        // Generate Tokens
        const accessToken = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '15m' });
        const refreshToken = jwt.sign({ userId: user.id }, REFRESH_TOKEN_SECRET, { expiresIn: '7d' });

        // Save Refresh Token to DB
        await prisma.refreshToken.create({
            data: {
                token: refreshToken,
                userId: user.id,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            }
        });

        // Set Cookies
        res.cookie('accessToken', accessToken, accessTokenOptions);
        res.cookie('refreshToken', refreshToken, cookieOptions);

        res.json({
            success: true,
            user: { id: user.id, email: user.email }
        });
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};

export const refresh = async (req: Request, res: Response) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) return res.status(401).json({ success: false, error: 'Refresh token required' });

        const savedToken = await prisma.refreshToken.findUnique({
            where: { token: refreshToken }
        });

        if (!savedToken || savedToken.expiresAt < new Date()) {
            if (savedToken) await prisma.refreshToken.delete({ where: { id: savedToken.id } });
            res.clearCookie('accessToken');
            res.clearCookie('refreshToken');
            return res.status(401).json({ success: false, error: 'Invalid or expired refresh token' });
        }

        try {
            const decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET) as any;
            const newAccessToken = jwt.sign({ userId: decoded.userId }, JWT_SECRET, { expiresIn: '15m' });

            res.cookie('accessToken', newAccessToken, accessTokenOptions);
            res.json({ success: true });
        } catch (err) {
            await prisma.refreshToken.delete({ where: { id: savedToken.id } });
            res.clearCookie('accessToken');
            res.clearCookie('refreshToken');
            return res.status(401).json({ success: false, error: 'Invalid refresh token' });
        }
    } catch (error) {
        console.error('Refresh Error:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};

export const logout = async (req: Request, res: Response) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        if (refreshToken) {
            await prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
        }
        res.clearCookie('accessToken');
        res.clearCookie('refreshToken');
        res.json({ success: true, message: 'Logged out successfully' });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};

export const changePassword = async (req: any, res: Response) => {
    try {
        const userId = req.userId;
        const { currentPassword, newPassword } = req.body;

        if (!userId) return res.status(401).json({ success: false, error: 'Unauthorized' });

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) return res.status(404).json({ success: false, error: 'User not found' });

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) return res.status(400).json({ success: false, error: 'Incorrect current password' });

        const hashedNewPassword = await bcrypt.hash(newPassword, 10);
        await prisma.user.update({
            where: { id: userId },
            data: { password: hashedNewPassword }
        });

        // Optional: Logout other sessions by clearing all refresh tokens
        await (prisma as any).refreshToken.deleteMany({ where: { userId } });

        res.json({ success: true, message: 'Password updated successfully' });
    } catch (error) {
        console.error('Change Password Error:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};
