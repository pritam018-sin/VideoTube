import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.Middleware.js";
import {
    getSubscribedChannels,
    toggleSubscription
} from "../controllers/subscription.Controller.js";

const router = Router();

router.route("/:channelId/subscribe").post(
    verifyJWT,
    toggleSubscription
);
router.route("/:channelId/subscriptions").get(
    verifyJWT,
    getSubscribedChannels
);
export default router;
