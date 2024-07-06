import PostModel from '../models/Post.js';

export const getLastTags = async (req, res) => {
    try {
        const posts = await PostModel.find().limit(5).exec();

        const tags = posts
            .map((obj) => obj.tags)
            .flat()
            .slice(0, 5)

        res.json(tags)
    } catch (err) {
        console.log(err)
        res.status(500).json({
            message: 'Не удалось получить тэги'
        })
    }
}

export const getAll = async (req, res) => {
    try {                                   // populate and exec связывет id user и возвращает данные юзера
        const posts = await PostModel.find().populate('user').exec();

        res.json(posts)
    } catch (err) {
        console.log(err)
        res.status(500).json({
            message: 'Не удалось получить статьи'
        })
    }
};

export const getOne = async (req, res) => {
    try {
        const postId = req.params.id;

        // Use async/await and promises instead of callbacks
        const doc = await PostModel.findOneAndUpdate(
            {_id: postId},
            {$inc: {viewsCount: 1}},
            {returnDocument: 'after'}
        ).populate('user')
            .populate({
                path: 'comments', // Заполняем комментарии
                populate: {
                    path: 'user', // Заполняем пользователя внутри комментариев
                    select: 'fullName email' // Выбираем поля пользователя
                }
            })


        if (!doc) {
            return res.status(404).json({
                message: 'Статья не найдена'
            });
        }

        res.json(doc)
    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: 'Не удалось вернуть статью'
        });
    }
};

export const remove = async (req, res) => {
    try {
        const postId = req.params.id;

        const doc = await PostModel.findOneAndDelete(
            {
                _id: postId,
            }
        )
        if (!doc) {
            console.log(err);
            return res.status(500).json({
                message: 'Статья не найдена'
            });
        }

        res.json({
            success: true
        })

    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: 'Не удалось вернуть статью'
        });
    }
};

export const create = async (req, res) => {
    try {
        const doc = new PostModel({
            title: req.body.title,
            text: req.body.text,
            imageUrl: req.body.imageUrl,
            tags: req.body?.tags.split(','),
            user: req.userId,
        });

        const post = await doc.save();

        res.json(post);
    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: 'Не удалось создать статью',
        });
    }
};

export const update = async (req, res) => {
    try {
        const postId = req.params.id

        await PostModel.updateOne(
            {
                _id: postId,
            },
            {
                title: req.body.title,
                text: req.body.text,
                imageUrl: req.body.imageUrl,
                tags: req.body.tags.split(','),
                user: req.userId
            }
        );

        res.json({
            success: true
        })

    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: 'Не удалось обновить статью'
        });
    }
};