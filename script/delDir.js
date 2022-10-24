/**
 * @file 用于删除目录 (请勿删除)
 */
const fs = require('fs')
const path = require('path')

const args = process.argv.slice(2);
const delPath = path.join(__dirname,args[0])

function delDir(delPath) {
    let files = [];
    if (fs.existsSync(delPath)) {
        files = fs.readdirSync(delPath);
        files.forEach(function (file, index) {
            let curPath = delPath + "/" + file;
            if (fs.statSync(curPath).isDirectory()) { // recurse
                delDir(curPath);
            } else { // delete file
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(delPath);
    }
}


delDir(delPath)