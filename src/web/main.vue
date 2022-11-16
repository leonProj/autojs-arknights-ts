<template>
  <div>
    <van-button plain type="primary"  @click="showLog" >运行日志</van-button>
    <van-button plain type="primary"  @click="addCount" >addCount</van-button>
    初始值是:{{count}}
  </div>
</template>
 <script>
export default {
  data() {
    return {
      count: 1,
    };
  },
  methods: {
    showLog: function () {
      $autojs.invoke("show-log");
    },
    addCount(){
      this.count ++
      $autojs.invoke("addCount");
    }

  },
};
</script>