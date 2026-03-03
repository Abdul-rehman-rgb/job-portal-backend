import jwt from "jsonwebtoken";

const isAuthenticated = async (req, res, next) => {
    try {
        const token = req.cookies.token;
        if (!token) {
            return res.status(401).json({
                message: "User not authenticated",
                success: false,
            });
        }

        // Token verify karein
        const decode = await jwt.verify(token, process.env.JWT_SECRET);

        if (!decode) {
            return res.status(401).json({
                message: "Invalid token",
                success: false
            });
        }

        // Request object mein userId set karein taaki controller use kar sake
        req.id = decode.userId;
        next();
    } catch (error) {
        console.log("Auth Middleware Error:", error);
        return res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
}

export default isAuthenticated;