import {
    clickByHrOcrResultAndText,
    clickCenter,
    clickCenterBottom,
    clickCenterTop,
    clickRedConFirm
} from "@/utils/accessibilityUtil";
import {Route} from "@/router/index";
import {deviceInfo, gameInfo, otherInfo} from "@/state";
import {click} from "accessibility";
import {delay} from "lang";
import {callVueMethod} from "@/utils/webviewUtil";

/**
 * @File 生息演算 沙中之火 路由
 */

const finish = () => {
    gameInfo.isBreathCalFireInTheSandEnd = true
    callVueMethod('breathCalFireInTheSandEnd')
}


const breathCalFireInTheSandMission: Route[] = [
    {
        describe: '主界面',
        keywords: {
            include: ['开始', '演算', '沙中之火'],
        },
        action: async function ({ocrResult}) {
            await clickByHrOcrResultAndText(ocrResult, '开始')
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
            const x = 0.92 * (deviceInfo.longSide as number)
            const y = 0.0699 * (deviceInfo.shortSide as number)
            await click(x, y)
            // 等待淡入动画
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
            await delay(1500)
        }
    },
    {
        describe: '地图界面',
        keywords: {
            include: ['决断', 'DD'],// DD是决断下面的那个箭头，被识别成了DD
        },
        action: async function () {
            // 点击中间放大地图
            await clickCenter()
            // 等待淡入动画
            await delay(1000)
        }
    },
    {
        describe: '地图中间放大后的界面',
        keywords: {
            include: ['资源区', '捕猎区'],
            exclude:['敌人详情','关卡地图','紧急','事态'],
        },
        action: async function ({ocrResult}) {
            await clickByHrOcrResultAndText(ocrResult, '资源区')
            // 等待淡入动画
            await delay(1000)
        }
    },
    {
        describe: '开始行动界面',
        keywords: {
            include: ['敌人详情','关卡地图'],
            exclude: ['进入下一天']
        },
        action: async function () {
            // 1674/1902=0.879 938/1067=0.879
            const x = 0.879 * (deviceInfo.longSide as number)
            const y = 0.879 * (deviceInfo.shortSide as number)
            await click(x, y)
            // 等待淡入动画
            await delay(1500)
        }
    },
    {
        describe: '行动准备界面',
        keywords: {
            include: ['行动准备'],
        },
        action: async function ({ocrResult}) {
            await clickByHrOcrResultAndText(ocrResult, '行动准备')
            // 等待淡入动画
            await delay(1000)
        }
    },
    {
        describe: '行动准备开始行动界面',
        keywords: {
            include: ['工具箱', '决断'],
        },
        action: async function () {
            // 1244/1412=0.882  360/792=0.452
            const x = 0.882 * (deviceInfo.longSide as number)
            const y = 0.452 * (deviceInfo.shortSide as number)
            await click(x, y)
            // 等待淡入动画
            await delay(1000)
        }
    },
    {
        describe: '编队没人警告弹框',
        keywords: {
            include: ['确认开始行动', '没有可以上场的干员'],
        },
        action: async function ({ capture}) {
            await clickRedConFirm(capture)
            // 等待淡入动画
            await delay(6000)
        }
    },
    {
        describe: '游戏中界面',
        keywords: {
            include: ['剩余可放置角色'],

        },
        action: async function ({ocrResult, capture}) {
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
            }
        }
    },
    {
        describe: '确认离开界面',
        keywords: {
            include: ['确认离开'],
        },
        action: async function ({ocrResult}) {
            await clickByHrOcrResultAndText(ocrResult, '确认离开')
            // 等待淡入动画
            await delay(2000)
        }
    },
    {
        describe: '行动结束界面',
        keywords: {
            include: ['行动结束'],
        },
        action: async function ({ocrResult}) {
            await clickByHrOcrResultAndText(ocrResult, '行动结束')
            // 等待淡入动画
            await delay(4000)
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
            // 等待淡入动画
            await delay(6000)
        }
    },
    {
        describe: '播报界面',
        keywords: {
            include: ['跳过'],
        },
        action: async function ({ocrResult}) {
            // 1747/1846=0.946 50/1040=0.048
            // const x = 0.946 * (deviceInfo.longSide as number)
            // const y = 0.048 * (deviceInfo.shortSide as number)
            // await click(x, y)
            await clickByHrOcrResultAndText(ocrResult, '跳过')
            // 等待淡入动画
            await delay(2000)
        }
    },
    {
        describe: '紧急事态界面',
        keywords: {
            include: ['零洁','孕'], // 紧急事态被识别成了这几个字 笑死
        },
        action: async function () {
            await clickCenter()
            // 等待淡入动画
            await delay(1500)
        }
    },
    {
        describe: '紧急事态 点击地图界面',
        keywords: {
            include: ['紧急','事态','区'], // 紧急事态又能识别正确了 离谱
        },
        action: async function () {
            await clickCenter()
            // 等待淡入动画
            await delay(1000)
        }
    },
    {
        describe: '紧急事态 点击地图界面',
        keywords: {
            include: ['紧急','事态','区'], // 紧急事态又能识别正确了 离谱
        },
        action: async function () {
            await clickCenter()
            // 等待淡入动画
            await delay(1000)
        }
    },
    {
        describe: '紧急事态开始行动界面',
        keywords: {
            include: ['决断D1)开始行动'],
        },
        action: async function ({ocrResult}) {
            await clickByHrOcrResultAndText(ocrResult, '决断D1)开始行动')
            gameInfo.isBreathCalFireInTheSandEmergency = true
            // 等待淡入动画
            await delay(1500)
        }
    },
    {
        describe: '结算界面1',
        keywords: {
            include: ['天数','得分'],
        },
        action: async function () {
            // 初始化数据
            gameInfo.isBreathCalFireInTheSandEmergency = false
            gameInfo.isBreathCalFireInTheSandEmergencyDoubleTime = false
            // 1681/1846=0.910  900/1023=0.881
            const x = 0.910 * (deviceInfo.longSide as number)
            const y = 0.881 * (deviceInfo.shortSide as number)
            await click(x, y)
            // 等待淡入动画
            await delay(1000)
        }
    },
    {
        describe: '结算界面2',
        keywords: {
            include: ['总分'],
        },
        action: async function () {
            // 1747/1846=0.946  905/1023=0.888
            const x = 0.946 * (deviceInfo.longSide as number)
            const y = 0.888 * (deviceInfo.shortSide as number)
            await click(x, y)
            // 等待淡入动画
            await delay(1000)
        }
    },
    {
        describe: '获得物资',
        keywords: {
            include: ['获得物资'],
        },
        action: async function () {
            await clickCenterTop()
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
            include: ['开始运行'],
        },
        action: async function () {
            otherInfo.forceStop = true
        }
    },

]

export {
    breathCalFireInTheSandMission
}