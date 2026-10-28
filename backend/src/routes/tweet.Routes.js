import { Router } from "express";
import { verifyJWT, optionalJWT } from '../middlewares/auth.Middleware.js';
import { 
    createTweet,
    deleteTweet,
    getAllTweets,
    getTweet,
    getUserTweets,
    updateTweet
 } from "../controllers/tweet.Controller.js";
import { toggleLike } from "../controllers/toggleLike.Controller.js";

const router = Router();

router.route('/create-tweet').post(verifyJWT, createTweet);
router.route('/update-tweet/:tweetId').put(verifyJWT, updateTweet);   
router.route('/delete-tweet/:tweetId').delete(verifyJWT, deleteTweet);  
router.route('/user-tweets/:userId').get(optionalJWT, getUserTweets);
router.route('/all-tweets').get(optionalJWT, getAllTweets);
router.route('/:id').get(optionalJWT, getTweet);

router.route('/:id/like').post(verifyJWT, toggleLike("tweet"));
router.route('/like/:id').post(verifyJWT, toggleLike("tweet"));
router.route('/:tweetId/like').post(verifyJWT, toggleLike("tweet"));
router.route('/like/:tweetId').post(verifyJWT, toggleLike("tweet"));

export default router;