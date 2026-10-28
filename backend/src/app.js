import express from 'express';
import cors from "cors";

import cookieParser from "cookie-parser";

const app = express();

const allowedOrigins = [
    process.env.CORS_ORIGIN,
    "http://localhost:5173",
    "http://localhost:3000"
].filter(Boolean).map((o) => o.replace(/\/$/, ""));

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes("*")) {
            return callback(null, true);
        }
        return callback(null, true);
    },
    credentials: true
}));
app.use(express.json({limit: '30kb'}));
app.use(express.urlencoded({extended: true, limit: '30kb'}));
app.use(express.static("public"));// Serve static files from the 'public' directory
app.use(cookieParser());

//Routes
import userRouter from './routes/user.Routes.js';
import videoRouter from './routes/video.Routes.js';
import commentRouter from './routes/comment.Routes.js';
import subscriptionRouter from './routes/subcription.routes.js';
import playListRouter from './routes/playlist.Routes.js';
import tweetRouter from './routes/tweet.Routes.js';


app.use('/api/v1/users', userRouter);
app.use('/api/v1/videos', videoRouter);
app.use('/api/v1/comments', commentRouter);
app.use('/api/v1/playlists', playListRouter);
app.use('/api/v1/subscriptions', subscriptionRouter);
app.use('/api/v1/tweets', tweetRouter);

// Global Error Handler Middleware
app.use((err, req, res, next) => {
    let statusCode = err.statusCode || 500;
    let message = err.message || "Internal Server Error";

    if (err.name === "MulterError" && err.code === "LIMIT_FILE_SIZE") {
        statusCode = 413;
        message = "File exceeds maximum allowed upload size (500MB). Please select a smaller file.";
    }

    return res.status(statusCode).json({
        statusCode,
        success: false,
        message,
        errors: err.errors || []
    });
});

export default app;
