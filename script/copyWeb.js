/**
 * @Description 复制src下的web目录到bin目录下。因为autojs写法问题，rollup打包依赖解析时候不会把web目录打包进去
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

try {
    fs.mkdirSync(dest)
    copyWeb()
}catch (e){
    if(e.message.includes('file already exists')){
        copyWeb()
    }else{
        console.error('复制web目录失败', e)
    }
}

