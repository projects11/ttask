const Router = require('express')
const router = new Router()


const cluster = require('cluster')
const multer = require('multer')
const File = require('../models/files.models')
const ActionLog = require('../models/log.models')
const bodyParser = require("body-parser");
const jsonParser = bodyParser.json()


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./files/");
    },
    filename: (req, file, cb) =>{
        cb(null, Date.now() + '--' + file.originalname)
    }
})

const fileFilter = (req, file, cb) => {
    const fileSize = parseInt(req.headers['content-length']);

    if(file.mimetype === "image/png" ||
    file.mimetype === "image/jpeg" ||
    file.mimetype === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    && (fileSize <= 5242880)) {
        cb(null, true)
    }else{
        cb(null, false)
    }
}

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    // limits: {fileSize: 5242880}
    });


// Добавить файл
// При отправке файлов через postman некорректно указываются кириллические имена файлов, поэтому отправляя запрос через postman
// лучше загружать файлы без кириллицы в названии. При работе с фронтом данная проблема не наблюдается
router.post('/upload', upload.single("file"),async (req, res)=>
{
    let fileData = req.file
    if(!fileData){
        res.send("Ошибка. Могут быть загружены только файлы не превышающие размер 5Мб с расширением .jpeg .png .xlsx")
    }else{
        const stamp = Date.now()

        const newfile = new File({
            fieldname: req.file.fieldname,
            originalname: req.file.originalname,
            encoding: req.file.encoding,
            mimetype: req.file.mimetype,
            destination: req.file.destination,
            filename: req.file.filename,
            path: req.file.path,
            size: req.file.size,
            stamp: stamp,
            delete: false
        })

        const actionLog = new ActionLog({
            stamp: stamp,
            operation: 'add',
            cluster: cluster.worker.id
        })


        try{
            await newfile.save()
            await actionLog.save()
            console.log(req.file)
            res.send("Загрузка файла прошла успешно")

        }catch (e){
            console.log(e)
        }
    }



})

//Получить список
router.get('/files', async (req, res)=>{
    // const date = new Date()
    const data = await File.find({delete:false}).sort({stamp: 'desc'})
        .select('filename size stamp -_id' )
        .limit(5)
    res.send(data)
})

// Пометить на удаление
router.post('/remove', jsonParser , async (req, res)=>{
    // console.log(req.body)
    try{
        await File.updateOne({_id: req.body.id}, {delete:true})

        const actionLog = new ActionLog({
            stamp: Date.now(),
            operation: 'delete',
            cluster: cluster.worker.id
        })
        await actionLog.save()
        res.send(`Файл c id ${req.body.id} отправлен на удаление`)

    }catch (e){
        console.log(e)
    }
})



module.exports = router