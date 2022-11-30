/**
 * @file: 运行时数据
 */
import {Rect} from "ui_object";
import {ScreenCapturer} from "media_projection";

/**
 * @Description: 设备信息
 */
interface DeviceInfo {
    /**
     * @Description: 设备长边
     */
    longSide: number |null;
    /**
     * @Description: 设备短边
     */
    shortSide: number |null;
    /**
     * @Description:  截屏之后，图片中间被等比缩小的小图高度
     */
    smallHeight: number |null;
    /**
     * @Description: 截屏之后，图片中间被等比缩小的小图宽度
     */
    smallWidth: number |null;
    /**
     * @Description: 截屏之后需要裁剪的矩形
     */
    clipRect: Rect |null;
    /**
     * 路径目录
     */
    pathDir:string
    /**
     * 请求截图权限返回的对象
     */
    capturer: ScreenCapturer |null
    /**
     * ocr对象
     */
    ocr:any
    /**
     * 安卓webview对象
     */
    webview:any
}

/**
 * @Description: 游戏信息
 */
export interface GameInfo {
    /**
     * @Description: 是否公招结束 默认false
     */
    isPublicRecruitEnd: boolean;

    /**
     * 是否采购中心结束。默认false
     */
    isPurchaseEnd:boolean

    /**
     * 是否访问好友结束。默认false
     */
    isFriendHomeEnd:boolean

    /**
     * 是否基建流程结束。默认false
     */
    isConstructionEnd:boolean
    /**
     * 是否基第一次换人流程结束。默认false，如果该值为false，那么此次只换宿舍的人。其他建筑不换人
     * 解释：因为宿舍换人会把其他建筑底心情的人给换掉，所以宿舍单独走流程，宿舍结束知乎再换其他建筑
     */
    isConstructionDormitoryEnd:boolean
    /**
     * 是否基建的批量操作结束，即点击右上角小铃铛之后的。可收获，订单交付，干员信赖全部点过了。默认false
     */
    isConstructionBatchEnd:boolean
    /**
     * 是否任务收集模块结束。默认false
     */
    isTodoCollectionEnd:boolean
    /**
     * 是否日常任务收集。默认false
     */
    isTodoCollectionDailyEnd:boolean
    /**
     * 是否周长任务收集。默认false
     */
    isTodoCollectionWeeklyEnd:boolean

}

interface OtherInfo {
    /**
     * 是否强制停止
     */
    forceStop:boolean
}

const otherInfo :OtherInfo = {
    forceStop:false
}



const path = require("path")

const deviceInfo: DeviceInfo = {
    longSide: null,
    shortSide: null,
    smallHeight: null,
    smallWidth: null,
    clipRect: null,
    pathDir:path.dirname(__dirname),
    capturer: null,
    ocr:null,
    webview:null
}


const gameInfo: GameInfo = {
    isPublicRecruitEnd: false,
    isPurchaseEnd:false,
    isFriendHomeEnd:false,
    isConstructionEnd:false,
    isConstructionDormitoryEnd:false,
    isConstructionBatchEnd:false,
    isTodoCollectionEnd:false,
    isTodoCollectionDailyEnd:false,
    isTodoCollectionWeeklyEnd:false,
}

export {
    deviceInfo,
    gameInfo,
    otherInfo
}
