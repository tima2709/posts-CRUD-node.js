import CommentsModel from "../models/Comments.js";
import PostModel from "../models/Post.js";

export const createComments = async (req, res) => {
    try {
        const { title, postId } = req.body;

        if (!postId) {
            return res.status(400).json({
                message: 'Post ID is required',
            });
        }

        const doc = new CommentsModel({
            title: title,
            user: req.userId,
            post: postId,
        });

        const comments = await doc.save();

        // Добавляем комментарий к посту
        await PostModel.findByIdAndUpdate(
            postId,
            { $push: { comments: comments._id } },
            { new: true, useFindAndModify: false }
        );

        res.json(comments);
    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: 'Не удалось создать комментарий',
        });
    }
};
