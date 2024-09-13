import JWTService from "../services/JWTService.js";

export const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Token is missing or invalid",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const { _id, role, adminId } = await JWTService.verify(token);
    const user = {
      _id,
      role
    };

    if (adminId) {
      user.adminId = adminId;
    }

    req.user = user;
    next();
  } catch (err) {
    console.error("Token verification failed:", err.message);
    return res.status(401).json({
      success: false,
      message: "Unauthorized: Invalid or expired token",
    });
  }
};

export const checkAdminRole = (req, res, next) => {
  // Assuming `req.user` contains the user's information after authentication
  if (req.user && req.user.role === 'admin') {
    // If the user is an admin, proceed to the next middleware/controller
    next();
  } else {
    // If the user is not an admin, return a 403 Forbidden error
    return res.status(403).json({ message: 'Access denied. Admins only.' });
  }
};
