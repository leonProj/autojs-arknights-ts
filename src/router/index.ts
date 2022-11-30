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
import {deviceInfo, GameInfo, gameInfo} from "@/state";
import {Color} from "color";
import {click, swipe} from "accessibility";
import {getPointByFeatures, Point} from "@/utils/point";
import {publicRecruit} from "@/router/publicRecruit";
import {purchase} from "@/router/purchase";
import {friendHome} from "@/router/friendHome";
import {construction} from "@/router/construction";
import {ScreenCapturer} from "media_projection";
import {todoCollection} from "@/router/todoCollection";


export interface Route {
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
     * @description 包含数组中所有的子项目。1 子项为字符串时直接判断。 2 子项为数组时候，数组中有一个字符串符合即可,为了ocr容错
     * @example 1. '首页'  2. ['首页', '手页']
     */
    include: (string | string[])[]
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

interface TASKS {
    /**
     * description 流程的关键key
     */
    key: string
    /**
     * description 流程是否结束判断的key
     */
    flagKey: keyof GameInfo
    /**
     * description 流程中文名称
     */
    text: string | string[],
    /**
     * description 流程排序,数字越小越优先执行
     */
    sort: number
}

const tasks: TASKS[] = [
    {
        key: 'publicRecruit',
        flagKey: "isPublicRecruitEnd",
        text: ['公开招募', '公开募'],
        sort: 1
    },
    {
        key: 'purchase',
        flagKey: "isPurchaseEnd",
        text: '采购中心',
        sort: 4
    },
    {
        key: 'friendHome',
        flagKey: "isFriendHomeEnd",
        text: '好友',
        sort: 2
    },
    {
        key: 'construction',
        flagKey: "isConstructionEnd",
        text: '基建',
        sort: 3
    },
    {
        key: 'todoCollection',
        flagKey: "isTodoCollectionEnd",
        text: '任务',
        sort: 5
    }
]

const main: Route[] = [
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
                await clickByHrOcrResultAndText(ocrResult, whichTask.text);
            }
        }
    },
    {
        describe: '正在提交反馈至神经Loading',
        keywords: {
            include: ['正在提交反馈至神经'],
        },
        action: async function () {
            console.log('正在提交反馈至神经Loading中');
            await delay(500);
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
    // 先排序
    const sortTasks = tasks.sort((a, b) => a.sort - b.sort)
    // 再找没完成的
    return sortTasks.find(item => !gameInfo[item.flagKey])
}

/**
 * 获取路由
 */
const getGameRouter = (): Route[] | void => {
    const whichTask = getOneTaskToRun()
    if (whichTask) {
        const dict = {
            publicRecruit: [...baseRouter, ...publicRecruit],
            purchase: [...baseRouter, ...purchase],
            friendHome: [...baseRouter, ...friendHome],
            construction: [...baseRouter, ...construction],
            todoCollection:[...baseRouter,...todoCollection]
        }
        const key = whichTask.key as keyof typeof dict
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
    tasks,
}