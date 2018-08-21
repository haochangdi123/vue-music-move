<template>
  <div class="slide" ref="slider">
    <div class="slide-group" ref="slideGroup">
      <slot>
      </slot>
    </div>
    <div class="dots">
      <span v-for="(item,index) in dots" :key="index" class="dot-item" :class='{current: cuurentPageIndex == index}'></span>
    </div>
  </div>
</template>

<script>
import BScroll from 'better-scroll';
import {addClass} from './../../common/js/dom';
export default {
  props: {
    loop: { // 轮播
      type: Boolean,
      default: true
    },
    autoplay: { // 是否自动轮播
      type: Boolean,
      default: true
    },
    interval: { // 轮播时间间隔(默认4s)
      type: Number,
      defalut: 4000
    }
  },
  data() {
    return {
      dots: [], // 按钮
      cuurentPageIndex: 0 // 当前是第几页
    };
  },
  methods: {
    // 设置父元素的宽度(子元素数量不同,宽度自然不同)
    _setSlideWith(isResize) {
      this.childrenList = this.$refs.slideGroup.children;
      let width = 0; // 父元素的宽度
      let sliderWidth = this.$refs.slider.clientWidth;// 用户看到的宽度，其实就是每一张图(每一个子元素的宽度)
      for (let i = 0; i < this.childrenList.length; i++) {
        let children = this.childrenList[i];
        addClass(children, 'slider-item'); // 每一个子元素都要加一个类slider-item
        children.style.width = sliderWidth + 'px';
        width += sliderWidth;
      }
      if (this.loop && !isResize) { // 如果是循环的，我们需要在左右各复制一个子元素以供循环,如果是isResize，父盒子不用再添加
        width += 2 * sliderWidth;
      }
      this.$refs.slideGroup.style.width = width + 'px';
    },
    // 初始化slider
    _initSlider() {
      this.slider = new BScroll(this.$refs.slider, {
        scrollX: true,
        scrollY: false,
        momentum: false, // 惯性
        snap: {
          loop: true,
          threshold: 0.3,
          speed: 4000
        }
      });
      // better-scroll自带的有scrollEnd方法(滑动一次自动触发一次)
      this.slider.on('scrollEnd', () => {
        let pageIndex = this.slider.getCurrentPage().pageX;// 当前是第几个子元素
        // if (this.loop) { // 因为循环，所以会在前后各添加一个子元素
        //   pageIndex -= 1;
        // }
        this.cuurentPageIndex = pageIndex;
        if (this.autoplay) {
          clearTimeout(this.timer);
          this._play();
        }
      });
    },
    // 初始化轮播按钮(因为它依赖轮播图的数量，所以我们要将该方法放置在_setSlideWith方法下面)
    _initDots() {
      this.dots = new Array(this.childrenList.length);
    },
    // 自动播放
    _play() {
      let pageIndex = this.cuurentPageIndex + 1;
      this.timer = setTimeout(() => {
        this.slider.goToPage(pageIndex, 0, 4000); // 页面跳到指定位置， x方向，y方向，时间
        // this.currentPageIndex = pageIndex;
      }, this.interval);
    },
    // 判断是否自动播放
    _isplay() {
      if (this.autoplay) {
        this._play();
      }
    }
  },
  mounted() {
    setTimeout(() => {
      this._setSlideWith();
      this._initDots();
      this._initSlider();
      this._isplay();
    }, 20); // 因为浏览器的刷新是20毫秒一次，为了确定DOM的加载完成，我们定位20毫秒后获取dom

    window.addEventListener('resize', () => {
      if (!this.slider) {
        return;
      }
      this._setSlideWith(true);
      this.slider.refresh();
    });
  }
};
</script>

<style lang="scss" scoped>
  .slide {
   position: relative;
   min-width: 1px;
    .slide-group {
      overflow: hidden;
      white-space: nowrap;
      .slider-item {
        float: left;
        overflow: hidden;
        a {
          display: block;
          width: 100%;
          img {
            display: block;
            width: 100%;
          }
        }
      }
    }
    .dots {
      position: absolute;
      left: 0;
      right: 0;
      bottom: 12px;
      font-size: 0;
      text-align: center;
      .dot-item {
        display: inline-block;
        margin: 0 4px;
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: $color-text-l;
        &.current {
          width: 20px;
          border-radius: 50%;
          background: $color-text-ll;
        }
      }
    }
  }
</style>
