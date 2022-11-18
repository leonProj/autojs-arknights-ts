<template>
  <div class="page">
    <div class="content">
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