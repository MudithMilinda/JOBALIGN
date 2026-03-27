import jwt from "jsonwebtoken";

export const protect = (req, res, next) => {
  // Authorization: Bearer <token>
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ msg: "No token, unauthorized" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id: "..." }
    next();
  } catch (err) {
    return res.status(401).json({ msg: "Token invalid or expired" });
  }
};