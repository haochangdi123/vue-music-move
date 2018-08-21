<template>
  <div class="tab">
    <router-link to="/recommend" class="tab-item">
    <span  class="text">推荐</span>
    </router-link>
    <router-link to="/singer" class="tab-item">
    <span  class="text">歌手</span>
    </router-link>
    <router-link to="/rank" class="tab-item">
    <span class="text">排行榜</span>
    </router-link>
    <router-link to="/search" class="tab-item">
    <span  class="text">搜索</span>
    </router-link>
  </div>
</template>

<script>
export default {
  data() {
    return {
    };
  },
  methods: {},
  created() {}
};
</script>

<style lang="scss" scoped>
  .tab {
    display: flex;
    .tab-item {
      flex: 1;
      line-height: 33px;
      text-align: center;
      font-size: $font-size-small;
      &.router-link-active {
        .text {
           color: $color-theme;
           padding-bottom: 3px;
           border-bottom: 2px solid $color-theme;
        }
      }
    }
  }
</style>
