/**
 * file 检查工具
 */
import {deviceInfo} from "@/state";

function checkInit(){
    if(deviceInfo.longSide == null || deviceInfo.shortSide == null || deviceInfo.smallHeight == null || deviceInfo.smallWidth == null || deviceInfo.clipRect == null){
        throw new Error('设备信息未初始化，请先调用commonUtil.init()方法')
    }
}

export {
    checkInit
}