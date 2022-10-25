/**
 * @Description: accessibility相关
 */


import {HrOcrResult} from "@/utils/ocrUtil";
import {calOriginalPoint, getHrOcrResultItemPointByText, Point} from "@/utils/point";
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
 * 全分辨率找图,从截图对象上找小图
 * 能用比例计算坐标的的尽量用比例计算。特征找图的耗时要几百毫秒
 * 特征匹配。比普通的模板匹配更兼容不同分辨率或旋转形变，但效率更低。
 * 若要提高效率，可以在计算大图特征时调整scale参数，方法默认为0.5,我给了0.8
 * 越小越快，但可以放缩过度导致匹配错误
 * 计算大图的特征。若在特征匹配时无法搜索到正确结果，可以调整这里的参数，比如{scale: 1}
 * 也可以指定{region: [...]}参数只计算这个区域的特征提高效率
 * @param capture 图片对象
 * @param path 小图的图片路径  例如：`${deviceInfo.pathDir}/img/close.png`)`
 * @param option 选项
 * @return 返回小图在大图中的中心点的坐标。没找到返回null
 * @see https://pro.autojs.org/docs/zh/v9/generated/classes/image.Image.html#detectandcomputefeatures
 */
async function getPointByFeatures(capture: Image, path: string, option: any = {
    scale: 0.8,
    region: null
}): Promise<Point | null> {
    let start = Date.now();
    let smallPic = await readImage(path);
    // 计算小图特征
    // @ts-ignore
    let smallPicFeatures = await smallPic.detectAndComputeFeatures();
    if (!option.region) {
        delete option.region
    }
    // @ts-ignore
    let captureFeatures = await capture.detectAndComputeFeatures(option);
    // 特征匹配
    let result = await matchFeatures(captureFeatures, smallPicFeatures);
    // 回收特征对象
    captureFeatures.recycle();
    smallPicFeatures.recycle();
    let end = Date.now();
    console.log(`全分辨率找图时间: ${end - start}ms`);
    return result ? result.center : null
}


module.exports = {
    clickByHrOcrResultAndText,
    clickByColor,
    clickCenter,
    getPointByFeatures
}


