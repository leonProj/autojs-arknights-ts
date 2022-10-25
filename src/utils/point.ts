/**
 * @file: 坐标相关工具
 */

import {deviceInfo} from "@/state";
import {checkInit} from "@/utils/checkUtil";
import {HrOcrResult} from "@/utils/ocrUtil";

/**
 * @description 坐标
 */
export interface Point {
    /**
     * @Description: x坐标
     */
    x: number,
    /**
     * @Description: x坐标
     */
    y: number
}


/**
 * @description 根据裁剪后的小图中的坐标，返回原来大图中对应的坐标
 * @param smallX 小图中的x坐标
 * @param smallY 小图中的y坐标
 */
function calOriginalPoint(smallX: number, smallY: number): Point {
    checkInit()
    const originalX = deviceInfo.longSide as number / (deviceInfo.smallWidth as number) * smallX
    const originalY = deviceInfo.shortSide as number / (deviceInfo.smallHeight as number) * smallY
    return {x: originalX, y: originalY}
}

/**
 * 返回文字识别结果中指定文字的坐标
 * @param hrOcrResult 文字识别结果
 * @param text 指定文字
 * @returns 找到返回坐标，找不到返回null
 */
function getHrOcrResultItemPointByText(hrOcrResult: HrOcrResult, text: string): Point | null {
    let item = hrOcrResult.find(item => item.text === text)
    if (item) {
        return {x: item.x, y: item.y}
    } else {
        console.log(`hrOcrResult数组中未找到text值为【${text}】的item`)
        console.log('hrOcrResult数组为', hrOcrResult)
        return null
    }
}

export {
    calOriginalPoint,
    getHrOcrResultItemPointByText
}