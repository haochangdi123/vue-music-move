<template>
  <div class="loading">
    <div class="lad-img">
      <img src="./loading.gif" alt="" width="24" height="24">
    </div>
    <p class="text">{{message}}</p>
  </div>
</template>

<script>
export default {
  props: {
    message: {
      type: String,
      default: '正在载入...'
    }
  }
};
</script>

<style lang="scss" scoped>
.loading{
  width: 100%;
  text-align: center;
  .text {
    line-height: 20px;
    font-size: $font-size-small;
    color: $color-text-l;
  }
}
</style>
