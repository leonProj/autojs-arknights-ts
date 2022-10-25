/**
 * @file: 通用方法 ，初始化等
 */

import {deviceInfo} from "@/state";
import {device} from "device";

const cv = require("@autojs/opencv");

/**
 * @description 初始化设备信息
 */
function init(): void {
    // 设备宽度
    const width = device.screenWidth;
    // 设备高度
    const height = device.screenHeight;
    /*因为竖屏和横屏下，宽高值不一样所以统一成下面的的长边和短边*/
    // 设备长边
    const longSide = Math.max(width, height);
    // 设备短边
    const shortSide = Math.min(width, height);
    // 截屏之后，图片中间被等比缩小的小图高度
    const smallHeight = (shortSide / longSide) * shortSide;
    // 截屏之后，图片中间被等比缩小的小图宽度
    const smallWidth = shortSide;

    // 截取矩形左上角x坐标
    const left = 0;
    // 截取矩形左上角y坐标
    const top = longSide / 2 - smallHeight / 2;

    deviceInfo.longSide = longSide;
    deviceInfo.shortSide = shortSide;
    deviceInfo.smallHeight = smallHeight;
    deviceInfo.smallWidth = smallWidth;
    deviceInfo.clipRect = new cv.Rect(left, top, smallWidth, smallHeight);

}

export {
    init,
}