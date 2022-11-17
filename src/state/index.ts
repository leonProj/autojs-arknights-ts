/**
 * @file: 运行时数据
 */
import {Rect} from "ui_object";

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
     * 安卓初始化ui界面时候获得的webview对象
     */
    webview: any

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
     * 是否基建的批量操作结束，即点击右上角小铃铛之后的。可收获，订单交付，干员信赖全部点过了。默认false
     */
    isConstructionBatchEnd:boolean
}



const path = require("path")

const deviceInfo: DeviceInfo = {
    longSide: null,
    shortSide: null,
    smallHeight: null,
    smallWidth: null,
    clipRect: null,
    pathDir:path.dirname(__dirname),
    webview:null
}


const gameInfo: GameInfo = {
    isPublicRecruitEnd: true,
    isPurchaseEnd:true,
    isFriendHomeEnd:true,
    isConstructionEnd:false,
    isConstructionBatchEnd:true,
}


export {
    deviceInfo,
    gameInfo,
}
