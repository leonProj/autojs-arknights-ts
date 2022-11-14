/**
 * @file 路由，各个页面的判断以及处理逻辑
 */
import {HrOcrResult, HrOcrResultItem} from "@/utils/ocrUtil";
import {detectsColor, Image, readImage} from "image";
import {
    backHomePage,
    clickBack,
    clickByColor, clickByFeatures,
    clickByHrOcrResultAndText,
    clickCenter, clickCenterBottom,
    clickCircleClose, clickPlus, clickRedConFirm, swipePlus
} from "@/utils/accessibilityUtil";
import {delay} from "lang";
import {tag, Tags, tags4, tags5, tags6} from "@/constant/tag";
import {deviceInfo, gameInfo} from "@/state";
import {Color} from "color";
import {click, swipe} from "accessibility";
import {getPointByFeatures} from "@/utils/point";

type Router = RouterItem[]


interface RouterItem {
    /**
     * @description 描述这个路由是什么
     */
    describe: string
    /**
     * @description 页面判断关键字
     */
    keywords: RouterKeywords
    /**
     * @description 页面处理逻辑
     */
    action: RouterAction
}

/**
 * @description 页面判断关键字
 */
interface RouterKeywords {
    /**
     * @description 包含数组中所有的子项目。1 子项为字符串时直接判断。 2 子项为数组时候，数组中有一个字符串符合即可
     */
    include?: (string | string[])[]
    /**
     * @description 不包含数组中所有的文字
     */
    exclude?: string[]
    /**
     * @description 包含数组中一个文字
     */
    includeOne?: string[]
    /**
     * @description ocr 容错处理
     * @example {'莫': '募'}
     */
    ocrFix?: any
}


interface RouterAction {
    (param: RouterActionParam): Promise<void>;
}

interface RouterActionParam {
    /**
     * @description ocr识别结果
     */
    ocrResult: HrOcrResult
    /**
     * @description 截图图片对象
     */
    capture: Image
    /**
     * @description ocr文字识别结果中所有文字拼接成的字符串
     */
    ocrText: string

}

/**
 * 任务字典
 */
const TASK_DICT = {
    publicRecruit: {
        key: 'publicRecruit',
        text: ['公开招募', '公开募'],
    },
    purchase: {
        key: 'purchase',
        text: '采购中心',
    },
    friendHome: {
        key: 'friendHome',
        text: '好友',
    },
    construction: {
        key: 'construction',
        text: '基建',
    }
}


const main: Router = [
    {
        describe: '雷电模拟器主界面',
        keywords: {
            include: ['系统应用', '搜索游戏或应用'],
            exclude: ['文件管理器'],
        },
        action: async function ({ocrResult}) {
            await clickByHrOcrResultAndText(ocrResult, '明日方舟');
        }
    },
    {
        describe: '明日方舟开始的start界面',
        keywords: {
            include: ['CADPAVer', '网络检测', '清除缓存'],
        },
        action: async function () {
            await clickCenter()
        }
    },
    {
        describe: '明日方舟登录开始唤醒界面',
        keywords: {
            include: ['鹰角网络', '开始唤醒', '账号管理', '用户协议'],
        },
        action: async function ({ocrResult}) {
            await clickByHrOcrResultAndText(ocrResult, '开始唤醒');

        }
    },
    {
        describe: '明日方舟主界面_签到物资弹窗',
        keywords: {
            include: ['今日配给'],
        },
        action: async function ({ocrResult}) {
            await clickByHrOcrResultAndText(ocrResult, '今日配给');
        }
    },
    {
        describe: '明日方舟主界面_签到日历',
        keywords: {
            include: ['常规配给', '月签到'],
        },
        action: async function ({capture}) {
            await clickCircleClose(capture);
        }
    },
    {
        describe: '明日方舟主界面_活动公告弹窗',
        keywords: {
            include: ['活动公告', '系统公告'],
        },
        action: async function ({capture}) {
            await clickCircleClose(capture);
        }
    },
    {
        describe: '明日方舟主界面',
        keywords: {
            // 采购中心-- 来购中己  干员寻访--下员寻访  好友--好反 好友--好屁 好友--好龙
            include: ['档案', '采购中心', ['公开招募', '公开募'], '干员寻访', '任务', '基建', '好友'],
            ocrFix: {'来': '采', '下': '干', '己': '心', '反': '友', '屁': '友', '龙': '友'}
        },
        action: async function ({ocrResult}) {
            const whichTask = getOneTaskToRun()
            if (whichTask) {
                // @ts-ignore
                await clickByHrOcrResultAndText(ocrResult, TASK_DICT[whichTask].text);
            }
        }
    },
]
// todo 公开招募高星tag立即招募
/*
* 公招
* 有立即招募，则立即招募。
* 没有立即招募点击开始招募
* 没有高星tag，有立即刷新就刷新，没有就随便点一个tag
* 有高星tag选择高星tag
* 全部为已招募则结束。
* */
const publicRecruit: Router = [
    {
        describe: '公开招募界面_有聘用候选人',
        keywords: {
            include: ['公开招募', '聘用候选人'],
            ocrFix: {'莫': '募'}
        },
        action: async function ({ocrResult}) {
            await clickByHrOcrResultAndText(ocrResult, '聘用候选人');
        }
    },
    {
        describe: '公开招募界面_抽卡拉拉链开包界面',
        keywords: {
            include: ['SKIP'],
        },
        action: async function ({ocrResult}) {
            await clickByHrOcrResultAndText(ocrResult, 'SKIP');
            //  等待人物出现动画结束 日了狗了 要三到四秒才能完全管用 我说怎么老是卡在抽卡结束的人物界面
            await delay(3000)
            // 点击空白处
            await clickCenter()
        }
    },
    {
        describe: '公开招募界面_没有可以聘用的候选人',
        keywords: {
            include: ['公开招募', '开始招募干员'],
            exclude: ['聘用候选人'],
            ocrFix: {'莫': '募'}
        },
        action: async function ({ocrResult}) {
            await clickByHrOcrResultAndText(ocrResult, '开始招募干员');
        }
    },
    {
        describe: '公开招募界面_选择tag和时间界面',
        keywords: {
            include: ['招募说明', '招募时限', '招募预算', '职业需求'],
            ocrFix: {
                '千': '干',
                '沮': '狙',
                '莫': '募'
            }
        },
        action: async function ({ocrResult, ocrText}) {
            /**
             * 检查tag是否存在符合的tag，返回存在的第一个
             * @param tagsArr tags数组
             * @returns 存在返回存在的item，否则返回null
             */
            const checkTag = (tagsArr: Tags) => {
                const len = tagsArr.length
                for (let i = 0; i < len; i++) {
                    const tagItem = tagsArr[i];
                    const isMatch = tagItem.tags.every(tag => ocrText.includes(tag))
                    if (isMatch) {
                        return tagItem
                    }
                    if (i === len - 1) {
                        return null
                    }
                }
            }
            /**
             * 点击时间箭头并且确定
             * @returns {Promise<void>}
             */
            const clickTimeAndConfirm = async () => {
                let canGet = null;
                let timeLimit: HrOcrResultItem | null = null;
                let jobRequire: HrOcrResultItem | null = null;
                let budget: HrOcrResultItem | null = null
                ocrResult.forEach(item => {
                    if (item.text === '招募时限') {
                        timeLimit = item
                    }
                    if (item.text === '职业需求') {
                        jobRequire = item
                    }
                    if (item.text === '招募预算') {
                        budget = item
                    }
                })
                /* 时间箭头坐标 */
                const clickTime = async () => {
                    // x坐标 ：招募时限x2+1.5倍的招募时限宽度
                    // @ts-ignore
                    const smallX = timeLimit.x2 + (timeLimit.x2 - timeLimit.x1) * 1.5
                    // y坐标 : (职业需求y1 - 招募时限y2) * 比例 + 招募时限y2
                    // @ts-ignore
                    const smallY = (jobRequire.y1 - timeLimit.y2) * 0.38 + timeLimit.y2
                    // 计算原始坐标并点击
                    console.log(`准备点击时间向下的箭头`)
                    await clickPlus({x: smallX, y: smallY})
                }
                const clickConfirm = async () => {
                    /* 确定✓坐标 */
                    // x 招募预算x1 + 8.5倍的招募预算宽度
                    // @ts-ignore
                    const smallX = budget.x1 + (budget.x2 - budget.x1) * 8.5
                    // y 招募预算的y1
                    // @ts-ignore
                    const smallY = budget.y1
                    // 计算原始坐标并点击
                    console.log(`准备点击确定的箭头`)
                    await clickPlus({x: smallX, y: smallY})
                }
                await clickTime()
                await clickConfirm()
                // 点击确定会有一个渐变动画，如果不延迟，那么截图还是当前这个界面的截图
                await delay(1000)
            }
            // 优先找六星 ，其次找五星，最后找四星
            const tagItem = checkTag(tags6) || checkTag(tags5) || checkTag(tags4)
            // 如果存在
            if (tagItem) {
                console.log('找到了tag啦');
                console.log(`tag为${tagItem.tags.join(',')}`);
                console.log(`可能获得的干员为为${tagItem.operators.join(',')}`);
                for (const tagName of tagItem.tags) {
                    // 选择存在的tag
                    await clickByHrOcrResultAndText(ocrResult, tagName);
                    // 拉时间和确定
                    await clickTimeAndConfirm()
                }
            } else {
                // 如果不存在，能刷新标签就刷新标签
                if (ocrText.includes('点击刷新标签')) {
                    await clickByHrOcrResultAndText(ocrResult, '点击刷新标签');
                } else {
                    // 不能刷新标签，就随便选一个tag得了
                    const len = ocrResult.length
                    for (let i = 0; i < len; i++) {
                        const item = ocrResult[i];
                        if (tag.includes(item.text)) {
                            // 随便选一个tag
                            await clickByHrOcrResultAndText(ocrResult, item.text);
                            // 拉时间和确定
                            await clickTimeAndConfirm()
                            break
                        }
                    }
                }
            }
        }
    },
    {
        describe: '公开招募刷新标签confim对话框',
        keywords: {
            include: ['是否消耗1次联络机会？'],
        },
        action: async function ({capture}) {
            await clickRedConFirm(capture)
        }
    },
    {
        describe: '公开招募没有可以招募的，招募已满',
        keywords: {
            include: ['停止招募', '立即招募'],
            exclude: ['聘用候选人', '开始招募干员'],
        },
        action: async function ({capture}) {
            // 公招流程结束
            gameInfo.isPublicRecruitEnd = true
            // 左上角点击返回
            console.log('点击左上角返回');
            await clickBack()
        }
    },
]

/**
 * @description 在采购中心购买商品弹窗中，点击购买商品按钮
 */
const purchaseBuy = async () => {
    // @ts-ignore 固定坐标比例计算比例计算
    const buyX = 0.72 * deviceInfo.longSide
    // @ts-ignore 固定坐标比例计算
    const buyY = 0.81 * deviceInfo.shortSide
    console.log('准备点击购买按钮');
    await click(buyX, buyY)
    console.log('点击购买按钮成功，坐标为', buyX, buyY);
}
// todo 没有招聘许可的时候买其他打折的物品,没有打折的买不打折的物品
// 采购中心路由
const purchase: Router = [
    {
        describe: '采购中心_可露希尔推荐tab',
        keywords: {
            include: ['可露希尔推荐', '信用交易所'],
            exclude: ['信用获取规则'],
        },
        action: async function ({ocrResult}) {
            await clickByHrOcrResultAndText(ocrResult, '信用交易所');
        }
    },
    {
        describe: '采购中心_信用交易所tab',
        keywords: {
            include: ['信用获取规则'],
            ocrFix: {'千': '干'},
        },
        action: async function ({ocrResult, capture}) {
            const isReceiveBtn = ocrResult.some(item => item.text === '收取信用')
            if (isReceiveBtn) {
                console.log('找到收取信用按钮，点击收取信用');
                await clickByHrOcrResultAndText(ocrResult, '收取信用');
            } else {
                console.log('没找到收取信用，所以准备买东西');
                // 第一行
                const shopMinTopY = 201 / 989 * (deviceInfo.smallHeight as number);
                const shopMaxTopY = 246 / 989 * (deviceInfo.smallHeight as number);
                // 第二行
                const shopMinBottomY = 556 / 989 * (deviceInfo.smallHeight as number);
                const shopMaxBottomY = 600 / 989 * (deviceInfo.smallHeight as number);
                // 所有可以购买的物品
                const greyColor = Color.parse('#313131') // 可以买的物品文字底色
                const goodsList = ocrResult.filter(item => {
                    const isInArea = item.y1 > shopMinTopY && item.y1 < shopMaxTopY || item.y1 > shopMinBottomY && item.y1 < shopMaxBottomY
                    // 坐标为物品名字左上角坐标往左偏移八分之一文字的距离
                    const x = item.x1 - (item.x2 - item.x1) / 8
                    const y = item.y1
                    const isCanBuy = detectsColor(capture, greyColor, x, y)
                    return isInArea && isCanBuy
                })
                // 买招聘许可
                const arr = goodsList.filter(item => {
                    return item.text === '招聘许可'
                })
                if (arr.length > 0) {
                    console.log('有招聘许可,看看有没有打折的');
                    const colors = ['#5d8900', '#76ad00', '#a8f600']
                    // 默认不打折
                    let isHaveDiscount = false
                    for (const item of arr) {
                        // 招牌许可左上角的x坐标减去招牌许可一半字的宽度
                        const x = item.x1 - (item.x2 - item.x1) / 2
                        // 招牌许可右下角的y坐标加上招牌许可的高度
                        const y = item.y2 + (item.y2 - item.y1)
                        // 看看有没有打折的绿色
                        isHaveDiscount = colors.some(item => {
                            const color = Color.parse(item)
                            return detectsColor(capture, color, x, y, {threshold: 50})
                        })
                        // 有打折
                        if (isHaveDiscount) {
                            console.log('有打折的招聘许可，买买买');
                            // 购买
                            console.log('准备点击商品');
                            await clickPlus({x, y})
                            await delay(2000)
                            await purchaseBuy()
                            break
                        }
                    }
                    // 没有打折的招聘许可
                    if (!isHaveDiscount) {
                        console.log('没有打折的招聘许可,那就随便买一个');
                        // 购买
                        await clickPlus({x: arr[0].x, y: arr[0].y})
                        await delay(2000)
                        await purchaseBuy()
                    }
                }
            }
        }
    },
    {
        describe: '采购中心_信用交易所,信用不足，无法购买',
        keywords: {
            include: ['信用不足，无法购买'],
        },
        action: async function () {
            gameInfo.isPurchaseEnd = true
            // 左上角点击返回
            console.log('点击左上角返回');
            await clickBack()
        }
    },
    {
        describe: '采购中心_信用交易所,购买物品弹框',
        keywords: {
            include: [['急购买物品', '购买物品'], '售价', '商品内容'],
            exclude: ['信用不足，无法购买'],
        },
        action: async function () {
            await purchaseBuy()
        }
    },
    {
        describe: '获得物资的modal反馈框',
        keywords: {
            include: ['获得物资'],
        },
        action: async function ({ocrResult}) {
            await clickCenterBottom()
        }
    },
]


// 好友列表，访问基建
const friendHome: Router = [
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
        action: async function ({capture}) {
            // 访问下位按钮坐标x
            const nextBtnX = 0.977 * (deviceInfo.smallWidth as number)
            // 访问下位按钮坐标y
            const nextBtnY = 0.917 * (deviceInfo.smallHeight as number)
            // 访问下位按钮激活状态下的底色
            const enableColor = '#d15806'
            const stillMore = detectsColor(capture, Color.parse(enableColor), nextBtnX, nextBtnY, {threshold: 50})
            // 橘色的访问下位
            if (stillMore) {
                console.log('点击访问下位')
                await clickPlus({x: nextBtnX, y: nextBtnY})
            } else {
                console.log('好友会客室已经全部访问完毕')
                gameInfo.isFriendHomeEnd = true
                await backHomePage()
            }
        }
    },
]

// 基建
const construction: Router = [
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
        action: async function ({ocrResult, capture}) {
            // 如果批量操作没做，就点击小铃铛 走批量流程
            if (!gameInfo.isConstructionBatchEnd) {
                const x = 0.952 * (deviceInfo.longSide as number)
                const y = 0.129 * (deviceInfo.shortSide as number)
                await click(x, y)
            }
            // 否则就点击进驻总览走替换干员流程
            else {
                await clickByHrOcrResultAndText(ocrResult, '进驻总览')
            }
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
        },
        action: async function ({ocrResult, capture}) {
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
            const ocrFilterResult = ocrResult.filter(ocrItem => {
                return buildings.some((building) => {
                    return ocrItem.text.includes(building.name)
                })
            })
            // 一行方框的高度为建筑名称文字的高度的4倍
            const lineHeight = (ocrFilterResult[0].y2 - ocrFilterResult[0].y1) * 4
            let smallPicFeatures = null;
            let smallPic = null;
            // 是否有一个建筑需要换
            let isThereOneBuildingNeedChange = false
            for (const ocrFilterItem of ocrFilterResult) {
                /* 看看这行有没有空着的加号按钮 */
                if (!smallPic) {
                    smallPic = await readImage(`${deviceInfo.pathDir}/img/whitePlus.png`);
                }
                if (!smallPicFeatures) {
                    // @ts-ignore
                    smallPicFeatures = await smallPic.detectAndComputeFeatures();
                }
                const isThereEmptyPlus = await getPointByFeatures(capture, smallPicFeatures, {scale: 0.5})

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
                const locationArr = []
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
                        x: +0.525 * (deviceInfo.longSide as number),
                        y: ocrFilterItem.y2
                    }
                    // 点击第一个干员进入换人界面，
                    console.log(`点击第一个干员坐标`)
                    await clickPlus({x: firstOperatorLocation.x, y: firstOperatorLocation.y})
                    // 延迟一下，等待淡出动画
                    await delay(800)
                }

                const isInThisLine = (ocrItem: HrOcrResultItem) => {
                    // 一行建筑方框底部y最大坐标
                    const lineMaxY = ocrFilterItem.y1 + lineHeight
                    return ocrItem.y1 < lineMaxY && ocrItem.y1 > ocrFilterItem.y1
                }


                // 是宿舍 走宿舍休息流程
                if (ocrFilterItem.text.includes('宿舍')) {
                    console.log(`看看${ocrFilterItem.text}要不要换人休息`)
                    /* 看看这行方框的ocr结果中有没有休息中的*/
                    let stillRest = ocrResult.filter(ocrItem => {
                        return isInThisLine(ocrItem) && ocrItem.text.includes('休息中')
                    })
                    // 休息排序 按照从左到右的顺序
                    if (stillRest.length > 0 && isThereEmptyPlus) {
                        console.log(`${ocrFilterItem.text}有人需要换人休息`)
                        const peopleNum = 5 // 宿舍需要5人， 就不去上面的buildings里面找了
                        const stillRestNum = stillRest.length
                        console.log(`有${stillRestNum}个人正在休息`)
                        if (peopleNum - stillRestNum === 0) {
                            console.log(`宿舍人都在休息，不需要换人`)
                            return
                        } else {
                            console.log(`准备换人休息`)
                            // 计算出休息中的人在进驻概览中的序号  1052/1885 = 0.558   1226/1885 = 0.651    1393/1885 = 0.740 1558/1885 = 0.828
                            const restPeopleIndex = []
                            for (const restItem of stillRest) {
                                if (restItem.x1 < 0.558 * (deviceInfo.longSide as number)) {
                                    restPeopleIndex.push(1)
                                } else if (restItem.x1 < 0.651 * (deviceInfo.longSide as number) && restItem.x1 > 0.558 * (deviceInfo.longSide as number)) {
                                    restPeopleIndex.push(2)
                                } else if (restItem.x1 < 0.740 * (deviceInfo.longSide as number) && restItem.x1 > 0.651 * (deviceInfo.longSide as number)) {
                                    restPeopleIndex.push(3)
                                } else if (restItem.x1 < 0.828 * (deviceInfo.longSide as number) && restItem.x1 > 0.740 * (deviceInfo.longSide as number)) {
                                    restPeopleIndex.push(4)
                                } else if (restItem.x1 > 0.828 * (deviceInfo.longSide as number)) {
                                    restPeopleIndex.push(5)
                                }
                            }
                            // 点击第一个干员进入换人界面，
                            await enterBuilding()


                        }
                    }
                }
                // 不是宿舍，走涣散换班流程
                else {
                    console.log(`看看${ocrFilterItem.text}要不要换班`)

                    /* 看看这行方框的ocr结果中有没有注意力涣散的干员 (注意力澳散 注意力涣散) */
                    const needTurn = ocrResult.filter(ocrItem => {
                        return isInThisLine(ocrItem) && ocrItem.text.includes('注意力')
                    })

                    // 如果需要换班
                    if (needTurn.length > 0 && isThereEmptyPlus) {
                        isThereOneBuildingNeedChange = true
                        console.log(`${ocrFilterItem.text}有人涣散了，要换班`)
                        // @ts-ignore
                        // 这个建筑总共需要几个人
                        const peopleNum = buildings.find(building => {
                            return ocrFilterItem.text.includes(building.name)
                        }).num
                        console.log(`${ocrFilterItem.text}需要${peopleNum}个人`)
                        // 这个建筑有几个人涣散了
                        const peopleNumNeedRest = needTurn.length
                        console.log(`${ocrFilterItem.text}有${peopleNumNeedRest}个人需要涣散了`)
                        // 这个建筑有几个人还在996工作中不需要换掉的
                        const peopleNumStillWork = ocrResult.filter(ocrItem => {
                            return isInThisLine(ocrItem) && ocrItem.text.includes('工作中')
                        }).length
                        // 点击第一个干员进入换人界面，
                        await enterBuilding()
                        // 点击清空按钮
                        await click(clearBtnX, clearBtnY)
                        // 替换干员
                        const start = peopleNumNeedRest
                        const end = peopleNum + peopleNumNeedRest
                        for (let i = start; i <= end; i++) {
                            // 点击干员
                            await click(locationArr[i].x, locationArr[i].y)
                        }

                        // 点击确认按钮
                        await click(confirmBtnX, confirmBtnY)
                        console.log(`${ocrFilterItem.text}换班完毕`)
                        gameInfo.isConstructionEnd = true
                        break
                    }
                    console.log(`${ocrFilterItem.text}不需要换班`)
                }

            }
            // 回收特征图片和对象
            smallPic && smallPic.recycle()
            smallPicFeatures && smallPicFeatures.recycle()

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
                    console.log('滚动条到底了，基建流程结束了')
                    // 基建流程结束
                    gameInfo.isConstructionEnd = true
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
        }
    },
]

const baseRouter = [
    ...main,
]
/**
 * 从没完成的任务里面找一个开始。
 */
const getOneTaskToRun = () => {
    if (!gameInfo.isPublicRecruitEnd) {
        return TASK_DICT.publicRecruit.key
    } else if (!gameInfo.isPurchaseEnd) {
        return TASK_DICT.purchase.key
    } else if (!gameInfo.isFriendHomeEnd) {
        return TASK_DICT.friendHome.key
    } else if (!gameInfo.isConstructionEnd) {
        return TASK_DICT.construction.key
    } else {
        gameInfo.allDown = true
    }
}

/**
 * 获取路由
 */
const getGameRouter = (): Router | void => {
    const whichTask = getOneTaskToRun()
    if (whichTask) {
        const dict = {
            publicRecruit: [...baseRouter, ...publicRecruit],
            purchase: [...baseRouter, ...purchase],
            friendHome: [...baseRouter, ...friendHome],
            construction: [...baseRouter, ...construction]
        }

        // @ts-ignore
        const key = TASK_DICT[whichTask].key
        // @ts-ignore
        const router = dict[key]
        if (router) {
            return router
        } else {
            console.error(`没有找到匹配的任务路由列表[${key}]`)
        }
    }
}

export {
    getGameRouter,
}