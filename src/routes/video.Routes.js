import {Router} from 'express';
import { verifyJWT } from '../middlewares/auth.Middleware.js';
import { upload } from '../middlewares/mutler.Middleware.js';
import { 
    addComment,
        deleteComment,
        deleteVideo,
        getAllVideos,
        getUserVideos,
        getVideoById,
        toggleLikeVideo,
        togglePublish, 
        updateVideo,
        updateVideoThumbnail,
        uploadContent
    } from '../controllers/video.Controller.js';
import { get } from 'mongoose';
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
router.route("/update-video/:id").put(
    verifyJWT,
    updateVideo
);
router.route("/update-thumbnail/:id").put(
    verifyJWT,
    upload.single("thumbnail"),
    updateVideoThumbnail
);
router.route("/toggle-publish/:id").put(
    verifyJWT,
    togglePublish
);
router.route("/delete-video/:id").delete(
    verifyJWT,
    deleteVideo
);
router.route("/all-videos").get(getAllVideos);
router.route("/:id").get(getVideoById);
router.route("/user-videos/:id").get(getUserVideos);

router.route("/like/:id").post(
    verifyJWT,
    toggleLikeVideo
);

router.route("/:id/comments").post(
    verifyJWT,
    addComment
);

router.route("/:id/comments/:commentId").delete(
    verifyJWT,
    deleteComment
);

export default router;