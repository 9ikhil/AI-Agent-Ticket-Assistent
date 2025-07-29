import jwt from "jsonwebtoken";

export const authentication = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized" });
  try {
    const decodes = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decodes; 
    // This makes the user data available to 
    // subsequent middleware functions or route handlers in the request-response cycle.
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
};
