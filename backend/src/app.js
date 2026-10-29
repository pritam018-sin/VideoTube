import express from 'express';
import cors from "cors";

import cookieParser from "cookie-parser";

const app = express();

const corsOptions = {
    origin: function (origin, callback) {
        callback(null, true);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept", "Origin"],
    exposedHeaders: ["Set-Cookie"]
};

app.use(cors(corsOptions));
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

    if (err.name === "MulterError") {
        if (err.code === "LIMIT_FILE_SIZE") {
            statusCode = 413;
            message = "File exceeds maximum allowed upload size (500MB). Please select a smaller file.";
        } else {
            statusCode = 400;
            message = `Upload error: ${err.message}`;
        }
    }

    if (req.headers.origin) {
        res.setHeader("Access-Control-Allow-Origin", req.headers.origin);
        res.setHeader("Access-Control-Allow-Credentials", "true");
    }

    return res.status(statusCode).json({
        statusCode,
        success: false,
        message,
        errors: err.errors || []
    });
});

export default app;
