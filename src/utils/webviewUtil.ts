/**
 * @file android 向 webview 发送数据
 */

import {deviceInfo} from "@/state";
import {showToast} from "toast";

/**
 * @description: 向webview发送数据
 * @param methodName 方法名
 * @param param 参数
 */
function callVueMethod(methodName: string, param: any) {
    const webview = deviceInfo.webview
    if (!webview) {
        showToast("webview对象为空")
        console.error("webview 是空的！！！！")
    } else {
        // 如果是字符串 要加上双引号
        if (typeof param === "string") {
            param = `"${param}"`
        }
        webview.loadUrl(`javascript:${methodName}(${param})`);
    }
}

export {
    callVueMethod
}