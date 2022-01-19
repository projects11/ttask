const mongoose = require('mongoose')
const File = require("../models/files.models");
const path = require('path')
const fs = require('fs')




async function deleteFiles(){
    const data = await File.find({delete:true})


    for(let i = 0; i < data.length; i++){
        const filename = data[i].path
        const id = data[i]._id
        const rem = data[i].delete
        // console.log(rem)
        if(rem){
            try{
                const fullpath = path.join("./",filename)
                // console.log(fullpath)
                fs.unlink(fullpath, (err) => {
                    if (err) {
                        throw err;
                    }
                    console.log("File is deleted.");
                });
            } catch (e) {
                console.log(e)
            }

            try {
                const delDb = await File.deleteOne({id_: id})
                console.log(`Запись с ID = ${id} удалена`)
            }catch (e){
                console.log(e)
            }
        }else{
            console.log('Нет файлов на удаление')
        }

    }

}


//deleteFiles()

module.exports = deleteFiles