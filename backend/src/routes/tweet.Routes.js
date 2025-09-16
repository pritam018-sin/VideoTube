import { Router } from "express";
import { verifyJWT } from '../middlewares/auth.Middleware.js';
import { 
    createTweet,
    deleteTweet,
    getAllTweets,
    getTweet,
    getUserTweets,
    updateTweet
 } from "../controllers/tweet.Controller.js";

const router = Router();

router.route('/create-tweet').post(verifyJWT, createTweet)
router.route('/update-tweet/:tweetId').put(verifyJWT, updateTweet)   
router.route('/delete-tweet/:tweetId').delete(verifyJWT, deleteTweet)  
router.route('/user-tweets/:userId').get(verifyJWT, getUserTweets)
router.route('/all-tweets').get(verifyJWT, getAllTweets)
router.route('/:id').get(verifyJWT, getTweet)
export default router;