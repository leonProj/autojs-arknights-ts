/**
 * @Description 当前文件用于编译js添加ui头，请勿删除.理由见下
 * @see https://pro.autojs.org/docs/zh/v9/#ui%E7%BA%BF%E7%A8%8B
 */
const fs = require('fs')
const path = require('path')
 
const mainPath = path.join('./bin/main.node.js')
const mainjsCtx = fs.readFileSync(mainPath, {
    encoding: 'utf-8'
})

const tag = '"ui";'
const val = `
${tag}
${mainjsCtx}`

fs.writeFileSync(mainPath, val, {
    encoding: 'utf-8'
})