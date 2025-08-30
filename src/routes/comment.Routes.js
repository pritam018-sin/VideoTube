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

router.route("/:id/comment").post(
    verifyJWT,
    addComment
);
router.route("/:id/comments/:commentId").delete(
    verifyJWT,
    deleteComment
);
router.route("/:id/comments/:commentId").put(
    verifyJWT,
    updateComment
);
router.route("/:id/video-comments").get(
    verifyJWT,
    getVideoComments
);
router.route("/:id/like").post(
    verifyJWT,
    toggleLike(Comment)
);
export default router;