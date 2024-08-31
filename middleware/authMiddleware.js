import JWTService from "../services/JWTService.js";

const authMiddleware = async (req, res, next) => {
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

export default authMiddleware;
