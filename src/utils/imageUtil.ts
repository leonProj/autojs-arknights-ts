/**
 * @Description: 图片相关操作
 */


import {ScreenCapturer} from "media_projection";
import {deviceInfo} from "@/state";
import {Image} from "image";

/**
 * 截屏并截取中间小图部分
 * @param screenCapturer 请求截图权限返回的对象
 * @return 截取后的小图
 */
async function captureAndClip(screenCapturer: ScreenCapturer): Promise<Image> {
    // 截图
    const capture = await screenCapturer.nextImage()
    const clip = await capture.clipSync(deviceInfo.clipRect)
    // 释放截图对象
    capture.recycle()
    // 返回裁剪后的图片对象
    return clip
}

export {
    captureAndClip
}