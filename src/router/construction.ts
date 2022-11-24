/**
 * @file 基建
 */
import {
    backHomePage, clickBack,
    clickByHrOcrResultAndText,
    clickCenter,
    clickPlus,
    clickRedConFirm,
    swipePlus
} from "@/utils/accessibilityUtil";
import {deviceInfo, gameInfo} from "@/state";
import {Color} from "color";
import {detectsColor} from "image";
import {click} from "accessibility";
import {hrOcr, HrOcrResult, HrOcrResultItem} from "@/utils/ocrUtil";
import {Point} from "@/utils/point";
import {delay} from "lang";
import {Route} from "@/router/index";
import {captureAndClip} from "@/utils/imageUtil";
import {ScreenCapturer} from "media_projection";
import {callVueMethod} from "@/utils/webviewUtil";

const finish = () => {
    gameInfo.isConstructionEnd = true
    // 重置批量和宿舍为false
    gameInfo.isConstructionBatchEnd = false
    gameInfo.isConstructionDormitoryEnd = false
    callVueMethod('constructionEnd')
}
const construction: Route[] = [
    {
        describe: '是否确认离开罗德岛基建确认弹框',
        keywords: {
            include: ['是否确认离开罗德岛基建'],
        },
        action: async function ({capture}) {
            await clickRedConFirm(capture)
        }
    },
    {
        describe: '基建页面',
        keywords: {
            include: ['进驻总览'],
            exclude: ['蓝图预览']
        },
        action: async function ({ocrResult}) {
            await delay(500)
            const capture = await captureAndClip(deviceInfo.capturer as ScreenCapturer)
            // 如果批量操作没做，就点击小铃铛 走批量流程
            if (!gameInfo.isConstructionBatchEnd) {
                console.log('点击小铃铛');
                // 小图中铃铛的坐标
                const smallX = 0.952 * (deviceInfo.smallWidth as number)
                const smallY = 0.129 * (deviceInfo.smallHeight as number)
                // 原图中铃铛的坐标
                const x = 0.952 * (deviceInfo.longSide as number)
                const warningColor = Color.parse('#cb4d54')
                // 有红色感叹号的时候，铃铛是在感叹号的下面
                if (detectsColor(capture, warningColor, smallX, smallY, {threshold: 20})) {
                    console.log('点击感叹号下面的小铃铛');
                    const y = 0.195 * (deviceInfo.shortSide as number)
                    await click(x, y)
                } else {
                    const y = 0.129 * (deviceInfo.shortSide as number)
                    await click(x, y)
                }
            }
            // 否则就点击进驻总览走替换干员流程
            else {
                await clickByHrOcrResultAndText(ocrResult, '进驻总览')
            }
            capture.recycle()
        }
    },
    {
        describe: '基建_点击铃铛后批量收菜界面_有可收获',
        keywords: {
            include: ['可收获'],
        },
        action: async function ({ocrResult}) {
            await clickByHrOcrResultAndText(ocrResult, '可收获')
        }
    },
    {
        describe: '基建_点击铃铛后批量收菜界面_有订单交付',
        keywords: {
            include: ['订单交付'],
        },
        action: async function ({ocrResult}) {
            await clickByHrOcrResultAndText(ocrResult, '订单交付')
        }
    },
    {
        describe: '基建_点击铃铛后批量收菜界面_有干员信赖',
        keywords: {
            include: ['干员信赖'],
        },
        action: async function ({ocrResult}) {
            await clickByHrOcrResultAndText(ocrResult, '干员信赖')
        }
    },
    {
        describe: '基建_点击铃铛后批量收菜界面_订单交付，干员信赖，可收获都没有',
        // 路由有顺序，上面三个路由没有才会到这里，所以这里不需要加exclude字段
        keywords: {
            include: ['待办事项'],
        },
        action: async function ({ocrResult}) {
            gameInfo.isConstructionBatchEnd = true
            // 点击空白处 取消批量操作的界面
            await clickCenter()
        }
    },
    {
        describe: '基建_进驻总览界面',
        keywords: {
            include: ['蓝图预览'],
            ocrFix: {'你': '休'} // 休息中-你息中
        },
        action: async function ({ocrResult}) {
            // 延迟截图，等待淡出动画
            await delay(500)
            const capture = await captureAndClip(deviceInfo.capturer as ScreenCapturer)
            // 所有的建筑  name：名称  num：所需人员数量
            const buildings = [
                {
                    name: '控制中枢',
                    num: 5,
                },
                {
                    name: '训练室',
                    num: 1,
                },
                {
                    name: '会客室',
                    num: 2,
                },
                {
                    name: '贸易站',
                    num: 3,
                }, {
                    name: '制造站',
                    num: 3,
                }, {
                    name: '发电站',
                    num: 1,
                }, {
                    name: '宿舍',
                    num: 5,
                }, {
                    name: '加工站',
                    num: 1
                }, {
                    name: '办公室',
                    num: 1,
                }, {
                    name: '训练室',
                    num: 1,
                }]
            // 过滤出所有的建筑
            let ocrFilterResult = ocrResult.filter(ocrItem => {
                return buildings.some((building) => {
                    return ocrItem.text.includes(building.name)
                })
            })
            console.log(`一共识别到${ocrFilterResult.length}个建筑`)
            if (ocrFilterResult.length < 3) {
                console.log('识别到的建筑数量不足3个，重新识别')
                return
            }
            ocrFilterResult = ocrFilterResult.slice(0, 3)// 只取前三个建筑，第四个建筑可能名字有，但是人物下标没有
            console.log('只取前三个建筑')
            ocrFilterResult.forEach((ocrItem, index) => {
                console.log(`分别为：${index}:${ocrItem.text}`);
            })
            // 一行方框的高度为建筑名称文字的高度的4倍
            const lineHeight = (ocrFilterResult[0].y2 - ocrFilterResult[0].y1) * 4
            // 获取一行基建中已存在人员的的序号
            const getExitPeopleIndex = (ocrResult: HrOcrResult): number[] => {
                // 计算出休息中的人在进驻概览中的序号
                const exitPeopleIndexArr = []
                for (const item of ocrResult) {
                    if (item.x < 0.568 * (deviceInfo.smallWidth as number)) {
                        exitPeopleIndexArr.push(0)
                    } else if (item.x < 0.651 * (deviceInfo.smallWidth as number) && item.x > 0.568 * (deviceInfo.smallWidth as number)) {
                        exitPeopleIndexArr.push(1)
                    } else if (item.x < 0.740 * (deviceInfo.smallWidth as number) && item.x > 0.651 * (deviceInfo.smallWidth as number)) {
                        exitPeopleIndexArr.push(2)
                    } else if (item.x < 0.828 * (deviceInfo.smallWidth as number) && item.x > 0.740 * (deviceInfo.smallWidth as number)) {
                        exitPeopleIndexArr.push(3)
                    } else if (item.x > 0.828 * (deviceInfo.smallWidth as number)) {
                        exitPeopleIndexArr.push(4)
                    }
                }
                return exitPeopleIndexArr
            }

            // 是否有一个建筑需要换
            let isThereOneBuildingNeedChange = false
            for (const ocrFilterItem of ocrFilterResult) {
                /**
                 * 获取一行基建中空位置的序号
                 */
                const getEmptyPeopleIndex = (): number[] => {
                    const emptyPeopleIndex: number[] = []
                    const y = ocrFilterItem.y2  // 937/1864 = 0.503
                    const plusGreyColor = Color.parse('#898989') // 加号的底色 946/1864=0.507    1105/1864 = 0.593
                    const arr = [
                        [0.507, 0.525],
                        [0.593, 0.618],
                        [0.707, 0.725],
                        [0.794, 0.812],
                        [0.877, 0.895],
                    ]
                    for (let i = 0; i < arr.length; i++) {
                        const item = arr[i]
                        const index = i
                        // 迷迭香的头发颜色是#7e7e7e，会被误认为是空位置，所以这里用两点底色确定是否是空位置，
                        const x1 = item[0] * (deviceInfo.smallWidth as number)
                        const x2 = item[1] * (deviceInfo.smallWidth as number)
                        if (detectsColor(capture, plusGreyColor, x1, y, {threshold: 20}) && detectsColor(capture, plusGreyColor, x2, y, {threshold: 20})) {
                            emptyPeopleIndex.push(index)
                        }
                    }

                    return emptyPeopleIndex
                }

                // 清空选择按钮位置
                const clearBtnX = 0.39 * (deviceInfo.longSide as number)
                const clearBtnY = 0.94 * (deviceInfo.shortSide as number)
                //确认按钮
                const confirmBtnX = 0.92 * (deviceInfo.longSide as number)
                const confirmBtnY = clearBtnY
                // 行列坐标对象
                const locationObj = {
                    row1: 0.3 * (deviceInfo.shortSide as number),
                    row2: 0.7 * (deviceInfo.shortSide as number),
                    column1: 0.375 * (deviceInfo.longSide as number),
                    column2: 0.495 * (deviceInfo.longSide as number),
                    column3: 0.6 * (deviceInfo.longSide as number),
                    column4: 0.72 * (deviceInfo.longSide as number),
                    column5: 0.83 * (deviceInfo.longSide as number)
                }
                // 行列坐标数组
                const rowNum = 2
                const columnNum = 5
                const locationArr: Point[] = []
                for (let i = 1; i <= columnNum; i++) {
                    for (let j = 1; j <= rowNum; j++) {
                        locationArr.push({
                            // @ts-ignore
                            x: locationObj[`column${i}`],
                            // @ts-ignore
                            y: locationObj[`row${j}`]
                        })
                    }
                }

                /**
                 * 点击进驻概览的第一个干员，进入换人界面
                 */
                const enterBuilding = async () => {
                    // 一行建筑方框中，第一个干员的位置  987/1871=0.525
                    const firstOperatorLocation = {
                        x: 0.525 * (deviceInfo.smallWidth as number),
                        y: ocrFilterItem.y2 + (ocrFilterItem.y2 - ocrFilterItem.y1)
                    }
                    // 点击第一个干员进入换人界面，
                    console.log(`点击第一个干员坐标`)
                    await clickPlus({x: firstOperatorLocation.x, y: firstOperatorLocation.y})
                    // 延迟一下，等待淡出动画
                    await delay(900)
                }

                /**
                 * 判断坐标是否是在指定一行建筑方框之间
                 * @param ocrItem
                 */
                const isInThisLine = (ocrItem: HrOcrResultItem) => {
                    // 一行建筑方框底部y最大坐标
                    const lineMaxY = ocrFilterItem.y1 + lineHeight
                    return ocrItem.y1 < lineMaxY && ocrItem.y1 > ocrFilterItem.y1
                }

                // 没人工作的在一行中的序号
                const emptyIndex = getEmptyPeopleIndex()
                console.log(`${ocrFilterItem.text}有${emptyIndex.length}个位置空着`)
                console.log(`空着的人员序号：${emptyIndex}`)
                // @ts-ignore
                // 这个建筑总共需要几个人
                const peopleNum = buildings.find(building => {
                    return ocrFilterItem.text.includes(building.name)
                }).num
                console.log(`${ocrFilterItem.text}一共需要${peopleNum}个人`)

                // 如果宿舍换班流程没结束
                if (!gameInfo.isConstructionDormitoryEnd) {
                    // 宿舍休息流程
                    if (ocrFilterItem.text.includes('宿舍')) {
                        console.log(`看看${ocrFilterItem.text}要不要换人休息`)
                        // 正在休息的人数
                        let stillRestPeople = ocrResult.filter(ocrItem => {
                            return isInThisLine(ocrItem) && ocrItem.text.includes('休息中')
                        })
                        console.log(`${ocrFilterItem.text}有${stillRestPeople.length}个人在休息中`)
                        const stillRestPeopleIndex = getExitPeopleIndex(stillRestPeople)
                        console.log(`休息中人员序号：${stillRestPeopleIndex}`)
                        console.log(`实际需要换：${(peopleNum - stillRestPeople.length)}个人`)
                        // 如果休息人数小于5 或者 空着的人数大于 0 则需要换人
                        if (stillRestPeople.length < peopleNum || emptyIndex.length > 0) {
                            isThereOneBuildingNeedChange = true
                            // 点击第一个干员进入换人界面，
                            await enterBuilding()
                            // 点击清空按钮
                            await click(clearBtnX, clearBtnY)
                            // 换人
                            const start = peopleNum - emptyIndex.length
                            const end = start + (peopleNum - stillRestPeople.length)
                            for (let i = start; i < end; i++) {
                                // 点击新加的干员
                                await click(locationArr[i].x, locationArr[i].y)
                            }
                            // 点击原来休息中的干员
                            for (let i = 0; i < stillRestPeopleIndex.length; i++) {
                                await click(locationArr[i].x, locationArr[i].y)
                            }
                            // 点击确认按钮
                            await click(confirmBtnX, confirmBtnY)
                            console.log(`${ocrFilterItem.text}换班完毕`)
                            break
                        } else {
                            console.log(`${ocrFilterItem.text}不需要换班`)
                        }
                    }
                } else {
                    // 训练室流程
                    if (ocrFilterItem.text.includes('训练室')) {
                        // 注意力涣散的
                        const tiredPeople: HrOcrResult = ocrResult.filter(ocrItem => isInThisLine(ocrItem) && ocrItem.text.includes('注意力'))
                        console.log(`${ocrFilterItem.text}有${tiredPeople.length}个人涣散了`)
                        // 训练位是否有人
                        const isTraining = !emptyIndex.some(eIndex => eIndex === 1)
                        const isStillHelp = !emptyIndex.some(eIndex => eIndex === 0)

                        /**
                         * 训练室换人
                         * @param needChange 是否需要换人，false则只是清空
                         */
                        const change = async (needChange: boolean = false) => {
                            isThereOneBuildingNeedChange = true
                            //进入
                            await enterBuilding()
                            // 清空
                            await click(locationArr[0].x, locationArr[0].y)
                            //换人
                            if (needChange) {
                                await click(locationArr[1].x, locationArr[1].y)
                            }
                            // 点击确认按钮
                            await click(confirmBtnX, confirmBtnY)
                            console.log(`${ocrFilterItem.text}换班完毕`)
                        }

                        // 如果有人涣散了
                        if (tiredPeople.length > 0) {
                            // 训练位有人就换协助位，没人则清空协助位
                            console.log(`${ocrFilterItem.text}协助位涣散了`)
                            console.log(`${ocrFilterItem.text}训练位有人就换协助位，没人则清空协助位`)
                            await change(isTraining)
                        }
                        // 没人涣散
                        else {
                            // 协助位有人 ,但是没人训练， 也直接清空
                            if (isStillHelp && !isTraining) {
                                console.log(`${ocrFilterItem.text}协助位有人 ,但是没人训练， 直接清空`)
                                await change()
                            } else {
                                console.log(`${ocrFilterItem.text}不需要换人`)
                            }
                        }
                    }
                    // 普通换班流程
                    else if (!ocrFilterItem.text.includes('宿舍')) {
                        console.log(`看看${ocrFilterItem.text}要不要换班`)
                        // 注意力涣散的
                        const tiredPeople: HrOcrResult = ocrResult.filter(ocrItem => isInThisLine(ocrItem) && ocrItem.text.includes('注意力'))
                        console.log(`${ocrFilterItem.text}有${tiredPeople.length}个人涣散了`)
                        // 注意力涣散的人员在一行中的序号
                        const tiredPeopleIndex = getExitPeopleIndex(tiredPeople)
                        console.log(`涣散人员序号：${tiredPeopleIndex}`)
                        // 工作中的
                        const workingPeopleNum = peopleNum - tiredPeople.length - emptyIndex.length
                        console.log(`${ocrFilterItem.text}有${workingPeopleNum}个人工作中`)
                        // 工作中的人员在一行中的序号
                        const workingPeopleIndex = []
                        for (let i = 0; i < peopleNum; i++) {
                            // 如果这个序号不在涣散人员序号中，也不在空着的人员序号中，则是工作中的人员的序号
                            if (!tiredPeopleIndex.includes(i) && !emptyIndex.includes(i)) {
                                workingPeopleIndex.push(i)
                            }
                        }
                        console.log(`工作中人员序号：${workingPeopleIndex}`)

                        // 如果总共需要的和工作中的人数不一样，说明要换班了
                        const needTurnNum = peopleNum - workingPeopleNum
                        if (needTurnNum !== 0) {
                            isThereOneBuildingNeedChange = true
                            console.log(`${ocrFilterItem.text}要换班`)
                            console.log(`${ocrFilterItem.text}实际需要再换上${needTurnNum}个人`)
                            // 点击第一个干员进入换人界面，
                            await enterBuilding()
                            // 点击清空按钮
                            await click(clearBtnX, clearBtnY)
                            // 替换干员
                            const start = peopleNum - emptyIndex.length
                            const end = start + needTurnNum
                            for (let i = start; i < end; i++) {
                                // 点击新加的干员
                                await click(locationArr[i].x, locationArr[i].y)
                            }
                            // 点击原来工作中的干员
                            for (let i = 0; i < workingPeopleNum; i++) {
                                await click(locationArr[i].x, locationArr[i].y)
                            }
                            // 点击确认按钮
                            await click(confirmBtnX, confirmBtnY)
                            console.log(`${ocrFilterItem.text}换班完毕`)
                            break
                        }
                        console.log(`${ocrFilterItem.text}不需要换班`)
                    }
                }
            }
            // 如果没有一个建筑需要换班
            if (!isThereOneBuildingNeedChange) {
                // 滚动条在末端时候的位置 和 颜色
                const scrollColorKey = '#69696c'
                const scrollX = 0.979 * (deviceInfo.smallWidth as number)
                const scrollY = 0.914 * (deviceInfo.smallHeight as number)
                console.log(capture.pixel(scrollX, scrollY))
                // 判断是否滚动条到底部
                const isScrollEnd = detectsColor(capture, Color.parse(scrollColorKey), scrollX, scrollY, {threshold: 50})

                if (isScrollEnd) {
                    console.log('滚动条到底了')
                    await delay(500)
                    // 如果宿舍换班流程没结束，就结束宿舍换班流程
                    if (!gameInfo.isConstructionDormitoryEnd) {
                        console.log('宿舍流程结束，准备再次进入换班其他流程')
                        gameInfo.isConstructionDormitoryEnd = true
                        // 重新退出进入开始其他建筑的换班流程
                        await clickBack()
                        await delay(500)
                        // 点击进驻总览位置：比例坐标 x=164/1688=0.096  166/949=0.175
                        const x = 0.096 * (deviceInfo.longSide as number)
                        const y = 0.175 * (deviceInfo.shortSide as number)
                        console.log('再次点击进驻总览')
                        await click(x, y)
                    }
                    // 如果宿舍流程结束了，那么就结束整个流程
                    else {
                        // 回到首页
                        await backHomePage()
                        // 弹框出现动画
                        await delay(500)
                        // 截图
                        const isConfirmCapture = await captureAndClip(deviceInfo.capturer as ScreenCapturer)
                        // 文字识别
                        const isConfirmCaptureOcrResult = hrOcr(deviceInfo.ocr, isConfirmCapture);
                        // 如果有有弹框
                        if (isConfirmCaptureOcrResult.some(ocrItem => ocrItem.text.includes('是否确认离开罗德岛基建'))) {
                            await clickRedConFirm(isConfirmCapture)
                        }
                        isConfirmCapture.recycle()
                        // 基建流程结束
                        finish()
                    }
                } else {
                    console.log('准备滚动')
                    if (ocrFilterResult.length < 3) {
                        console.log('少于3个建筑，ocr可能识别错误，重新识别');
                    } else {
                        // 建筑名称文字的两遍高度
                        const lineHeight = (ocrFilterResult[0].y2 - ocrFilterResult[0].y1)
                        // 滑动起点
                        const start = {x: ocrFilterResult[2].x1, y: ocrFilterResult[2].y1}
                        // 滑动终点
                        const end = {x: ocrFilterResult[0].x1, y: ocrFilterResult[0].y1 - lineHeight}
                        // 滑动
                        await swipePlus(start.x, start.y, end.x, end.y, 1000)
                        // 滚动后的延迟
                        await delay(1000);
                    }
                }
            }
            capture.recycle()
        }
    },
    {
        describe: '基建-换班人员冲突，是否确认排班调整',
        keywords: {
            include: ['确认进行本次排班调整'],
        },
        action: async function ({ocrResult}) {
            await clickByHrOcrResultAndText(ocrResult, '确认')
        }
    },
]

export {
    construction
}