/**
 * @file 收菜流程
 */
import {deviceInfo, gameInfo, otherInfo} from "@/state";

const {delay} = require('lang');
import {getGameRouter, Route} from '@/router'

const {showToast} = require('toast');
import {init} from '@/utils/commonUtil';
import {captureAndClip} from "@/utils/imageUtil";
import {hrOcr, HrOcrResult} from "@/utils/ocrUtil";
import {showAlertDialog} from "dialogs";
import {Image, writeImage} from "image";
import path from "path";
import {ScreenCapturer} from "media_projection";
import {callVueMethod} from "@/utils/webviewUtil";
import {home} from "accessibility";
import {launchApp} from "app";
import {canDrawOverlays, manageDrawOverlays} from "floating_window";
import {chapterMission} from "@/router/chapterMission";
import {breathCalFireInTheSandMission} from "@/router/breathCalFireInTheSandMission";

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
export function stop() {
    callVueMethod('stopRun');
    deviceInfo.capturer?.stop()
}

interface GeCurRouteType {
    route: Route,
    isNeedOcrFix: boolean,
    ocrFixText: string
}

/**
 * 获取当前截图页面所处的路由
 * @param gameRouter
 * @param ocrText
 */
const geCurRoute = (gameRouter: Route[], ocrText: string): GeCurRouteType | undefined =>{
    const len = gameRouter.length
    for (let i = 0; i < len; i++) {
        // 单个路由
        const route = gameRouter[i];
        // 是否需要容错
        const isNeedOcrFix = !!route.keywords.ocrFix
        // ocr容错
        const ocrFixText = isNeedOcrFix ? ocrFix(ocrText, route.keywords.ocrFix) : ocrText

        // 判断单个路由中关键词是否匹配
        let isIncludeMatch = route.keywords.include?.every((keyword) => {
            // 是数组 ，数组中的任意一个匹配即可
            if (Array.isArray(keyword)) {
                return keyword.some((item) => ocrFixText.includes(item))
            }
            // 字符串直接匹配
            else
                return ocrFixText.includes(keyword)
        })
        if(!route.keywords.include){
            isIncludeMatch = true
        }
        // 判断单个路由中排除关键词是否匹配
        const isExcludeMatch = route.keywords.exclude?.some(keyword => ocrFixText.includes(keyword));
        // 判断单个路由中【有一个就行的】关键词是否匹配
        let isIncludeOneMatch = route.keywords.includeOne?.some(keyword => ocrFixText.includes(keyword))
        if(!route.keywords.includeOne){
            isIncludeOneMatch = true
        }
        // 匹配成功
        if (isIncludeMatch && !isExcludeMatch && isIncludeOneMatch) {
            return {route, isNeedOcrFix, ocrFixText}
        }
    }
}

interface CaptureAndOcrType {
    capture: Image,
    ocrResult: HrOcrResult
    ocrText: string
}

/**
 * 文字识别和截图
 */
async function captureAndOcr(): Promise<CaptureAndOcrType> {
    // 截图
    const capture = await captureAndClip(deviceInfo.capturer as ScreenCapturer);
    /* auto的bug：首次启动autojs,ui界面方式。初次调用toBitmap方法时会出错，后面再调用是没问题的  */
    try {
        capture.toBitmap()
    } catch (e) {
        console.log('初始化toBitmap')
    }
    // 文字识别
    const ocrResult = hrOcr(deviceInfo.ocr, capture);
    // 将ocr结果中的文字拼接成字符串
    const ocrText = ocrResult.map(item => item.text).join('');
    console.log(ocrText);
    return {capture, ocrResult, ocrText}
}

const handleRoute = async (curRoute: GeCurRouteType, ocrResult: HrOcrResult, capture: Image) => {
    const {route, isNeedOcrFix, ocrFixText} = curRoute
    // 如果需要容错处理，把ocr结果也处理下
    if (isNeedOcrFix) {
        ocrResult.forEach(item => {
            item.text = ocrFix(item.text, route.keywords.ocrFix)
        })
    }
    // 找到匹配的路由，执行路由中的对应操作
    console.log(`找到匹配的路由：${route.describe}`);
    await route.action({ocrResult, capture, ocrText: ocrFixText});
}

/**
 * 收菜流程
 */
async function run() {
    // 初始化
    await init();
    // 初始化未找到次数
    let count = 0;
    while (true) {
        // 强制停止
        if (otherInfo.forceStop) {
            otherInfo.forceStop = false;
            stop();
            break
        }

        // 获取可用的路由
        const gameRouter = getGameRouter();
        // 如果路由为空
        if (!gameRouter) {
            // 运行结束
            await alert(`收菜结束`);
            stop();
            break;
        }

        // 延迟
        await delay(500);
        // 文字识别
        const {capture, ocrResult, ocrText} = await captureAndOcr();
        // 获取路由
        const curRoute = geCurRoute(gameRouter, ocrText);
        // 如果找到对应的路由
        if (curRoute) {
            // 没找到累计改为0
            count = 0
            // 执行路由action
            await handleRoute(curRoute, ocrResult, capture)
        } else {
            const msg = '未找到匹配的路由，累计' + count + '次'
            count++
            console.log(msg);
        }

        // 回收截图对象
        capture.recycle()


        if (count > 10) {
            const msg = '未找到匹配的路由，累计' + count + '次，结束运行';
            console.log(msg)
            stop();
            await alert(msg);
            break
        }
    }
}

/**
 * 循环打关卡流程
 */
async function missionRun() {
    // 初始化
    await init();
    // 路由列表
    const gameRouter = [...chapterMission];
    while (true) {
        // 强制停止
        if (otherInfo.forceStop) {
            otherInfo.forceStop = false;
            stop();
            break
        }
        // 流程完成后停止
        if(gameInfo.isChapterMissionEnd){
            await alert(`刷关结束`);
            gameInfo.isChapterMissionEnd = false
            stop();
            break
        }
        // 延迟
        await delay(5000);
        // 文字识别
        const {capture, ocrResult, ocrText} = await captureAndOcr();
        // 获取路由
        const curRoute = geCurRoute(gameRouter, ocrText);
        // 如果找到对应的路由
        if (curRoute) {
            // 执行路由action
            await handleRoute(curRoute, ocrResult, capture)
        }
        // 回收截图对象
        capture.recycle()
    }
}

/**
 * 生息演算 沙中之火
 */
export const initBreathCalFireInTheSandGameInfo = () => {
    gameInfo.isBreathCalFireInTheSandEmergency = false
    gameInfo.isBreathCalFireInTheSandEmergencyDoubleTime = false
    gameInfo.breathCalFireInTheSandResCount=0
}
async function breathCalFireInTheSandRun() {
    // 初始化
    await init();
    // 初始化数据
    initBreathCalFireInTheSandGameInfo()
    // 路由列表
    const gameRouter = [...breathCalFireInTheSandMission];
    while (true) {
        // 强制停止
        if (otherInfo.forceStop) {
            otherInfo.forceStop = false;
            stop();
            break
        }
        // 流程完成后停止
        if(gameInfo.isBreathCalFireInTheSandEnd){
            await alert(`沙火摆烂结束`);
            gameInfo.isBreathCalFireInTheSandEnd = false
            stop();
            break
        }
        await delay(1500)
        // 文字识别
        const {capture, ocrResult, ocrText} = await captureAndOcr();
        // 获取路由
        const curRoute = geCurRoute(gameRouter, ocrText);
        // 如果找到对应的路由
        if (curRoute) {
            // 执行路由action
            await handleRoute(curRoute, ocrResult, capture)
        }
        // 回收截图对象
        capture.recycle()
    }
}




export {
    run,
    missionRun,
    breathCalFireInTheSandRun
}