/**
 * @Description: 复制src下的web目录到bin目录下。因为autojs写法问题，rollup打包依赖解析时候不会把web目录打包进去 请勿删除
 */
const fs = require('fs')
const path = require('path')

//目标目录
const dest = path.join(__dirname, '../bin/web')
//web目录
const webRoot = path.join(__dirname, '../src/web');

// 读取web目录 将web目录下的文件复制到bin目录下
function copyWeb() {
    const files = fs.readdirSync(webRoot)
    files.forEach(file => {
        const filePath = path.join(webRoot, file)
        const destPath = path.join(dest, file)
        fs.copyFileSync(filePath, destPath)
    })
}

if(fs.existsSync(dest)){
    copyWeb()
}else {
    fs.mkdirSync(dest)
    copyWeb()
}

