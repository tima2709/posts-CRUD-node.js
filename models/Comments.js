import mongoose from "mongoose";

const CommentsSchema = new mongoose.Schema (
    {
        title: {
            type: String
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        post: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Post',
            required: true,
        },
    },
    {
        timestamps: true,
    },
)

export default mongoose.model('Comments', CommentsSchema)