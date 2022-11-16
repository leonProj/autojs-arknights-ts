/**
 * @file 采购中心路由
 */
import {deviceInfo, gameInfo} from "@/state";
import {click} from "accessibility";
import {clickBack, clickByHrOcrResultAndText, clickCenterBottom, clickPlus} from "@/utils/accessibilityUtil";
import {Color} from "color";
import {detectsColor} from "image";
import {HrOcrResultItem} from "@/utils/ocrUtil";
import {delay} from "lang";
import {Route} from "@/router/index";

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
const purchase: Route[] = [
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
                                        // '-75%', '-50%', '-25%', '0%' '-5Qx','50%',
                                        console.log(`第${index}个折扣是${discount.text}`);
                                        discountNum.push({
                                            index,
                                            discount: Number(discount.text.split('')[0]) || Number(discount.text.split('')[1]) // 取出折扣数字
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

                for (const item of ['招聘许可', '赤金', '技巧概要卷3', '技巧概要卷2', '技巧概要卷1', ['龙门币', '龙门市'], '家具零件']) {
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

export {
    purchase
}
