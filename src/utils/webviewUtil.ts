/**
 * @file android 向 webview 发送数据
 */

import {deviceInfo} from "@/state";
import {showToast} from "toast";

/**
 * @description: 安卓主动调用vue方法
 * @param methodName 方法名
 * @param param 参数
 */
function callVueMethod(methodName: string, param?: any) {
    const webview = deviceInfo.webview
    if (!webview) {
        showToast("调用vue方法失败，webview对象为空")
        console.error("webview 是空的！！！！")
    } else {
        param = JSON.stringify(param)
        webview.loadUrl(`javascript:${methodName}(${param})`);
    }
}

export {
    callVueMethod
}