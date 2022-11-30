/**
 * @file: 通用方法 ，初始化等
 */

import {deviceInfo} from "@/state";
import {device} from "device";
import {canDrawOverlays, manageDrawOverlays} from "floating_window";
import {showToast} from "toast";
import {accessibility} from "accessibility";
import {stop} from "@/main";
import {requestScreenCapture, ScreenCapturer} from "media_projection";
import plugins from "plugins";
import {launchApp} from "app";

const cv = require("@autojs/opencv");

/**
 * @description 初始化设备信息和权限判断等等等
 */
async function init() {
    if (!canDrawOverlays()) {
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

    // 请求截图权限
    const capturer: ScreenCapturer = await requestScreenCapture();
    // 创建OCR对象
    const ocr = await plugins.load("com.hraps.ocr")
    // 对象塞入，方便其他地方使用
    deviceInfo.capturer = capturer;
    deviceInfo.ocr = ocr;

    // 启动游戏
    if (!launchApp("明日方舟")) {
        showToast('请先安装明日方舟');
        stop();
        return
    }

}



export {
    init,
}