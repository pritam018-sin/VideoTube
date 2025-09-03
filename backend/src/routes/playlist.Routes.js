import {Router} from 'express';
import { verifyJWT } from '../middlewares/auth.Middleware.js';
import {
    addVideoToPlayList,
    createPlayList,
    deletePlayList,
    getSinglePlayList,
    getUserAllPlayLists,
    removeVideoFromPlayList,
    updatePlayList
} from '../controllers/playlist.Controller.js';

const router = Router();

router.route('/').post(verifyJWT, createPlayList);
router.route('/:playlistId').put(verifyJWT, updatePlayList);
router.route('/:playlistId').delete(verifyJWT, deletePlayList);
router.route("/:playlistId/videos/:videoId").post(verifyJWT, addVideoToPlayList);
router.route("/:playlistId/videos/:videoId").delete(verifyJWT, removeVideoFromPlayList);
router.route("/:userId/playlist").get(verifyJWT, getUserAllPlayLists);
router.route("/:playlistId").get(verifyJWT, getSinglePlayList);


export default router;
