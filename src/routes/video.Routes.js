import {Router} from 'express';
import { verifyJWT } from '../middlewares/auth.Middleware.js';
import { upload } from '../middlewares/mutler.Middleware.js';
import {  uploadContent } from '../controllers/video.Controller.js';
const router = Router();

// ✅ Upload video (with thumbnail)
router.route("/upload-content").post(
    verifyJWT, // sirf logged-in user hi upload kar sake
    upload.fields([
        {
            name: "video",
            maxCount: 1,
        },
        {
            name: "thumbnail",
            maxCount: 1,
        },
    ]),
    uploadContent
);

export default router;