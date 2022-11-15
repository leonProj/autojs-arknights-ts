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
import {getPointByFeatures, Point} from "@/utils/point";

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

interface DiscountNum {
    index: number // 打折在原来数组中的索引
    discount: number  // 打折多少
}

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

                /**
                 * 购买物品，优先买打折的，没有就不买
                 * 买了返回true，没买返回false
                 */
                const buy = async (goodName: string | string[]): Promise<boolean> => {
                    let thisGoods = []
                    // 获取当前指定名称的产品
                    if (Array.isArray(goodName)) {
                        thisGoods = goodsList.filter(item => {
                            return goodName.some(name => item.text.includes(name))
                        })
                    } else {
                        thisGoods = goodsList.filter(item => {
                            return item.text === goodName
                        })
                    }
                    // 有就买
                    if (thisGoods.length > 0) {
                        console.log(`有${goodName},看看有没有打折的`);
                        const colors = ['#5d8900', '#76ad00', '#a8f600']
                        // 默认不打折
                        const discountGoods: HrOcrResultItem[] = []
                        // 寻找有没有打折的
                        for (const item of thisGoods) {
                            // 商品名字中心x坐标减去四个字的宽度
                            const oneWordWidth = (item.x2 - item.x1) / item.text.length // 一个字的宽度
                            const x = item.x - oneWordWidth * 4  // 打折x坐标
                            //商品名字右下角的y坐标加上商品名字的高度
                            const y = item.y2 + (item.y2 - item.y1)// 打折y坐标
                            // 看看有没有打折的绿色
                            const isHaveDiscount = colors.some(item => {
                                const color = Color.parse(item)
                                return detectsColor(capture, color, x, y, {threshold: 50})
                            })
                            if (isHaveDiscount) {
                                discountGoods.push(item)
                            }
                        }
                        // 有打折
                        if (discountGoods.length !== 0) {
                            console.log(`有打折的${goodName}`);
                            // 只有一个打折
                            if (discountGoods.length === 1) {
                                console.log(`有打折${goodName}只有一个直接买`);
                                console.log(`准备点击打折的${goodName}`);
                                await clickPlus({x: discountGoods[0].x, y: discountGoods[0].y});
                                await delay(2000)
                                await purchaseBuy()
                            }
                            // 有多个打折，比较折扣，买折扣最大的
                            else {
                                console.log(`打折${goodName}有${discountGoods.length}个,比较折扣，买折扣最大的`);
                                // 折扣数组
                                const discountNum: DiscountNum[] = []
                                // 获取折扣
                                discountGoods.forEach((item, index) => {
                                    // 折扣x坐标：商品名字中心x坐标减去六个字的宽度
                                    const oneWordWidth = (item.x2 - item.x1) / item.text.length // 一个字的宽度
                                    const discountMinX = item.x - oneWordWidth * 6  // 折扣x最小坐标
                                    // 折扣y坐标：商品名字右下角的y坐标 加上 （商品名字的高度 * 2）
                                    const discountMaxX = item.x1   // 折扣x最大坐标
                                    const worldHeight = item.y2 - item.y1
                                    const discountMinY = item.y2 // 折扣y最小坐标
                                    const discountMaxY = item.y2 + worldHeight * 2// 折扣y最大坐标
                                    const discount = ocrResult.find(ocrItem => {
                                        return ocrItem.x1 > discountMinX && ocrItem.x1 < discountMaxX && ocrItem.y1 > discountMinY && ocrItem.y1 < discountMaxY
                                    })
                                    if (discount) {
                                        // '-75%', '-50%', '-25%', '0%' '-5Qx',
                                        console.log(`第${index}个折扣是${discount.text}`);
                                        discountNum.push({
                                            index,
                                            discount: Number(discount.text.split('')[1]) // 取出折扣数字
                                        })
                                    }
                                })
                                // 比较折扣
                                const sortDiscountNum = discountNum.sort((a, b) => {
                                    return b.discount - a.discount
                                })
                                // 买折扣最大的
                                console.log(`打折最大的是${sortDiscountNum[0].discount}`);
                                console.log(`准备点击打折最大的${goodName}`);
                                await clickPlus({
                                    x: discountGoods[sortDiscountNum[0].index].x,
                                    y: discountGoods[sortDiscountNum[0].index].y
                                });
                                await delay(2000)
                                await purchaseBuy()
                            }
                        }
                        // 没有打折
                        else {
                            console.log(`没有打折的${goodName},那买一个不打折的`);
                            // 购买
                            await clickPlus({x: thisGoods[0].x, y: thisGoods[0].y})
                            await delay(2000)
                            await purchaseBuy()
                        }
                        return true
                    } else {
                        console.log(`没有${goodName}`);
                        return false
                    }
                }

                for (const item of ['招聘许可', '赤金', ['龙门币', '龙门市'], '家具零件']) {
                    // 买了就跳出循环
                    const isBuy = await buy(item)
                    if (isBuy) {
                        break
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
            await delay(600)
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
            let ocrFilterResult = ocrResult.filter(ocrItem => {
                return buildings.some((building) => {
                    return ocrItem.text.includes(building.name)
                })
            })
            console.log(`一共识别到${ocrFilterResult.length}个建筑`)
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
                    await delay(800)
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
                        // 获取原来休息中中干员的坐标位置
                        const oldRestPeopleLocationArr = []
                        for (const index of stillRestPeopleIndex) {
                            oldRestPeopleLocationArr.push(locationArr[index])
                        }
                        // 点击原来休息中的干员
                        for (const location of oldRestPeopleLocationArr) {
                            await click(location.x, location.y)
                        }
                        // 点击确认按钮
                        await click(confirmBtnX, confirmBtnY)
                        console.log(`${ocrFilterItem.text}换班完毕`)
                        break
                    } else {
                        console.log(`${ocrFilterItem.text}不需要换班`)
                    }
                }
                // 训练室流程
                else if (ocrFilterItem.text.includes('训练室')) {
                    // 注意力涣散的
                    const tiredPeople: HrOcrResult = ocrResult.filter(ocrItem => isInThisLine(ocrItem) && ocrItem.text.includes('注意力'))
                    console.log(`${ocrFilterItem.text}有${tiredPeople.length}个人涣散了`)
                    // 训练位是否有人
                    const isTraining = !emptyIndex.some(eIndex => eIndex === 1)
                    const isStillHelp = emptyIndex.some(eIndex => eIndex === 0)

                    /**
                     * 训练室换人
                     * @param needChange 是否需要换人，false则只是清空
                     */
                    const change = async (needChange: boolean = false) => {
                        isThereOneBuildingNeedChange = true
                        //进入
                        await enterBuilding()
                        // 清空
                        await click(clearBtnX, clearBtnY)
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
                        }else {
                            console.log(`${ocrFilterItem.text}不需要换人`)
                        }
                    }
                }
                // 普通换班流程
                else {
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
                        // 获取原来工作中干员的坐标位置
                        const oldWorkPeopleLocationArr = []
                        for (const index of workingPeopleIndex) {
                            oldWorkPeopleLocationArr.push(locationArr[index])
                        }
                        // 点击原来工作中的干员
                        for (const location of oldWorkPeopleLocationArr) {
                            await click(location.x, location.y)
                        }
                        // 点击确认按钮
                        await click(confirmBtnX, confirmBtnY)
                        console.log(`${ocrFilterItem.text}换班完毕`)
                        break
                    }
                    console.log(`${ocrFilterItem.text}不需要换班`)
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