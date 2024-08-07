import {body} from 'express-validator';
// express-validator для проверки валидации

export const loginValidation = [
    body('email', 'Неверный формат почты').isEmail(),
    body('password', 'Пароль должен быть минимум 5 символов').isLength({min: 5}),
]

export const registerValidation = [
    body('email', 'Неверный формат почты').isEmail(),
    body('password', 'Пароль должен быть минимум 5 символов').isLength({min: 5}),
    body('fullName', 'Укажите имя').isLength({min: 3}),
    body('avatarUrl', 'Неверная ссылка на аватарку').optional().isURL(), // проверка опциональное. если он не придет то все норм, а если пришел то проверь является лт она сылкой
]

export const postCreateValidation = [
    body('title', 'Введите заголовок статьи').isLength({min: 3}).isString(),
    body('text', 'Введите текст статьи').isLength({min: 3}).isString(),
    body('tags', 'Неверный формат тэгов (укажите массив)').optional().isString(),
    body('imageUrl', 'Неверная ссылка на изоброжение').optional().isString(),
]

export const commentCreateValidation = [
    body('title','Title is required').notEmpty().isLength({max: 1000}).isString(),
    body('postId', 'Post ID is required').notEmpty().isMongoId(),
]