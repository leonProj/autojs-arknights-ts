/**
 * @file 公开招募路由
 */
// todo 公开招募高星tag立即招募
/*
* 公招
* 有立即招募，则立即招募。
* 没有立即招募点击开始招募
* 没有高星tag，有立即刷新就刷新，没有就随便点一个tag
* 有高星tag选择高星tag
* 全部为已招募则结束。
* */
import {clickBack, clickByHrOcrResultAndText, clickCenter, clickPlus, clickRedConFirm} from "@/utils/accessibilityUtil";
import {delay} from "lang";
import {tag, Tags, tags4, tags5, tags6} from "@/constant/tag";
import {HrOcrResultItem} from "@/utils/ocrUtil";
import {gameInfo} from "@/state";
import {Route} from "@/router/index";

const publicRecruit: Route[] = [
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

export {
    publicRecruit
}