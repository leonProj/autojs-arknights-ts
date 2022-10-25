import plugins from "plugins";
import {delay} from "lang";
import {init} from "@/utils/commonUtil";
import {home} from "accessibility";
import {requestScreenCapture} from "media_projection";
import {captureAndClip} from "@/utils/imageUtil";
import {hrOcr,Ocr} from "@/utils/ocrUtil";
import {showToast} from "toast";


async function testHrOcr(){
    // 初始化
    init()
    // 创建OCR对象
    const ocr:Ocr = await plugins.load("com.hraps.ocr")
    // 截屏权限
    const capturer = await requestScreenCapture();
    // 截图，裁剪
    let capture = await captureAndClip(capturer)
    // 识别
    const res = await hrOcr(ocr, capture)
    showToast('结束')
    console.log('res',res)
}
export {
    testHrOcr
}