import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema({
    subscriber: {
        type: mongoose.Schema.Types.ObjectId, //ONE WHO IS SUBSCRIBING
        ref: "User"
    },
    channel: {
        type: mongoose.Schema.Types.ObjectId, //one whom 'subscriber' is subscribing to
        ref: "User",
    }

}, 
{
    timestamps: true // This will add createdAt and updatedAt fields
}
);

const Subscription = mongoose.model("Subscription", subscriptionSchema);

export { Subscription };
