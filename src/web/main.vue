<template>
  <div>
    <van-button plain type="primary" @click="showLog">运行日志</van-button>
<!--    <div v-if="gameInfo">-->
<!--      <div v-for="key in gameInfo">{{gameInfo[key]}}</div>-->
<!--    </div>-->
  </div>
</template>
<script>
export default {
  created() {
    console.log('vue created');
    $autojs.invoke("created");
    // vue方法挂载到全局，使得安卓能通过webview调用
    window.initData = this.initData
  },
  data() {
    return {
      gameInfo: null
    };
  },
  methods: {
    // 展示日志界面
    showLog: function () {
      $autojs.invoke("show-log");
    },
    // 初始化数据
    initData(param) {
      console.log('param222',param)
    },
  },
};
</script>