import UserModel from "../models/User.js";
// jsonwebtoken для токенов
import jwt from 'jsonwebtoken';
// bcrypt для шифрования пароля password
import bcrypt from 'bcryptjs';
// nodemon библиотека которая обновляет сервер при изменении данных таким образом нам не надо отключать сервер (ctrl c) и обратно запускать

export const register = async (req, res) => {
    try {
        const password = req.body.password
        const salt = await bcrypt.genSalt(10)
        const hash = await bcrypt.hash(password, salt)

        const doc = new UserModel({
            email: req.body.email, fullName: req.body.fullName, passwordHash: hash, avatarUrl: req.body.avatarUrl,
        });

        const user = await doc.save();

        const token = jwt.sign({
            // в mongoDB так _id
            _id: user._id,
        }, 'secret123', { // жизнь токена 30 дней
            expiresIn: '30d',
        });

        const {passwordHash, ...userData} = user._doc;

        res.json({
            ...userData, token
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: 'Не удалось зарегистрировать',
        })
    }
}

export const login = async (req, res) => {
    try {
        // сперва надо найти пользователя
        const user = await UserModel.findOne({email: req.body.email});

        if (!user) {
            // у req нету статусов и нету json методов
            return res.status(404).json({
                // это для теста, а так не уточнять в message почему не смог зарегаться, а просто на вывести не верный логин или пароль, потому что злоумышленники могу понять какие пароли или эмэйлы есть нету
                message: 'Пользователь не найден'
            })
        }
        // сравнение паролей
        const isValidPass = await bcrypt.compare(req.body.password, user._doc.passwordHash);

        if (!isValidPass) {
            return res.status(403).json({
                message: 'Неверный логин или пароль'
            })
        }

        // делаем тоже самое при регистрации
        const token = jwt.sign({
            // в mongoDB так _id
            _id: user._id,
        }, 'secret123', { // жизнь токена 30 дней
            expiresIn: '30d',
        });

        const {passwordHash, ...userData} = user._doc;

        res.json({
            ...userData, token
        })

    } catch (err) {
        console.log(error)
        res.status(500).json({
            message: 'Не удалось авторизоваться',
        })
    }
}

export const getMe = async (req, res) => {
    try {
        const user = await UserModel.findById(req.userId)

        if (!user) {
            return res.status(404).json({
                message: "Пользователь не найден"
            })
        }


        const {passwordHash, ...userData} = user._doc;

        res.json(userData)
    } catch (err) {
        console.log(err)
        res.status(500).json({
            message: 'Нет доступа',
        })
    }
}