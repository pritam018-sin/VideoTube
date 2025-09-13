import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.Middleware.js";
import {
    addComment,
    deleteComment,
    getVideoComments,
    updateComment
} from "../controllers/comment.Controller.js";
import { toggleLike } from "../controllers/toggleLike.Controller.js";
import { Comment } from "../models/comment.Model.js";

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
    verifyJWT,
    getVideoComments
);
router.route("/:commentId/like").post(
    verifyJWT,
    toggleLike(Comment)
);
export default router;