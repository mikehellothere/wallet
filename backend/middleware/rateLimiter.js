import ratelimit from "../config/upstash.js";

const rateLimiter = async (req, res, next) => {
    try {
        const { success } = await ratelimit.limit("my-rate-limit");

        if (!success) {
            return res.status(429).json({ 
                message: "Too many requests, please try again later.", 
            });
        }

        next();
    } catch (error) {
        console.error("Rate limiter error:", error);
        next(error);
    }
};

export default rateLimiter;
// This middleware checks the rate limit for incoming requests.
// If the limit is exceeded, it responds with a 429 status code.
// If the request is within the limit, it calls the next middleware or route handler.
// Usage:
// app.use(rateLimiter);
// This middleware should be applied to routes where you want to enforce rate limiting.
// Make sure to import and use this middleware in your server setup file (e.g., server.js).
// Example:
// import rateLimiter from './middleware/rateLimiter.js';
// app.use(rateLimiter);
// This code is a rate limiter middleware for an Express.js application.        