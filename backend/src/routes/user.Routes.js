import {Router} from 'express';
import {  addToWatchHistory, changeCurrentPassword,
          getCurrentUser,
          getUserChannelProfile,
          getWatchHistory,
          loginUser,
          logoutUser,
          refreshAccessToken,
          registerUser,
          updateAccountDetails,
          updateUserAvatar,
          updateUserCoverImage
} from '../controllers/user.Controller.js';
import { upload } from '../middlewares/mutler.Middleware.js';
import { verifyJWT } from '../middlewares/auth.Middleware.js';

const router = Router();
router.route('/register').post(
    upload.fields([
        { 
            name: 'avatar',
            maxCount: 1
        },
        { 
            name: 'coverImage',
            maxCount: 1
        }
    ]),
    registerUser
);
router.route('/login').post(loginUser);

//secured Routes
router.route('/logout').post(verifyJWT, logoutUser);
router.route('/refresh-token').post(refreshAccessToken);
router.route('/change-password').post(verifyJWT, changeCurrentPassword);
router.route('/current-user').get(verifyJWT, getCurrentUser);
router.route('/update-account-details').patch(verifyJWT, updateAccountDetails);
router.route('/update-avatar').patch(verifyJWT,upload.single('avatar'), updateUserAvatar);
router.route('/update-cover-image').patch(verifyJWT, upload.single('coverImage'), updateUserCoverImage);
router.route('/channel/:username').get(verifyJWT, getUserChannelProfile);
router.route('/watch-history').get(verifyJWT, getWatchHistory);
router.route('/watch-history').post(verifyJWT, addToWatchHistory);

export default router;