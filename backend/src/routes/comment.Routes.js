import { Router } from "express";
import { verifyJWT, optionalJWT } from "../middlewares/auth.Middleware.js";
import {
    addComment,
    deleteComment,
    getVideoComments,
    updateComment
} from "../controllers/comment.Controller.js";
import { toggleLike } from "../controllers/toggleLike.Controller.js";

const router = Router();

router.route("/:videoId/comment").post(
    verifyJWT,
    addComment
);
router.route("/:videoId/comments/:commentId").delete(
    verifyJWT,
    deleteComment
);
router.route("/:videoId/comments/:commentId").put(
    verifyJWT,
    updateComment
);
router.route("/:videoId/video-comments").get(
    optionalJWT,
    getVideoComments
);
router.route("/:commentId/like").post(
    verifyJWT,
    toggleLike("comment")
);
router.route("/like/:commentId").post(
    verifyJWT,
    toggleLike("comment")
);
router.route("/:id/like").post(
    verifyJWT,
    toggleLike("comment")
);

export default router;