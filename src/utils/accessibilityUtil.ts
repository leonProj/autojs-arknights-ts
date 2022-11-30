/**
 * @Description: accessibility相关
 */


import {HrOcrResult} from "@/utils/ocrUtil";
import {
    calOriginalPoint,
    getHrOcrResultItemPointByText,
    getPointByFeatures,
    GetPointByFeaturesOption, getPointByFeaturesPath,
    Point
} from "@/utils/point";
import {click, swipe} from "accessibility";
// @ts-ignore
import {findColorSync, Image, readImage, matchFeatures} from "image";
import {Color} from "color";
import {deviceInfo} from "@/state";
import {addWeeklyTask} from "work_manager";
import {delay} from "lang";


/**
 * @description 点击ocr结果中对应文字的坐标
 * @param  hrOcrResult 文字识别结果
 * @param  text 要点击的文字 , 为数组时候，只要数组中有一个匹配就点击
 */
async function clickByHrOcrResultAndText(hrOcrResult: HrOcrResult, text: string | string[]): Promise<void> {
    console.log(`准备点击${text}`);
    let smallPoint = null
    if (Array.isArray(text)) {
        for (const t of text) {
            const point = getHrOcrResultItemPointByText(hrOcrResult, t)
            if (point) {
                smallPoint = point
                break
            }
        }
    } else {
        smallPoint = getHrOcrResultItemPointByText(hrOcrResult, text)
    }
    if (smallPoint) {
        await clickPlus(smallPoint)
        console.log(`点击${text}成功`);
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
        await clickPlus(smallPoint)
    } else {
        console.log(`失败，未在图中找到${hexColor}颜色`);
    }
}

/**
 * @description 点击屏幕中间,坐标无意义，只是为了点击屏幕取消弹框反馈
 */
async function clickCenter(): Promise<void> {
    console.log('准备点击为屏幕中间');
    const x = deviceInfo.longSide as number / 2
    const y = deviceInfo.shortSide as number / 2
    await click(x, y)
    console.log(`点击屏幕中间成功,坐标为${x},${y}`);
}

/**
 * @description 点击右侧,坐标无意义，只是为了点击屏幕取消弹框反馈
 */
async function clickRight(): Promise<void> {
    console.log('准备点击为屏幕中间');
    const x = deviceInfo.longSide as number * 0.95
    const y = deviceInfo.shortSide as number / 2
    await click(x, y)
    console.log(`点击屏幕右侧成功,坐标为${x},${y}`);
}

/**
 * @description 点击屏幕中间偏下的位置 ，坐标无意义，只是为了点击屏幕取消弹框反馈
 */
async function clickCenterBottom(): Promise<void> {
    console.log('准备点击屏幕中间偏下的位置');
    const x = deviceInfo.longSide as number / 2
    const y = deviceInfo.shortSide as number * 0.985
    await click(x, y)
    console.log(`点击屏幕中间偏下的位置成功,坐标为${x},${y}`);
}
/**
 * @description 点击屏幕中间偏上的位置 ，坐标无意义，只是为了点击屏幕取消弹框反馈
 */
async function clickCenterTop(): Promise<void> {
    console.log('准备点击屏幕中间偏上的位置');
    const x = deviceInfo.longSide as number / 2
    const y = deviceInfo.shortSide as number * 0.05
    await click(x, y)
    console.log(`点击屏幕中间偏上的位置成功,坐标为${x},${y}`);
}

/**
 * 全分辨率找图,从截图对象上找小图，然后点击
 * @param capture
 * @param path
 * @param option
 */
async function clickByFeatures(capture: Image, path: string, option: GetPointByFeaturesOption = {scale: 0.7}): Promise<void> {
    console.log(`准备点击全分辨率找图坐标,图片路径为${path}`);
    const smallPoint = await getPointByFeaturesPath(capture, path, option)
    if (smallPoint) {
        console.log(`全分辨率找图坐标找到了准备点击`);
        await clickPlus(smallPoint)
    } else {
        console.log(`点击全分辨率找图坐标失败,未匹配图片${path}`);
    }
}


/**
 * @description 点击左上角返回按钮,坐标根据比例计算
 */
async function clickBack(): Promise<void> {
    console.log('点击返回');
    // x 120 / 1882  = 0.0635
    const x = deviceInfo.longSide as number * 0.0635
    // y 64/1059 = 0.0604
    const y = deviceInfo.shortSide as number * 0.0604
    console.log(`点击返回按钮坐标为x:${x},y:${y}`);
    await click(x, y)
}

/**
 * @description 点击圆形×号 ，全分辨率找图
 * @param capture
 */
async function clickCircleClose(capture: Image): Promise<void> {
    console.log('点击圆形×号关闭');
    await clickByFeatures(capture, `${deviceInfo.pathDir}/img/close.png`)
}

/**
 * @description 点击左上角首页按钮，坐标比例计算
 */
async function clickHome() {
    console.log('点击主页按钮');
    const x = deviceInfo.longSide as number * 0.1839
    // y 55/980=0.0561
    const y = deviceInfo.shortSide as number * 0.0561
    console.log(`主页按钮坐标为x:${x},y:${y}`);
    await click(x, y)
}

/**
 * @description 根据小图坐标点击大图坐标
 * @param smallPoint
 */
async function clickPlus(smallPoint: Point) {
    const {x, y} = calOriginalPoint(smallPoint.x, smallPoint.y)
    await click(x, y)
    console.log(`点击了坐标${x},${y}`)
}

/**
 * 点击家按钮，再点击首页
 */
async function backHomePage() {
    await clickHome()
    // 等待下拉动画
    await delay(1000)
    const x = 0.0733 * (deviceInfo.longSide as number)
    const y = 0.389 * (deviceInfo.shortSide as number)
    console.log(`点击首页`);
    await click(x, y)
    console.log(`点击了坐标${x},${y}`);

}

/**
 * @description 通用点击确认弹框的红色钩号按钮
 */
async function clickRedConFirm(capture:Image){
    console.log('点击红色确定按钮');
    await clickByColor(capture, '#791B1B')
}

/**
 * @description 滑动plus 计算原始大图中的坐标
 * @param x1
 * @param y1
 * @param x2
 * @param y2
 * @param duration
 */
async function  swipePlus (x1: number, y1: number, x2: number, y2: number, duration: number){
    const start = calOriginalPoint(x1, y1)
    const end = calOriginalPoint(x2,y2)
    console.log(`从${start.x},${start.y}滑动到${end.x},${end.y}`);
    await swipe(start.x,start.y,end.x,end.y,duration)

}

export {
    clickCenterTop,
    swipePlus,
    clickRedConFirm,
    backHomePage,
    clickCenterBottom,
    clickByHrOcrResultAndText,
    clickByColor,
    clickCenter,
    clickRight,
    clickByFeatures,
    clickBack,
    clickCircleClose,
    clickHome,
    clickPlus,
}


