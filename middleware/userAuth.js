import jwt from 'jsonwebtoken';

// Middleware to authenticate user
const userAuth = async (req, res, next) => {
  // Check for token in cookies
  const cookieToken = req.cookies?.token;
  
  // Check for token in Authorization header
  const authHeader = req.headers.authorization;
  const bearerToken = authHeader && authHeader.startsWith('Bearer ') 
    ? authHeader.substring(7) // Remove 'Bearer ' prefix
    : null;
    
  // Use either cookie token or bearer token
  const token = cookieToken || bearerToken;

  if (!token) {
    return res.status(401).json({
      message: 'Unauthorized', // Simplified error message
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded?.id) {
      req.body.userId = decoded.id;
      req.user = decoded; // Attach entire decoded user (includes id, email, isAdmin)
      next();
    } else {
      return res.status(401).json({
        message: 'Unauthorized',
      });
    }
  } catch (error) {
    console.error('Auth error:', error);
    return res.status(401).json({
      message: 'Unauthorized',
    });
  }
};

// Middleware to check if the user is an admin
export const isAdminMiddleware = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authenticated' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded.isAdmin) {
      return res.status(403).json({ success: false, message: 'Access denied: Admins only' });
    }

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(400).json({ success: false, message: 'Invalid token' });
  }
};

export default userAuth;

