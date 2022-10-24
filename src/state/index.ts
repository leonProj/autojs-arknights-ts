import {deviceInfoType, gameInfoType} from "@/types/state";

/**
 * @file: 运行时数据
 */

const path = require("path")

const deviceInfo: deviceInfoType = {
    longSide: null,
    shortSide: null,
    smallHeight: null,
    smallWidth: null,
    clipRect: null,
}


const gameInfo: gameInfoType = {
    isPublicRecruitEnd: false,
}


export {
    deviceInfo,
    gameInfo,
}
