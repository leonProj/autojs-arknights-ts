/**
 * @Description 当前文件用于编译js添加nodejs头，请勿删除.理由见下
 * @see https://pro.autojs.org/docs/zh/v9/#%E7%94%A8node-js%E5%BC%95%E6%93%8E%E8%BF%90%E8%A1%8C%E4%BB%A3%E7%A0%81
 */
const fs = require('fs')
const path = require('path')
 
const mainPath = path.join('./bin/main.js')
const mainjsCtx = fs.readFileSync(mainPath, {
    encoding: 'utf-8'
})

const tag = '"nodejs";'
const val = `
${tag}
${mainjsCtx}`

fs.writeFileSync(mainPath, val, {
    encoding: 'utf-8'
})