<template>
  <div>
    <van-button plain type="primary" @click="showLog">运行日志</van-button>
    <div v-if="tasks && gameInfo">
      <div v-for="(item) in tasks">
        {{ Array.isArray(item.text) ? item.text[0] : item.text }}
        <van-switch v-model="gameInfo[item.flagKey]" @change="gameInfoSwitchChange($event,item.flagKey)"/>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  created() {
    $autojs.invoke("created").then((param) => {
      this.tasks = param.tasks;
      this.gameInfo = param.gameInfo;
    });
  },
  data() {
    return {
      tasks: null,
      gameInfo: null,
    };
  },
  methods: {
    // 展示日志界面
    showLog: function () {
      $autojs.invoke("show-log");
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