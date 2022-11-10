/**
 * @file 路由，各个页面的判断以及处理逻辑
 */
import {HrOcrResult, HrOcrResultItem} from "@/utils/ocrUtil";
import {detectsColor, Image} from "image";
import {
    clickBack,
    clickByColor,
    clickByHrOcrResultAndText,
    clickCenter, clickCenterBottom,
    clickCircleClose, clickPlus
} from "@/utils/accessibilityUtil";
import {delay} from "lang";
import {tag, Tags, tags4, tags5, tags6} from "@/constant/tag";
import {deviceInfo, gameInfo} from "@/state";
import {Color} from "color";
import {click} from "accessibility";

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
            // 采购中心-- 来购中己  干员寻访--下员寻访
            include: ['档案', '采购中心', ['公开招募', '公开募'], '干员寻访', '任务', '基建',],
            ocrFix: {'来': '采', '下': '干', '己': '心'}
        },
        action: async function ({ocrResult}) {
            if (!gameInfo.isPublicRecruitEnd)
                await clickByHrOcrResultAndText(ocrResult, ['公开招募', '公开募']);
            else if (!gameInfo.isPurchaseEnd) {
                await clickByHrOcrResultAndText(ocrResult, '采购中心');
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
            console.log('根据颜色点击确定');
            await clickByColor(capture, '#791B1B')
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
        }
    },
    {
        describe: '采购中心_信用交易所,购买物品弹框',
        keywords: {
            include: [['急购买物品', '购买物品'], '售价','商品内容'],
            exclude: ['信用不足，无法购买'],
        },
        action: async function () {
            await purchaseBuy()
        }
    },
]
const other: Router = [
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

const gameRouter = [
    ...main,
    ...publicRecruit,
    ...purchase,
    ...other,
]


export default gameRouter