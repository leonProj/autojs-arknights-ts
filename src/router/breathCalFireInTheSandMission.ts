import {
    clickByHrOcrResultAndText,
    clickCenter,
    clickCenterBottom,
    clickCenterTop,
    clickRedConFirm
} from "@/utils/accessibilityUtil";
import {Route} from "@/router/index";
import {deviceInfo, gameInfo, otherInfo} from "@/state";
import {click, press} from "accessibility";
import {delay} from "lang";
import {callVueMethod} from "@/utils/webviewUtil";
import {initBreathCalFireInTheSandGameInfo} from "@/main";

/**
 * @File 生息演算 沙中之火 路由
 */

const finish = () => {
    gameInfo.isBreathCalFireInTheSandEnd = true
    callVueMethod('breathCalFireInTheSandEnd')
}

let decCount = 0 // 决断使用次数

const  prepareAction = async () => {
    //行动准备 1517/1710=0.886  882/961=0.918
    const x1 = 0.886 * (deviceInfo.longSide as number)
    const y1 = 0.918 * (deviceInfo.shortSide as number)
    await click(x1, y1)
    // 等待淡入动画
    await delay(600)

    // 开始行动
    const x2 = 0.882 * (deviceInfo.longSide as number)
    const y2 = 0.452 * (deviceInfo.shortSide as number)
    await click(x2, y2)
    // 等待淡入动画
    await delay(600)

    // 确认弹框 1288/1711=0.752  663/962=0.689
    const x3 = 0.752 * (deviceInfo.longSide as number)
    const y3 = 0.689 * (deviceInfo.shortSide as number)
    await click(x3, y3)
    // 等待淡入动画
    await delay(2000)
}


const breathCalFireInTheSandMission: Route[] = [
    {
        describe: '主界面1',
        keywords: {
            include: ['开始', '演算', '沙','火'],
        },
        action: async function ({ocrResult}) {
            await clickByHrOcrResultAndText(ocrResult, '开始')
            // 等待淡入动画
            await delay(1500)
        }
    },
    {
        describe: '主界面2',
        keywords: {
            include: ['继续', '演算', '沙','火'],
        },
        action: async function ({ocrResult}) {
            await clickByHrOcrResultAndText(ocrResult, '继续')
            // 等待淡入动画
            await delay(1500)
        }
    },
    {
        describe: '让你选人界面',
        keywords: {
            include: ['请点击进行编队初始化'],
        },
        action: async function () {
            // 1302/1412= 0.92 55/789=0.0699
            const x1 = 0.92 * (deviceInfo.longSide as number)
            const y1 = 0.0699 * (deviceInfo.shortSide as number)
            await click(x1, y1)
            // 等待淡入动画
            await delay(1500)

            // 全队补充界面 1441/1771=0.81   873/962=0.907
            const x2 = 0.81 * (deviceInfo.longSide as number)
            const y2 = 0.907 * (deviceInfo.shortSide as number)
            await click(x2, y2)
            await delay(1500)
        }
    },
    {
        describe: '全队补充界面',
        keywords: {
            include: ['全队补充'],
            exclude: ['行动准备','工具箱']
        },
        action: async function ({ocrResult}) {
            await clickByHrOcrResultAndText(ocrResult, '全队补充')
            // 等待淡入动画
            await delay(1500)
        }
    },
    {
        describe: '演算开始',
        keywords: {
            include: ['演算开始'],
        },
        action: async function ({ocrResult}) {
            await clickByHrOcrResultAndText(ocrResult, '演算开始')
            // 等待换天动画效果
            await delay(5000)
        }
    },
    {
        describe: '今日日报弹框',
        keywords: {
            include: ['今日日报'],
        },
        action: async function () {
            // 1343/1411 = 0.952  748/792=0.944
            const x = 0.952 * (deviceInfo.longSide as number)
            const y = 0.944 * (deviceInfo.shortSide as number)
            await click(x, y)
            // 等待淡入动画
            await delay(600)

            // 点击中间放大地图
            console.log('点击中间放大地图')
            await clickCenter()
            // 等待淡入动画
            await delay(1500)
        }
    },
    {
        describe: '地图中间放大后的界面',
        keywords: {
            include: ['资源区'],
            exclude:['敌人详情','关卡地图','紧急','事态','Industry','News','行动'],
        },
        action: async function ({ocrResult}) {
            await clickByHrOcrResultAndText(ocrResult, '资源区')
            await delay(1000)
        }
    },
    {
        describe: '点数不足的界面',
        keywords: {
            include: ['进入下一天'],
        },
        action: async function () {
            // 1701/1846=0.922  56/1023=0.055
            const x = 0.922 * (deviceInfo.longSide as number)
            const y = 0.055 * (deviceInfo.shortSide as number)
            await click(x, y)
            // 决断次数重置
            decCount = 0
            // 等待淡入动画
            await delay(4000)
        }
    },
    {
        describe: '开始行动界面',
        keywords: {
            include: ['开始行动'],
        },
        action: async function () {
            // 开始行动
            const x = 0.9 * (deviceInfo.longSide as number)
            const y = 0.88 * (deviceInfo.shortSide as number)
            console.log('点击开始行动')
            await click(x, y)
            await delay(1000)
            if(decCount<2){
                await prepareAction()
            }
        }
    },
    {
        describe: '游戏中界面',
        keywords: {
            include: ['剩余可放置角色'],

        },
        action: async function ({ocrResult, capture}) {
            await delay(2000)
            // 打紧急关卡
            if(gameInfo.isBreathCalFireInTheSandEmergency){
                // 是否开启了两倍速 没开就点一下
                if(!gameInfo.isBreathCalFireInTheSandEmergencyDoubleTime){
                    // 1588/1846=0.861  75/1041=0.072
                    const x = 0.861 * (deviceInfo.longSide as number)
                    const y = 0.072 * (deviceInfo.shortSide as number)
                    await click(x, y)
                    gameInfo.isBreathCalFireInTheSandEmergencyDoubleTime=true
                }
            }
            // 其他普通资源关卡
            else {
                // 81/1412=0.057  58/792=0.073
                const x = 0.057 * (deviceInfo.longSide as number)
                const y = 0.073 * (deviceInfo.shortSide as number)
                await click(x, y)
                // 等待淡入动画
                await delay(1000)

                // 确认离开界面 1379/1708=0.806  569/961=0.594
                const x1 = 0.806 * (deviceInfo.longSide as number)
                const y1 = 0.594 * (deviceInfo.shortSide as number)
                await click(x1, y1)
                await delay(2000)

                // 决断使用次数加1
                decCount++
            }
        }
    },
    {
        describe: '行动结束界面',
        keywords: {
            include: ['行动结'],
        },
        action: async function ({ocrResult}) {
            await clickCenterTop()
            // 等待淡入动画
            await delay(4000)
        }
    },
    {
        describe: '播报界面',
        keywords: {
            include: ['Industry','News'],
        },
        action: async function ({ocrResult}) {
            // 1747/1846=0.946 50/1040=0.048
            const x = 0.946 * (deviceInfo.longSide as number)
            const y = 0.048 * (deviceInfo.shortSide as number)
            await click(x, y)
            // 等待淡入动画
            await delay(700)
        }
    },
    {
        describe: '决断DD,没有日报的时候',
        keywords: {
            include: ['决断DD'],
        },
        action: async function ({ocrResult}) {
           await clickCenter()
            // 等待淡入动画
            await delay(1500)
        }
    },
    {
        describe: '紧急事态界面',
        keywords: {
            includeOne:['事态','零洁']
        },
        action: async function () {
            // await clickCenter()
            // // 等待淡入动画
            // await delay(1500)

            await clickCenter()
            // 等待淡入动画
            await delay(1500)

            // 开始行动 1349/1710=0.789  842/958=0.879
            const x = 0.789 * (deviceInfo.longSide as number)
            const y = 0.879 * (deviceInfo.shortSide as number)
            await click(x, y)
            await delay(1500)

            await prepareAction()
            gameInfo.isBreathCalFireInTheSandEmergency = true
        }
    },
    {
        describe: '结算界面',
        keywords: {
            include: ['天数','得分'],
        },
        action: async function () {
            // 初始化数据
            initBreathCalFireInTheSandGameInfo()
            // 1681/1846=0.910  900/1023=0.881
            const x1 = 0.910 * (deviceInfo.longSide as number)
            const y1 = 0.881 * (deviceInfo.shortSide as number)
            await click(x1, y1)
            // 等待淡入动画
            await delay(1500)

            const x2 = 0.946 * (deviceInfo.longSide as number)
            const y2 = 0.888 * (deviceInfo.shortSide as number)
            await click(x2, y2)
            // 等待淡入动画
            await delay(1000)

            // 获得物资
            await clickCenterTop()
            callVueMethod('breathCalFireInTheSandCountAdd')
            // 等待淡入动画
            await delay(1000)
        }
    },
    {
        describe: '正在提交反馈至神经Loading',
        keywords: {
            include: ['正在提交反馈至神经'],
        },
        action: async function () {
            console.log('正在提交反馈至神经Loading中');
            await delay(1500);
        }
    },
    {
        describe: '脚本界面',
        keywords: {
            include: ['查看日志'],
        },
        action: async function () {
            console.log('脚本界面 睡眠5s种');
            await delay(5000)
        }
    },
    {
        describe: '是否确认进入下一天',
        keywords: {
            include: ['是否确认进入下一天'],
        },
        action: async function () {
            const x3 = 0.752 * (deviceInfo.longSide as number)
            const y3 = 0.689 * (deviceInfo.shortSide as number)
            await click(x3, y3)
            await delay(5000)
        }
    },

]

export {
    breathCalFireInTheSandMission
}