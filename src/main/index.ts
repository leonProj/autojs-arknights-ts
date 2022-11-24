import {deviceInfo, gameInfo, otherInfo} from "@/state";

const {delay} = require('lang');
import {getGameRouter} from '@/router'

const {showToast} = require('toast');
import {init} from '@/utils/commonUtil';
import {captureAndClip} from "@/utils/imageUtil";
import {hrOcr} from "@/utils/ocrUtil";
import {showAlertDialog} from "dialogs";
import {writeImage} from "image";
import path from "path";
import {ScreenCapturer} from "media_projection";
import {callVueMethod} from "@/utils/webviewUtil";
import {home} from "accessibility";
import {launchApp} from "app";
import {canDrawOverlays, manageDrawOverlays} from "floating_window";

const {requestScreenCapture} = require('media_projection');
const plugins = require('plugins');
const {accessibility} = require('accessibility');

/**
 * 字符串替换
 * @param str 要替换的字符串
 * @param ocrFixDict 替换字典例如：{ '0': 'O', '1': 'I' }
 * @returns {*}
 */
function ocrFix(str: string, ocrFixDict: any) {
    const regStr = `[${Object.keys(ocrFixDict).join('')}]`
    const reg = new RegExp(regStr, 'g')
    return str.replace(reg, function (match) {
        return ocrFixDict[match]
    })
}

/**
 * 弹框提醒
 * @param e
 */
async function alert(e: string) {
    await showAlertDialog("结束", {content: e, type: "overlay"});
}

/**
 * 停止运行
 */
function stop() {
    callVueMethod('stopRun');
    deviceInfo.capturer?.stop()
}


async function run() {
    if(!canDrawOverlays()){
        showToast('请先开启悬浮窗权限');
        stop();
        manageDrawOverlays()
        return
    }
    if (!accessibility.enabled) {
        showToast('请先开启无障碍服务');
        stop();
        await accessibility.enableService({toast: false})
        return
    }
    // 初始化
    init();
    // 初始化未找到路由页面的次数
    let count = 0;
    // 请求截图权限
    const capturer: ScreenCapturer= await requestScreenCapture();
    // 创建OCR对象
    const ocr = await plugins.load("com.hraps.ocr")
    // 对象塞入，方便其他地方使用
    deviceInfo.capturer = capturer;
    deviceInfo.ocr = ocr;

    // 启动游戏
    if(!launchApp("明日方舟")){
        showToast('请先安装明日方舟');
        stop();
        return
    }

    while (true) {
        // 强制停止
        if(otherInfo.forceStop){
            otherInfo.forceStop = false;
            stop();
            break
        }

        // 获取可用的路由
        const gameRouter = getGameRouter();
        // 如果路由为空
        if (!gameRouter) {
            // 运行结束
            showToast('运行结束');
            await alert(`收菜结束`);
            stop();
            break;
        }

        // 延迟截图
        await delay(500);
        // 截图
        const capture = await captureAndClip(capturer)
        /* auto的bug：首次启动autojs,ui界面方式。初次调用toBitmap方法时会出错，后面再调用是没问题的  */
        try {
            capture.toBitmap()
        }catch (e) {
            console.log('初始化toBitmap')
        }
        // 文字识别
        const ocrResult = hrOcr(ocr, capture);
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
            const isNeedOcrFix = !!route.keywords.ocrFix
            // ocr容错
            const ocrFixText = isNeedOcrFix ? ocrFix(ocrText, route.keywords.ocrFix) : ocrText

            // 判断单个路由中关键词是否匹配
            const isIncludeMatch = route.keywords.include.every((keyword) => {
                // 是数组 ，数组中的任意一个匹配即可
                if (Array.isArray(keyword)) {
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
            // 匹配成功
            if (isIncludeMatch && !isExcludeMatch && isIncludeOneMatch) {
                // 没找到改为false
                notFound = false
                // 没找到累计改为0
                count = 0
                // 如果需要容错处理，把ocr结果也处理下
                if (isNeedOcrFix) {
                    ocrResult.forEach(item => {
                        item.text = ocrFix(item.text, route.keywords.ocrFix)
                    })
                }
                // 找到匹配的路由，执行路由中的对应操作
                console.log(`找到匹配的路由：${route.describe}`);
                await route.action({ocrResult, capture, ocrText: ocrFixText});
                // 结束遍历路由
                break
            }
        }

        if (notFound) {
            const msg = '未找到匹配的路由，累计' + count + '次'
            count++
            console.log(msg);
        }

        // 回收截图对象
        capture.recycle()


        if (count > 10) {
            const msg='未找到匹配的路由，累计' + count + '次，结束运行';
            console.log(msg)
            capturer.stop()
            await alert(msg);
            break
        }
    }
}

export {
    run
}