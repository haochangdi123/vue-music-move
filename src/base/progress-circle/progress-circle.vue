<template>
  <div class="progress-circle">
    <svg :width="radius" :height="radius" viewBox="0 0 100 100" version="1.1" xmlns="http://www.w3.org/2000/svg">
      <circle class="progress-background" r="50" cx="50" cy="50" fill="transparent"/>
      <circle class="progress-bar" r="50" cx="50" cy="50" fill="transparent" :stroke-dasharray="dasharray"
              :stroke-dashoffset="dashoffset"/>
    </svg>
    <slot></slot>
  </div>
</template>

<script type="text/ecmascript-6">
export default {
  props: {
    radius: { // svg的宽高
      type: Number,
      default: 100
    },
    percent: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      dasharray: Math.PI * 100 // 圆的周长  半径为50
    };
  },
  computed: {
    // 圆走过的长度  也就是未播放音乐占总共的比例
    dashoffset() {
      return this.dasharray * (1 - this.percent);
    }
  }
};
</script>

<style scoped lang="scss">
.progress-circle {
  position: relative;
  circle {
    stroke-width: 8px;
    transform-origin: center;
    &.progress-background {
      transform: scale(0.9);
      stroke: $color-theme-d;
    }
    &.progress-bar {
      transform: scale(0.9) rotate(-90deg);
      stroke: $color-theme;
    }
  }
}
</style>
