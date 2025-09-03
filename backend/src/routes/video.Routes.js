import {Router} from 'express';
import { verifyJWT } from '../middlewares/auth.Middleware.js';
import { upload } from '../middlewares/mutler.Middleware.js';
import { 
        deleteVideo,
        getAllVideos,
        getUserVideos,
        getVideoById,
        togglePublish, 
        updateVideo,
        updateVideoThumbnail,
        uploadContent
    } from '../controllers/video.Controller.js';
import { toggleLike } from '../controllers/toggleLike.Controller.js';
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
router.route("/:id/like").post(verifyJWT, toggleLike("video"));
router.route("/user-videos/:id").get(getUserVideos);

// router.route("/like/:id").post(
//     verifyJWT,
//     toggleLikeVideo
// );


export default router;