import {gameInfo} from "@/state";
const {delay} = require('lang');
import gameRouter from '@/router'
const {showToast} = require('toast');
import {init} from '@/utils/commonUtil';
import {captureAndClip} from "@/utils/imageUtil";
import {hrOcr} from "@/utils/ocrUtil";
import {showAlertDialog} from "dialogs";
const { requestScreenCapture } = require('media_projection');
const plugins = require('plugins');
const { accessibility} = require('accessibility');

/**
 * 字符串替换
 * @param str 要替换的字符串
 * @param ocrFixDict 替换字典例如：{ '0': 'O', '1': 'I' }
 * @returns {*}
 */
function ocrFix(str,ocrFixDict){
    const regStr = `[${Object.keys(ocrFixDict).join('')}]`
    const reg = new RegExp(regStr,'g')
    return str.replace(reg,function(match){
        return ocrFixDict[match]
    })
}
async function alert(e: string) {
    await showAlertDialog("结束", { content: e,type:"overlay" });
}


async function run() {
    if(!accessibility.enabled){
        showToast('请先开启无障碍服务');
        await accessibility.enableService({ toast: false })
    }
    // 初始化
    init();
    let count = 0;
    // home();
    await delay(1000);
    // 请求截图权限
    const capturer = await requestScreenCapture();
    // 创建OCR对象
    const ocr = await plugins.load("com.hraps.ocr")

    while (true) {
        // 公招流程
        if(gameInfo.isPurchaseEnd){
            showToast('运行结束');
            alert(`流程结束`);
            break;
        }

        // 延迟截图
        await delay(1000);
        // 截图
        const capture = await captureAndClip(capturer)
        // 文字识别
        const ocrResult = hrOcr(ocr,capture);
        // 将ocr结果中的文字拼接成字符串
        const ocrText = ocrResult.map(item => item.text).join('');
        console.log(ocrText);
        // 遍历路由
        const len = gameRouter.length
        let notFound = true
        for (let i = 0; i < len; i++) {
            // 单个路由
            const route = gameRouter[i];
            // 是否需要容错
            const isNeedOcrFix  = !!route.keywords.ocrFix
            // ocr容错
            const ocrFixText = isNeedOcrFix ?ocrFix(ocrText,route.keywords.ocrFix):ocrText
            // @ts-ignore
            // 判断单个路由中关键词是否匹配
            const isIncludeMatch = route.keywords.include.every((keyword) => {
                // 是数组 ，数组中的任意一个匹配即可
                if(Array.isArray(keyword)){
                    return keyword.some((item) => ocrFixText.includes(item))
                }
                // 字符串直接匹配
                else
                    return ocrFixText.includes(keyword)
            })
            // 判断单个路由中排除关键词是否匹配
            const isExcludeMatch = route.keywords.exclude?.some(keyword => ocrFixText.includes(keyword));
            // 判断单个路由中【有一个就行的】关键词是否匹配
            const isIncludeOneMatch = route.keywords.includeOne?.some(keyword => ocrFixText.includes(keyword)) || true;
            // 关键词匹配成功，排除关键词匹配失败
            if (isIncludeMatch && !isExcludeMatch && isIncludeOneMatch) {
                // 没找到改为false
                notFound = false
                // 没找到累计改为0
                count = 0
                // 如果需要容错处理，把ocr结果也处理下
                if(isNeedOcrFix){
                    ocrResult.forEach(item => {
                        item.text = ocrFix(item.text,route.keywords.ocrFix)
                    })
                }
                // 找到匹配的路由，执行路由中的对应操作
                console.log(`找到匹配的路由：${route.describe}`);
                await route.action({ocrResult,capture,ocrText:ocrFixText});
                // 结束遍历路由
                break
            }
        }

        if(notFound){
            count ++
            console.log('未找到匹配的路由');
        }

        // 回收截图对象
        capture.recycle()


        if ( count>5) {
            console.log(`连续${count}次未找到路由，结束运行`)
            capturer.stop()
            showToast('运行结束');
            alert(`连续${count}次未找到路由`);
            break
        }
    }
}

export {
    run
}