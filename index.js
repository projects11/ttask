const express = require('express')
const os = require('os')
const cluster = require('cluster')
const multer = require('multer')
const schedule = require('node-schedule')
const mongoose = require('mongoose')
const filesRouter = require('./routes/files.routes')
const deleteFiles = require('./deleteFiles/deleteFiles')

const cors = require('cors');


// Подключение к переменным через .env
const dotenv = require('dotenv')
dotenv.config()

//
const PORT= process.env.PORT || 3000
const countOfThread = 3


const app = express()
app.use('/', filesRouter)

// В Cors разрешено взаимодействие со стандартным портом angular
app.use(cors({origin: 'http://localhost:4200'}))





// CRON
function cron(){
    const rule = new schedule.RecurrenceRule();
    rule.dayOfWeek = [0, new schedule.Range(0, 6)];
    rule.hour = 23;
    rule.minute = 30;
    // rule.tz = 'Etc/UTC';

    const job = schedule.scheduleJob(rule, function(){
        deleteFiles()
        console.log('Удаление выбранных файлов прошло успешно');
});}




// DB connection
const dburl = process.env.MONGO_CONNECT_URL
mongoose.connect(dburl, {useNewUrlParser:true, useUnifiedTopology:true})
    .then((res) => console.log('Connected to db'))
    .catch((error) => console.log(error))



if (cluster.isMaster) {
    cron()
    for (let i = 0; i < countOfThread; i++) {
        cluster.fork()
    }
    cluster.on('exit', (worker) => {
        console.log(`Воркер с pid = ${worker.process.pid} упал`)
        // console.log(worker)
        cluster.fork()
    })
    }else {
        app.listen(PORT, ()=> {
            console.log(`Сервер запустился на порту ${PORT} , id процесса ${process.pid}, worker id = ${cluster.worker.id}`)
        })

    }
