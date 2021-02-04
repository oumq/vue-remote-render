<!-- 测试组件 -->
<template>
  <div class="my_div">
    <h1 class="my_h1">Hello world</h1>
    <p class="my_p">
      <span class="my_span">{{ msg }}</span>
    </p>
  </div>
</template>

<script>
export default {
  name: 'Test',
  components: {},
  props: {},
  computed: {},
  data() {
    return {
      msg: 'oumq'
    }
  },
  created() {},
  mounted() {},
  methods: {},
}
</script>
<style scoped lang='scss'>
.my_div {
  width: 100vh;
  height: 100vh;
  .my_h1 {
    color: red;
  }
  .my_p {
    padding: 20px 0;
    .my_span {
      font-size: 24px;
    }
  }
}
</style>
