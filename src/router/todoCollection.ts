import {clickCenter, clickCenterBottom, clickCenterTop} from "@/utils/accessibilityUtil";
import {Route} from "@/router/index";
import {deviceInfo, gameInfo} from "@/state";
import {click} from "accessibility";
import {delay} from "lang";
import {callVueMethod} from "@/utils/webviewUtil";

/**
 * @File 任务收集
 */

const finish = () => {
    gameInfo.isTodoCollectionEnd = true
    callVueMethod('todoCollectionEnd')
}

const todoCollection: Route[] = [
    {
        describe: '任务收集界面',
        keywords: {
            include: ['周常任务', '主线任务'],
        },
        action: async function () {
            // y坐标
            const y = 0.048 * (deviceInfo.shortSide as number)
            // 点击收集全部
            const clickCollectAll = async () => {
                console.log('点击收集全部');
                const collectAllX = 0.87 * (deviceInfo.longSide as number)
                const collectAllY = 0.186 * (deviceInfo.shortSide as number)
                await click(collectAllX, collectAllY)
            }

            // 日常任务没收集
            if (!gameInfo.isTodoCollectionDailyEnd) {
                console.log('日常任务没收集');
                console.log('点击日常任务');
                const dailyX = 0.46 * (deviceInfo.longSide as number)
                await click(dailyX, y)
                await delay(300)
                await clickCollectAll()
                gameInfo.isTodoCollectionDailyEnd = true
                return
            }
            // 周长任务没收集
            if (!gameInfo.isTodoCollectionWeeklyEnd) {
                console.log('周长任务没收集');
                console.log('点击周长任务');
                const dailyX = 0.67 * (deviceInfo.longSide as number)
                await click(dailyX, y)
                await delay(300)
                await clickCollectAll()
                gameInfo.isTodoCollectionWeeklyEnd = true
                return
            }

            console.log('日常任务和周长任务都收集完了,任务收集流程结束');
            finish()


        }
    },
    {
        describe: '任务收集界面_点击收集获得物资的modal反馈框',
        keywords: {
            include: ['获得物资'],
        },
        action: async function () {
            await clickCenterTop()
        }
    },
]
export {
    todoCollection
}