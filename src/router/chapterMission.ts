import {clickByHrOcrResultAndText, clickCenter, clickCenterBottom, clickCenterTop} from "@/utils/accessibilityUtil";
import {Route} from "@/router/index";
import {deviceInfo, gameInfo} from "@/state";
import {click} from "accessibility";
import {delay} from "lang";
import {callVueMethod} from "@/utils/webviewUtil";

/**
 * @File 章节关卡
 */

const finish = () => {
    gameInfo.isChapterMissionEnd = true
    callVueMethod('chapterMissionEnd')
}

const chapterMission: Route[] = [
    {
        describe: '关卡界面',
        keywords: {
            include: ['开始行动','代理指挥'],
        },
        action: async function ({ocrResult}) {
            await clickByHrOcrResultAndText(ocrResult, '开始行动')
        }
    },
    {
        describe: '关卡界面_点击开始行动后的界面',
        keywords: {
            include: ['本次行动配置不可更改'],
        },
        action: async function ({ocrResult}) {
            const x = 0.859 * (deviceInfo.longSide as number)
            const y = 0.745 * (deviceInfo.shortSide as number)
            await click(x, y)
        }
    },
    {
        describe: '关卡结束界面',
        keywords: {
            include: ['全员信赖提升'],
        },
        action: async function ({ocrResult}) {
            await clickCenterTop()
        }
    },
    {
        describe: '没理智界面',
        keywords: {
            include: ['是否花费以上理智合剂提升'],
        },
        action: async function ({ocrResult}) {
            // 点击取消遮罩
            await clickCenterTop()
            // 流程结束
            finish()
        }
    },
    {
        describe: '没理智界面',
        keywords: {
            include: ['是否花费','至纯源石兑换'],
        },
        action: async function ({ocrResult}) {
            // 点击取消遮罩
            await clickCenterTop()
            // 流程结束
            finish()
        }
    },
    {
        describe: '继续结算',
        keywords: {
            include: ['继续结算'],
        },
        action: async function ({ocrResult}) {
            await clickByHrOcrResultAndText(ocrResult, '继续结算')
        }
    },
]
export {
    chapterMission
}