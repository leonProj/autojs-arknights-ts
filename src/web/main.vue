<template>
  <div class="page">
    <div class="content">
      <h3>收菜</h3>
      <van-notice-bar left-icon="info-o" v-if="!accessibilityEnable">
        无障碍服务未开启
        <template #right-icon>
          <van-button type="primary" size="small" @click="enableAccessibility">去开启</van-button>
        </template>
      </van-notice-bar>
      <van-notice-bar left-icon="info-o" v-if="!overlayEnable">
        悬浮窗权限未开启
        <template #right-icon>
          <van-button type="primary" size="small" @click="enableOverlay">去开启</van-button>
          <van-button type="primary" size="small" @click="checkOverlayEnable">再次检查</van-button>
        </template>
      </van-notice-bar>
      <van-grid clickable :column-num="2" :border="false">
        <van-grid-item>
          <van-button v-if="(!isRun) || (isRun && runningTask !== RUNNING_TASK.main)" :color="mainColor"
                      @click="start(RUNNING_TASK.main)" :disabled="(isRun && runningTask !== RUNNING_TASK.main)">开始运行
          </van-button>
          <van-space v-else>
            <van-button :color="dangerColor" @click="stop" :loading="isStopping && runningTask === RUNNING_TASK.main"
                        loading-text="停止中...">停止运行
            </van-button>
            <van-button v-if="!isStopping && runningTask === RUNNING_TASK.main" loading :color="mainColor"/>
          </van-space>
        </van-grid-item>
        <van-grid-item>
          <van-button :color="normalColor" @click="showLog">查看日志</van-button>
        </van-grid-item>
      </van-grid>
      <van-cell-group>
        <van-cell v-for="(item) in tasks" :title="Array.isArray(item.text) ? item.text[0] : item.text">
          <template #right-icon>
            <van-switch v-model="gameInfo[item.flagKey]" @change="gameInfoSwitchChange($event,item.flagKey)"/>
          </template>
        </van-cell>
      </van-cell-group>
      <h3>刷关</h3>
      <van-grid clickable :column-num="2" :border="false">
        <van-grid-item>
          <van-button v-if="(!isRun )|| (isRun && runningTask !== RUNNING_TASK.mission)" :color="mainColor"
                      @click="start(RUNNING_TASK.mission)" :disabled="(isRun && runningTask !== RUNNING_TASK.mission)">开始刷关卡
          </van-button>
          <van-space v-else>
            <van-button v-if="!isStopping && runningTask === RUNNING_TASK.mission" loading :color="mainColor"/>
            <van-button :color="dangerColor" @click="stop" :loading="isStopping && runningTask === RUNNING_TASK.mission"
                        loading-text="停止中...">停止运行
            </van-button>
          </van-space>
        </van-grid-item>
        <van-grid-item>
          <van-button :color="normalColor" @click="showLog">查看日志</van-button>
        </van-grid-item>
      </van-grid>

      <h3>沙中之火</h3>
      <span>已经摆烂了 {{breathCalFireInTheSandCount}} 次</span>
      <van-field name="stepper" label="最大摆烂次数">
        <template #input>
          <van-stepper v-model="breathCalFireInTheSandMaxCount" :min="1" :disable-input="true"/>
        </template>
      </van-field>
      <van-grid clickable :column-num="2" :border="false">
        <van-grid-item>
          <van-button v-if="(!isRun )|| (isRun && runningTask !== RUNNING_TASK.fireInTheSandEnd)" :color="mainColor"
                      @click="start(RUNNING_TASK.fireInTheSandEnd)" :disabled="(isRun && runningTask !== RUNNING_TASK.fireInTheSandEnd)">开始摆烂
          </van-button>
          <van-space v-else>
            <van-button v-if="!isStopping && runningTask === RUNNING_TASK.fireInTheSandEnd" loading :color="mainColor"/>
            <van-button :color="dangerColor" @click="stop" :loading="isStopping && runningTask === RUNNING_TASK.fireInTheSandEnd"
                        loading-text="停止中...">停止摆烂
            </van-button>
          </van-space>
        </van-grid-item>
        <van-grid-item>
          <van-button :color="normalColor" @click="showLog">查看日志</van-button>
        </van-grid-item>
      </van-grid>
    </div>

  </div>
</template>
<script>
export default {
  created() {
    // 初始化
    $autojs.invoke("created").then((param) => {
      this.tasks = param.tasks;
      this.gameInfo = param.gameInfo;
      this.RUNNING_TASK = param.RUNNING_TASK;
    });
    this.checkAccessibilityEnable()
    this.checkOverlayEnable()
    // 全局挂载,让安卓主动能操作vue内数据
    window.stopRun = () => {
      this.isStopping = false;
      this.isRun = false;
    }
    window.publicRecruitEnd = () => {
      this.gameInfo = {
        ...this.gameInfo,
        isPublicRecruitEnd: true
      }
    }
    window.purchaseEnd = () => {
      this.gameInfo = {
        ...this.gameInfo,
        isPurchaseEnd: true
      }
    }
    window.friendHomeEnd = () => {
      this.gameInfo = {
        ...this.gameInfo,
        isFriendHomeEnd: true
      }
    }
    window.constructionEnd = () => {
      this.gameInfo = {
        ...this.gameInfo,
        isConstructionEnd: true
      }
    }
    window.todoCollectionEnd = () => {
      this.gameInfo = {
        ...this.gameInfo,
        isTodoCollectionEnd: true
      }
    }
    window.chapterMissionEnd = () => {
      this.gameInfo = {
        ...this.gameInfo,
        isChapterMissionEnd: true
      }
    }
    window.breathCalFireInTheSandEnd = () => {
      this.gameInfo = {
        ...this.gameInfo,
        isBreathCalFireInTheSandEnd: true
      }
    }
    window.breathCalFireInTheSandCountAdd = () => {
      this.breathCalFireInTheSandCount++
      if(this.breathCalFireInTheSandCount===this.breathCalFireInTheSandMaxCount){
        this.endBreathCalFireInTheSand()
      }
    }

  },
  data() {
    this.mainColor = '#6662FC'
    this.subColor = '#252D6A'
    this.dangerColor = '#DE2E4F'
    this.normalColor = '#525053'
    return {
      RUNNING_TASK: null,// 当前运行的任务的字典
      runningTask: '',//当前运行的任务
      isRun: false,// 脚本是否正在运行
      isStopping: false,// 脚本是否正在停止
      accessibilityEnable: true,// 无障碍服务是否开启
      overlayEnable: true,// 悬浮窗权限是否开启
      tasks: null,
      gameInfo: null,
      breathCalFireInTheSandCount: 0,// 摆烂次数
      breathCalFireInTheSandMaxCount: 10 // 摆烂最大次数
    };
  },
  methods: {
    // 展示日志界面
    showLog() {
      $autojs.invoke("show-log");
    },
    beforeStart() {
      if (!this.accessibilityEnable) {
        Notify({type: 'danger', message: '请先开启无障碍服务'});
        return false
      }
      if (!this.overlayEnable) {
        Notify({type: 'danger', message: '请先开启悬浮窗权限'});
        return false
      }

      return true
    },
    // 开始运行
    start(runningTask) {
      if (this.beforeStart()) {
        this.runningTask = runningTask
        this.isRun = true;
        $autojs.invoke("start", {runningTask});
      }
    },
    stop() {
      this.isStopping = true;
      $autojs.invoke("stop")
    },
    endBreathCalFireInTheSand(){
      $autojs.invoke("endBreathCalFireInTheSand")
    },
    /**
     * 游戏信息开关改变,通知安卓改变安卓的gameInfo数据
     * @param {boolean} e 开关值
     * @param {string} flagKey gameInfo的key
     */
    gameInfoSwitchChange(e, flagKey) {
      const param = {
        flagKey,
        value: e
      }
      $autojs.invoke("gameInfoSwitchChange", param);
    },
    // 检查无障碍服务是否开启
    checkAccessibilityEnable() {
      $autojs.invoke("checkAccessibilityEnable").then((flag) => {
        this.accessibilityEnable = flag
      });
    },
    // 检查悬浮窗权限是否开启
    checkOverlayEnable() {
      $autojs.invoke("checkOverlayEnable").then((flag) => {
        this.overlayEnable = flag
      });
    },
    // 开启无障碍服务
    enableAccessibility() {
      $autojs.invoke("enableAccessibility").then(() => {
        this.checkAccessibilityEnable()
      });
    },
    // 开启悬浮窗权限
    enableOverlay() {
      $autojs.invoke("enableOverlay").then(() => {
        this.checkOverlayEnable()
      });
    }
  },
};
</script>
<style scoped>
.page {
  width: 100%;
}

.page .content {
  background: white;
  margin: 0 auto;
  padding: 16px;
  max-width: 700px;
  overflow-y: auto;
  overflow-x: hidden;
  border-radius: 5px;
  box-shadow: 0 2px 6px #bcbcbc80;
}
</style>