<template>
  <div class="header">
    <div class="icon"></div>
    <div class="center">
      {{msg}}
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      msg: 'hcd Musice'
    };
  },
  methods: {},
  created() {}
};
</script>

<style lang="scss" scoped>
  .header {
    height: 40px;
    text-align: center;
    font-size: 0;
    .icon {
      display: inline-block;
      margin-top: 4px;
      margin-right: 9px;
      width: 30px;
      height: 30px;
      vertical-align: top;
      @include bg-image('./../../common/image/header/logo');
      background-size: 30px 30px;
      background-repeat: no-repeat;
    }
    .center {
      display: inline-block;
      vertical-align: top;
      line-height: 40px;
      color: $color-theme;
      font-size: $font-size-medium-x;
    }
  }
</style>
