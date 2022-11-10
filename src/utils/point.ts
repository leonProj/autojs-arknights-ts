/**
 * @file: 坐标相关工具
 */

import {deviceInfo} from "@/state";
import {HrOcrResult, HrOcrResultItem} from "@/utils/ocrUtil";
// @ts-ignore matchFeatures类型声明没写
import {Image, matchFeatures, readImage, Region} from "image";

/**
 * @description 坐标
 */
export interface Point {
    /**
     * @Description: x坐标
     */
    x: number
    /**
     * @Description: x坐标
     */
    y: number
}

export interface GetPointByFeaturesOption {
    scale?: number
    region?: Region
}

/**
 * @description 根据裁剪后的小图中的坐标，返回原来大图中对应的坐标
 * @param smallX 小图中的x坐标
 * @param smallY 小图中的y坐标
 */
function calOriginalPoint(smallX: number, smallY: number): Point {
    const originalX = deviceInfo.longSide as number / (deviceInfo.smallWidth as number) * smallX
    const originalY = deviceInfo.shortSide as number / (deviceInfo.smallHeight as number) * smallY
    return {x: originalX, y: originalY}
}

/**
 * 返回文字识别结果中指定文字的坐标
 * @param hrOcrResult 文字识别结果
 * @param text 指定文字
 * @returns 找到返回坐标，找不到返回null
 */
function getHrOcrResultItemPointByText(hrOcrResult: HrOcrResult, text: string): HrOcrResultItem | null {
    let item = hrOcrResult.find(item => item.text === text)
    if (item) {
        return item
    } else {
        console.log(`hrOcrResult数组中未找到text值为【${text}】的item`)
        console.log('hrOcrResult数组为', hrOcrResult)
        return null
    }
}

/**
 * 全分辨率找图,从截图对象上找小图
 * 能用比例计算坐标的的尽量用比例计算。特征找图的耗时要几百毫秒
 * 特征匹配。比普通的模板匹配更兼容不同分辨率或旋转形变，但效率更低。
 * 若要提高效率，可以在计算大图特征时调整scale参数，方法默认为0.5,我给了0.8
 * 越小越快，但可以放缩过度导致匹配错误
 * 计算大图的特征。若在特征匹配时无法搜索到正确结果，可以调整这里的参数，比如{scale: 1}
 * 也可以指定{region: [...]}参数只计算这个区域的特征提高效率
 * @param capture 图片对象
 * @param path 小图的图片路径  例如：`${deviceInfo.pathDir}/img/close.png`)`
 * @param option 选项
 * @return 返回小图在大图中的中心点的坐标。没找到返回null
 * @see https://pro.autojs.org/docs/zh/v9/generated/classes/image.Image.html#detectandcomputefeatures
 */

async function getPointByFeatures(capture: Image, path: string, option: GetPointByFeaturesOption = {scale: 0.8}): Promise<Point | null> {
    console.log(`全分辨率找图开始,图片路径为${path}`);
    let start = Date.now();
    let smallPic = await readImage(path);
    // 计算小图特征
    // @ts-ignore detectAndComputeFeatures类型声明没写
    let smallPicFeatures = await smallPic.detectAndComputeFeatures();
    //@ts-ignore detectAndComputeFeatures类型声明没写
    let captureFeatures = await capture.detectAndComputeFeatures(option);
    // 特征匹配
    let result = await matchFeatures(captureFeatures, smallPicFeatures);
    // 回收特征对象
    captureFeatures.recycle();
    smallPicFeatures.recycle();
    let end = Date.now();
    console.log(`全分辨率找图时间: ${end - start}ms`);
    console.log('全分辨率找图结果:',result)
    if (result) {
        const {topLeft,bottomRight} = result
        const centerX = (topLeft.x + bottomRight.x) / 2
        const centerY = (topLeft.y + bottomRight.y) / 2
        console.log(`全分辨率找图成功,中心点坐标为${centerX},${centerY}`);
        return {x: centerX, y: centerY}
    } else {
        console.log(`全分辨率找图失败,未匹配图片${path}`);
        return null
    }
}


export {
    calOriginalPoint,
    getHrOcrResultItemPointByText,
    getPointByFeatures
}