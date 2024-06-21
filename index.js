import express from 'express';
import fs from 'fs'
import multer from 'multer';
import mongoose from 'mongoose'
import {loginValidation, postCreateValidation, registerValidation} from './validations.js' // нужно импортировать с расгирением
import checkAuth from './utils/checkAuth.js';
import {getMe, login, register} from "./controllers/UserController.js";
import * as  PostController from './controllers/PostController.js'
import handleValidationErrors from "./utils/handleValidationErrors.js";
import cors from 'cors';

// Между .net/"blog" mongoDB сам догнал и содзал базу данных

mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log("DB ok"))
    .catch((err) => console.log('DB error', err))

const app = express()

// создаем хранилище где будем сохранять все наши еартинки
const storage = multer.diskStorage({
    // ожидает какието параметры, запрос, файл, callback
    destination: (_, __, cb) => {
        if (!fs.existsSync('uploads')) {
            fs.mkdirSync('uploads');
        }
        cb(null, 'uploads')
    },
    filename: (_, file, cb) => {
        cb(null, file.originalname);
    },
});

const upload = multer({storage})

// express не умеет читать json, надо его обучить
app.use(express.json())
// устанавливаем библиотеку cors чтобы дать другим дрменам разрешение на запрос
app.use(cors());
// мы говорим express если пришел запрос на uploads то есть static который
app.use('/uploads', express.static('uploads'))

app.get('/', (req, res) => {
    res.send(' Hello world')
});

app.post('/auth/login', loginValidation, handleValidationErrors, login)

app.post('/auth/register', registerValidation, handleValidationErrors, register);
// checkAuth решит нужно ли дальше выполнять функцию, тоесть если он решит не выполнять то он вернет ответ, если решит выполнять то с помощью next() будет выполнсять дальше
app.get('/auth/me', checkAuth, getMe)

// upload image
app.post('/upload', checkAuth, upload.single('image'), (req, res) => {
    res.json({
        url: `/uploads/${req.file.originalname}`,
    });
})
// зачем нам два тэга
app.get('/tags', PostController.getLastTags);

app.get('/posts', PostController.getAll);
app.get('/posts/tags', PostController.getLastTags);
app.get('/posts/:id', PostController.getOne);
// когда создаем стать сперва идет проверка юзера с помощью checkAuth
// после когда проверится юзер выполняется проверка на валидацию и затем создается статья
app.post('/posts', checkAuth, postCreateValidation, handleValidationErrors, PostController.create);
app.delete('/posts/:id', checkAuth, PostController.remove);
app.patch('/posts/:id', checkAuth, postCreateValidation, handleValidationErrors, PostController.update);

app.listen(process.env.PORT || 4444, (err) => {
    if (err) {
        return console.log(err)
    }
    console.log('Server OK')
})