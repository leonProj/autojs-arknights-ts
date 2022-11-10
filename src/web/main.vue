<template>
  <div>
    <van-button plain type="primary"  @click="showLog" >运行日志</van-button>
    <van-button plain type="primary"  @click="start" >运行</van-button>
    <van-button plain type="primary"  @click="getS" >当前运行脚本id</van-button>
    <van-button plain type="primary"  @click="stopAll" >停止运行</van-button>
  </div>
</template>
 <script>
export default {
  data() {
    return {
      foregroundServiceEnabled: false,
      activeTab: 0,
      a_switch: true,
      count: 1,
    };
  },
  methods: {
    onForegroundServiceCheckChanged: function (checked) {
      $autojs.invoke("set-foreground", checked);
    },
    showLog: function () {
      $autojs.invoke("show-log");
    },
    openVantWebsite: function () {
      $autojs.send("open-url", "https://vant-contrib.gitee.io/vant/#/zh-CN/");
    },
    openVueWebsite: function () {
      $autojs.send("open-url", "https://cn.vuejs.org/");
    },
    run: function () {
      console.log("count =", this.count);
    },
    stopAll(){
      $autojs.invoke("stopAll");
    },
    start(){
      $autojs.invoke("start");
    },
    getS(){
      $autojs.invoke("getS");
    }
  },
  created: function () {
    $autojs.invoke("get-foreground").then((value) => {
      this.foregroundServiceEnabled = value;
    });
  },
};
</script>