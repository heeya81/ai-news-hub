import jwt from 'jsonwebtoken';
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
export const authMiddleware = (req, res, next) => {
    // Try to get token from cookie first, then fall back to Authorization header
    let token = req.cookies.accessToken;
    if (!token) {
        const authHeader = req.headers['authorization'];
        token = authHeader && authHeader.split(' ')[1];
    }
    if (!token) {
        return res.status(401).json({ success: false, error: 'Unauthorized: No token provided' });
    }
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        if (decoded && typeof decoded === 'object' && 'userId' in decoded) {
            req.userId = decoded.userId;
        }
        next();
    }
    catch (error) {
        console.error('JWT Verification Error:', error);
        return res.status(401).json({ success: false, error: 'Invalid token' });
    }
};
