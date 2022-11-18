import {callVueMethod} from "./utils/webviewUtil";

const ui = require('ui');
const {readFile} = require('fs').promises;
const fs = require('fs');
const path = require('path');
const app = require('app');
const {foregroundService} = require('settings');
const {showDialog} = require("dialogs");
const {showToast} = require("toast");
const {getRunningEngines, stopAll} = require("engines");
import {addCount, count, deviceInfo, gameInfo} from "./state";
import {home} from "accessibility";
// Web文件夹
const webRoot = path.join(__dirname, 'web');
// Web网页首页url
const indexUrl = `file://${webRoot}/index.html`;
// 保存vue2-sfc-loader文件的路径
const sfcLoaderFile = path.join(webRoot, 'vue2-sfc-loader@0.8.4.js')


// 显示Web的界面
class WebActivity extends ui.Activity {
    get initialStatusBar() {
        return {color: '#ffffff', light: true}
    }

    get layoutXml() {
        return `<vertical><webview id="web" w="*" h="*"/></vertical>`
    }

    onContentViewSet(contentView) {
        this.webview = contentView.findView('web');
        this.setupWebView(this.webview);
        console.log('loadUrl:', indexUrl);
        this.webview.loadUrl(indexUrl);
    }

    setupWebView(webview) {
        // 初始化设备信息中的webview，用于后续webviewUtils中使用webview对象
        deviceInfo.webview = this.webview;
        // 监听WebView的控制台消息，打印到控制台
        webview.on('console_message', (event, msg) => {
            console.log(`${path.basename(msg.sourceId())}:${msg.lineNumber()}: ${msg.message()}`);
        });
        const jsBridge = webview.jsBridge;

        // 处理来自web的请求
        // 处理读取本地文件的请求
        jsBridge.handle('fetch', async (event, args) => {
            return await readFile(path.resolve(path.join(webRoot, args.path)), {encoding: 'utf-8'});
        });
        // 处理显示日志界面的请求
        jsBridge.handle('show-log', () => {
            app.startActivity('console');
        });

        /* 自定义事件 */
        // vue created之后
        jsBridge.handle('created', () => {
            const param = 'aaaaaaaa'
            console.log('param',param)
            callVueMethod('initData', param);
        });

    }
}

ui.setMainActivity(WebActivity);
ui.activityLifecycle.on('all_activities_destroyed', () => {
    process.exit();
});

