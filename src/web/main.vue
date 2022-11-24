<template>
  <div class="page">
    <div class="content">
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
        </template>
      </van-notice-bar>
      <van-grid clickable :column-num="2" :border="false">
        <van-grid-item>
          <van-button v-if="!isRun" :color="mainColor" @click="start">开始运行</van-button>
          <van-space v-else>
            <van-button :color="dangerColor" @click="stop" :loading="isStopping" loading-text="停止中...">停止运行
            </van-button>
            <van-button v-if="!isStopping" loading :color="mainColor"/>
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

  },
  data() {
    this.mainColor = '#6662FC'
    this.subColor = '#252D6A'
    this.dangerColor = '#DE2E4F'
    this.normalColor = '#525053'
    return {
      isRun: false,// 脚本是否正在运行
      isStopping: false,// 脚本是否正在停止
      accessibilityEnable:true,// 无障碍服务是否开启
      overlayEnable:true,// 悬浮窗权限是否开启
      tasks: null,
      gameInfo: null,
    };
  },
  methods: {
    // 展示日志界面
    showLog() {
      $autojs.invoke("show-log");
    },
    // 开始运行
    start() {
      if(!this.accessibilityEnable ){
        Notify({ type: 'danger', message: '请先开启无障碍服务' });
        return
      }
      if(!this.overlayEnable ){
        Notify({ type: 'danger', message: '请先开启悬浮窗权限' });
        return
      }
      this.isRun = true;
      $autojs.invoke("start");
    },
    stop() {
      this.isStopping = true;
      $autojs.invoke("stop");
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