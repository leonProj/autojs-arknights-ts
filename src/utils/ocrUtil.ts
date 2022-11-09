/**
 * @file: 文字识别方法
 */

import {Image} from "image";


/**
 * @Description: 浩然ocr文字识别
 */
export interface Ocr {
    /**
     * @Description: 文字检测,根据图片返回文字坐标
     * @param img  需识别的图像，为Bitmap类型，Autojs中的图像可通过图像的.getBitmap()方法进行转换。
     * @param ratio  缩放比率，默认为1，在识别较小的图片时可适当调大。
     */
    detect(img: any, ratio?: number): any
}

export interface HrOcrResultItem {
    /**
     * @description 文字内容
     */
    text: string;
    /**
     * @description 文字中心点x坐标
     */
    x: number;
    /**
     * @description 文字中心点y坐标
     */
    y: number;
    /**
     * @description 文字左上角x坐标
     */
    x1: number;
    /**
     * @description 文字左上角y坐标
     */
    y1: number;
    /**
     * @description 文字右下角x坐标
     */
    x2: number;
    /**
     * @description 文字右下角y坐标
     */
    y2: number;
}

export type HrOcrResult = HrOcrResultItem[];

/**
 * @description 文字检测,根据图片返回文字坐标
 */
function hrOcr(ocr:Ocr, capture :Image) :HrOcrResult{
    const start = Date.now();
    let results = ocr.detect(capture.toBitmap(), 1.6);
    const end = Date.now();
    console.log(`hrOcr文字检测检测时间为 ：${end - start}ms`);
    const res = []
    for (let i = 0; i < results.size(); i++) {
        let re = results.get(i)
        let rect = String(re.frame)
        rect = rect.replace("[", "")
        rect = rect.replace("]", "")
        const rectArr = rect.split(",")
        let x1 = Number(rectArr[0]);
        let y1 = Number(rectArr[1]);
        let x2 = Number(rectArr[4]);
        let y2 = Number(rectArr[5]);
        res.push(
            {
                text: re.text,
                x: (x1 + x2) / 2,
                y: (y1 + y2) / 2,
                x1,
                y1,
                x2,
                y2
            })
    }
    return res
}

export {
    hrOcr,
}
