import {Rect} from "ui_object";

/**
 * @Description: 设备信息
 */
export interface deviceInfoType {
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
}

/**
 * @Description: 游戏信息
 */
export interface gameInfoType {
    /**
     * @Description: 是否公招结束
     */
    isPublicRecruitEnd: boolean;
}
