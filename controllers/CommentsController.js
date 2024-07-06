import CommentsModel from "../models/Comments.js";
import PostModel from "../models/Post.js";

export const getCommentsById = async (req, res) => {
    try {
        const { postId } = req.query; // Получаем postId из query parameters

        console.log(postId, 'post id');

        const doc = await CommentsModel.find({ post: postId })
            .populate({
                    path: 'user', // Заполняем пользователя внутри комментариев
                    select: 'fullName avatarUrl' // Выбираем поля пользователя
                })
            .exec();

        console.log(doc, 'comments');

        res.json(doc);
    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: 'Не удалось вернуть комментарии',
        });
    }
};


export const remove = async (req, res) => {
    try {
        const commentId = req.params.id;

        const doc = await CommentsModel.findOneAndDelete({
            _id: commentId
        })

        if (!doc) {
            console.log(err);
            return res.status(500).json({
                message: 'Комментарие не найдена'
            });
        }

        res.json({
            success: true
        })
    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: 'Не удалось удалить коммент'
        });
    }
}

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
