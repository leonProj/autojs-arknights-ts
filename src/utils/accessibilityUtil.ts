/**
 * @Description: accessibility相关
 */


import {HrOcrResult} from "@/utils/ocrUtil";
import {
    calOriginalPoint,
    getHrOcrResultItemPointByText,
    getPointByFeatures,
    GetPointByFeaturesOption,
    Point
} from "@/utils/point";
import {click} from "accessibility";
// @ts-ignore
import {findColorSync, Image, readImage, matchFeatures} from "image";
import {Color} from "color";
import {deviceInfo} from "@/state";
import {checkInit} from "@/utils/checkUtil";
import "../types/autoPro9/image";

/**
 * @description 点击ocr结果中对应文字的坐标
 * @param  hrOcrResult 文字识别结果
 * @param  text 要点击的文字
 */
async function clickByHrOcrResultAndText(hrOcrResult: HrOcrResult, text: string): Promise<void> {
    console.log(`准备点击${text}`);
    const smallPoint = getHrOcrResultItemPointByText(hrOcrResult, text)
    if (smallPoint) {
        const {x, y} = calOriginalPoint(smallPoint.x, smallPoint.y)
        await click(x, y)
        console.log(`点击${text}成功,坐标为${x},${y}`);
    } else {
        console.log(`点击${text}失败`);
    }
}

/**
 * 点击图片中指定颜色的坐标
 * @param capture 图片对象
 * @param hexColor 16进制颜色字符串 例如 #ffffff
 */
async function clickByColor(capture: Image, hexColor: string): Promise<void> {
    console.log(`准备点击${hexColor}颜色所在的位置`);
    const color = Color.parse(hexColor);
    const smallPoint = findColorSync(capture, color, {threshold: 1})
    if (smallPoint) {
        const {x, y} = calOriginalPoint(smallPoint.x, smallPoint.y)
        await click(x, y)
        console.log(`点击${hexColor}颜色成功,坐标为${x},${y}`);
    } else {
        console.log(`未在图中找到${hexColor}颜色`);
    }
}

/**
 * @description 点击屏幕中间
 */
async function clickCenter(): Promise<void> {
    checkInit()
    console.log('准备点击为屏幕中间');
    const x = deviceInfo.longSide as number / 2
    const y = deviceInfo.shortSide as number / 2
    await click(x, y)
    console.log(`点击屏幕中间成功,坐标为${x},${y}`);
}

/**
 * 全分辨率找图,从截图对象上找小图，然后点击
 * @param capture
 * @param path
 * @param option
 */
async function clickByFeatures(capture: Image, path: string, option: GetPointByFeaturesOption = {scale: 0.7}): Promise<void> {
    console.log(`准备点击全分辨率找图坐标,图片路径为${path}`);
    const smallPoint = await getPointByFeatures(capture, path, option)
    if (smallPoint) {
        const {x, y} = calOriginalPoint(smallPoint.x, smallPoint.y)
        console.log(`点击全分辨率找图坐标成功,坐标为${x},${y}`);
        await click(x, y)
    } else {
        console.log(`点击全分辨率找图坐标失败,未匹配图片${path}`);
    }
}


/**
 * @description 点击左上角返回按钮,坐标根据比例计算
 */
async function clickBack(): Promise<void> {
    checkInit()
    console.log('点击返回');
    // x 120 / 1882  = 0.0635
    const x = deviceInfo.longSide as number * 0.0635
    // y 64/1059 = 0.0604
    const y = deviceInfo.shortSide as number * 0.0604
    console.log(`点击返回按钮坐标为x:${x},y:${y}`);
    await click(x, y)
}

module.exports = {
    clickByHrOcrResultAndText,
    clickByColor,
    clickCenter,
    clickByFeatures,
    clickBack
}


