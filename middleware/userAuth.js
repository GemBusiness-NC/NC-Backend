import jwt from 'jsonwebtoken';

// Middleware to authenticate user
const userAuth = async (req, res, next) => {
  const { token } = req.cookies;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this website',
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded?.id) {
      req.body.userId = decoded.id;
      req.user = decoded; // Attach entire decoded user (includes isAdmin)
      next();
    } else {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this website',
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
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

