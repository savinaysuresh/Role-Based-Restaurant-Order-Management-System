const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const requireAuth = async (req, res, next) => {
  const { authorization } = req.headers;
  if (!authorization) {
    return res.status(401).json({ error: "Authorization token required" });
  }
  const token = authorization.split(" ")[1];
  try {
    const { _id } = jwt.verify(token, process.env.SECRET);
    req.user = await User.findOne({ _id }).select("_id RID role");
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    return res.status(401).json({ error: "Request is not authorized" });
  }
};

// Role restriction middleware
const restrictTo = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user?.role) {
      return res.status(403).json({ error: "User role not available" });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Access forbidden. Required roles: ${allowedRoles.join(", ")}`,
      });
    }

    next();
  };
};

module.exports = { requireAuth, restrictTo };
