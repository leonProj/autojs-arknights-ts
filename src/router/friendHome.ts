/**
 * @file 好友列表，访问基建
 */

import {backHomePage, clickByHrOcrResultAndText, clickPlus} from "@/utils/accessibilityUtil";
import {HrOcrResultItem} from "@/utils/ocrUtil";
import {detectsColor} from "image";
import {Color} from "color";
import {gameInfo} from "@/state";
import {Route} from "@/router/index";
import {callVueMethod} from "@/utils/webviewUtil";
import {delay} from "lang";

const finish = () => {
    gameInfo.isFriendHomeEnd = true
    callVueMethod('friendHomeEnd')
}
const friendHome: Route[] = [
    {
        describe: '个人名片界面',
        keywords: {
            include: ['好友列表', '添加好友', '助战干员'],
            exclude: ['最近登录时间']
        },
        action: async function ({ocrResult}) {
            await clickByHrOcrResultAndText(ocrResult, '好友列表');
        }
    },
    {
        describe: '好友列表',
        keywords: {
            include: ['最近登录时间', ['访问基建|查看名片', '访问基建查看名片'], '添加好友', '助战干员', '好友列表'],
        },
        action: async function ({ocrResult}) {
            const item = ocrResult.find(item => item.text === '访问基建查看名片' || item.text === '访问基建|查看名片') as HrOcrResultItem
            // 字连在一起了 所以点击左上角坐标
            console.log('点击访问基建')
            await clickPlus({x: item.x1, y: item.y1})
        }
    },
    {
        describe: '好友会客室',
        keywords: {
            include: ['线索传递'],
        },
        action: async function ({capture, ocrResult}) {
            // 等待淡入动画
            await delay(500)
            // 访问下位按钮激活状态下的底色
            const enableColor = '#d15806'
            const nextBtnOcrItem = ocrResult.find(item => item.text === '访问下位')
            if (nextBtnOcrItem) {
                const oneWordWidth = (nextBtnOcrItem.x2 - nextBtnOcrItem.x2) / 4
                const colorX = nextBtnOcrItem.x2 + oneWordWidth
                const colorY = nextBtnOcrItem.y2
                const stillMore = detectsColor(capture, Color.parse(enableColor), colorX, colorY, {threshold: 50})
                // 橘色的访问下位
                if (stillMore) {
                    console.log('点击访问下位')
                    await clickPlus({x: nextBtnOcrItem.x, y: nextBtnOcrItem.y})

                } else {
                    console.log('好友会客室已经全部访问完毕')
                    finish()
                    await backHomePage()
                }
            } else {
                console.log('没有找到访问下位按钮，ocr识别有问题。不做处理')
            }
        }
    },
]

export {
    friendHome
}