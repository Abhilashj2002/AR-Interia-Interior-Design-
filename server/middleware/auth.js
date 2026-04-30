import jwt from 'jsonwebtoken';

const isProduction = process.env.NODE_ENV === 'production';
const envJwtSecret = String(process.env.JWT_SECRET || '').trim();

if (isProduction && (!envJwtSecret || envJwtSecret === 'dev-secret-change-me')) {
  throw new Error('Missing required production secret: JWT_SECRET');
}

const JWT_SECRET = envJwtSecret || 'dev-secret-change-me';

export const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized - No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.error('[Auth Middleware] Token verification failed:', error.message);
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};

export const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
    } catch (error) {
      // Token invalid, but continue as guest
      req.user = null;
    }
  } else {
    req.user = null;
  }
  
  next();
};
