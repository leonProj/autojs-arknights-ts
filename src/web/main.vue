<template>
  <div>
    <van-button plain type="primary"  @click="showLog" >运行日志</van-button>
    <van-button plain type="primary"  @click="addCount" >addCount</van-button>
    {{str}}
  </div>
</template>
 <script>
export default {
  created() {
    console.log('初始化');
    // 把本地方法挂载到window中
    window.getAndroidValue = this.getAndroidValue
  },
  data() {
    return {
      count: 1,
      str:"aa"
    };
  },
  methods: {
    // 接收Android传过来的值方法
    getAndroidValue(value) {
      this.str = value
    },
    showLog: function () {
      $autojs.invoke("show-log");
    },
    addCount(){
      $autojs.invoke("addCount");
    }
  },
};
</script>