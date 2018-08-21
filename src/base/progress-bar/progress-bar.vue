<template>
  <div class="progress-bar" ref="progressBar" @click="progressClick">
    <div class="bar-inner">
      <div class="progress" ref="progress"></div>
      <div class="progress-btn-wrapper"
           ref="progressBtn"
           @touchstart.prevent="progressTouchStart"
           @touchmove.prevent="progressTouchMove"
           @touchend="progressTouchEnd"
           >
        <div class="btn-wrapper"></div>
      </div>
    </div>
  </div>
</template>

<script>
import {profixStyle} from '../../common/js/dom';
const transform = profixStyle('transform');
const BTN_WIDTH = 16; // 滚动条上按钮的width
export default {
  // 进度条的百分比(歌曲已经播放的比例)
  props: {
    percent: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
    };
  },
  watch: {
    // 随着音乐播放，比例变化，进度条和按钮变化
    percent(newV) {
      // 拖动的时候进度条不会自动变化
      if (newV >= 0 && !this.touch.initiated) {
        const barWith = this.$refs.progressBar.clientWidth - BTN_WIDTH;
        const offsetWidth = newV * barWith;
        this._offset(offsetWidth);
      }
    }
  },
  methods: {
    // 记录滑动开始手指位置
    progressTouchStart(e) {
      this.touch.initiated = true; // 表示touch开始
      this.touch.startX = e.touches[0].pageX; // 第一个手指的横向坐标
      this.touch.left = this.$refs.progress.clientWidth; // 当前滚动条按钮的位置(x轴偏移量)
    },
    // 滑动手指改变滚动条和按钮位置
    progressTouchMove(e) {
      if (!this.touch.initiated) {
        return;
      }
      const width = e.touches[0].pageX - this.touch.startX; // 手指移动的距离
      // 滚动条上按钮的位置 不能超出滚动条的左边和右边,因此不能小于0，也不能大于滚动条的宽度
      const offsetWidth = Math.min(Math.max(0, width + this.touch.left), this.$refs.progressBar.clientWidth - BTN_WIDTH);
      this._offset(offsetWidth);
    },
    // 滑动结束
    progressTouchEnd() {
      this.touch.initiated = false;
      this._triggerPercent(); // 改变音乐的实际进度
    },
    // 滚动条移动和按钮移动
    _offset(offsetWidth) {
      this.$refs.progress.style.width = `${offsetWidth}px`;
      this.$refs.progressBtn.style[transform] = `translate3d(${offsetWidth}px,0,0)`;
    },
    _triggerPercent() {
      const barWith = this.$refs.progressBar.clientWidth - BTN_WIDTH; // 整个滚动条的长度
      const percent = this.$refs.progress.clientWidth / barWith; // 手指滑动后，按钮的位置/滚动条的长度，算出音乐应该播放的比例
      this.$emit('percentChange', percent); // 调用父组件当前的比例
    },
    // 点击滚动条，改变播放位置
    progressClick(event) {
      // 用于获得页面中某个元素的左，上，右和下分别相对浏览器视窗的位置。
      const rect = this.$refs.progressBar.getBoundingClientRect();
      const offsetWidth = event.pageX - rect.left;
      this._offset(offsetWidth);
      // 这里当我们点击 progressBtn 的时候，e.offsetX 获取不对
      // this._offset(e.offsetX)
      this._triggerPercent();
    }
  },
  created() {
    this.touch = {}; // 为了不同的函数共享数据，不需要监听
  }
};
</script>

<style lang="scss" scoped>
  .progress-bar {
    height: 30px;
    .bar-inner {
      position: relative;
      top: 13px;
      height: 4px;
      background: rgba(0, 0, 0, 0.3);
      .progress {
        position: absolute;
        height: 100%;
        background: $color-theme;
      }
      .progress-btn-wrapper {
        position: absolute;
        left: -8px;
        top: -13px;
        width: 30px;
        height: 30px;
        .btn-wrapper {
          position: relative;
          top: 7px;
          left: 7px;
          box-sizing: border-box;
          width: 16px;
          height: 16px;
          border: 3px solid $color-text;
          border-radius: 50%;
          background: $color-theme;
        }
      }
    }
  }
</style>
