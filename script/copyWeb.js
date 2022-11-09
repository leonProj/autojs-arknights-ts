/**
 * @Description: 复制src下的web目录和img到bin目录下。因为autojs写法问题，rollup打包依赖解析时候不会把web和img目录打包进去 请勿删除
 */
const fs = require('fs')
const path = require('path')


const location = [
    {
        dest: path.join(__dirname, '../bin/web'),
        src: path.join(__dirname, '../src/web'),
    },
    {
        dest: path.join(__dirname, '../bin/img'),
        src: path.join(__dirname, '../src/img'),
    }
]

// 读取web目录 将web目录下的文件复制到bin目录下
function copyWeb(dest,src) {
    const files = fs.readdirSync(src)
    files.forEach(file => {
        const filePath = path.join(src, file)
        const destPath = path.join(dest, file)
        fs.copyFileSync(filePath, destPath)
    })
}

location.forEach(item => {
    const {dest, src} = item
    if(fs.existsSync(dest)){
        copyWeb(dest, src)
    }else {
        fs.mkdirSync(dest)
        copyWeb(dest, src)
    }

})



