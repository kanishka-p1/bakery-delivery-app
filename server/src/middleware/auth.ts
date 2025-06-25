import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

export interface AuthRequest extends Request {
    user?: {
        id: string;
        email: string;
        role: string;
    };
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ success : false, message: 'No token provided, authorization denied.' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const secret = process.env.JWT_SECRET;
        if (!secret) throw new Error('JWT secret not set');

        const decoded = jwt.verify(token, secret) as JwtPayload & { id: string; email: string; role: string };
        req.user = {
            id: decoded.id,
            email: decoded.email,
            role: decoded.role,
        };
        next();
    } catch (error) {
        return res.status(401).json({ success : false, message: 'Invalid or expired token.' });
    }
};

export const isAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        if (req.user?.role !== 'admin') {
            return res.status(403).json({ success : false, message: 'Admin access required.' });
        }
        next();
    }
    catch (error) {
        console.log(error)
        return res.status(500).json({
            success: false,
            message: 'User role cannot be verified'
        })
    }
    
};
