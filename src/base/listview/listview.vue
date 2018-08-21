<template>
    <scroll class="listview"
            :data="singerData"
            :listenScroll="listenScroll"
            @scrollfn="scrollfn"
            v-if="singerData"
            :probeType="3"
            ref="listview">
      <div>
        <ul>
          <li v-for="(grop,index) in singerData" :key="index" class="list-grop" ref="listgrop">
            <h2 class="list-grop-title">{{grop.title}}</h2>
            <ul>
              <li v-for="(item,index) in grop.items" :key="index" class="list-grop-item" @click="selectItem(item)">
                <img v-lazy="item.avatar" class="avatar">
                <span class="name">{{item.name}}</span>
              </li>
            </ul>
          </li>
        </ul>
      </div>
      <div class="list-shortList" @touchstart="onShortcutStart" @touchmove.stop.prevent="onShortcutMove" @touchend.stop>
        <ul>
          <li v-for="(item,index) in shortList" :key="index" class="shortList-item" :data-index="index" :class="{current:index===currentIndex}">{{item}}</li>
        </ul>
      </div>
      <div class="list-fixed" v-show="fixedTitle" ref="fixed">
        <h2 class="fixed-title">{{fixedTitle}}</h2>
      </div>
      <div class="load" v-if="!singerData.length">
        <loading></loading>
      </div>
    </scroll>
</template>

<script>
import scroll from '../scroll/scroll';
import {getData} from '../../common/js/dom';
import loading from './../loading/loading';
const ANCHOR_HEIGHT = 18; // 每一个字母的高度
const TITLE_HEIGHT = 20; // 每一个title的高度
export default {
  props: {
    singerData: {
      type: Array,
      default() {
        return [];
      }
    }
  },
  data() {
    return {
      scrollY: 0, // 当前位置的y坐标
      currentIndex: 0, // 当前a-z表的所在index(高亮)
      listHeight: [], // 每一个歌手姓氏区间的高度
      diff: 0 // 表示下一个title到顶部的距离
    };
  },
  components: {
    scroll,
    loading
  },
  computed: {
    // 对传入的title进行整理，变为a-z
    shortList() {
      return this.singerData.map((item) => {
        return item.title.substring(0, 1);
      });
    },
    // 滑动到固定每一个title
    fixedTitle() {
      // 如果向下滑动，如果到顶部了，就将我们添加的title去掉;最上面的位置scrollY=0;下面的位置都是<0的，在往上就是大于0了
      if (this.scrollY > 0) {
        return '';
      }
      return this.singerData[this.currentIndex].title ? this.singerData[this.currentIndex].title : '';
    }
  },
  watch: {
    // 监听传入的数据，如果数据变化，就要调整各个区间的高度
    singerData() {
      setTimeout(() => {
        this._calculateHeight();
      }, 20);
    },
    scrollY(newY) {
      const listHeight = this.listHeight;
      // 当滚动到最顶部，newY>0
      if (newY > 0) {
        this.currentIndex = 0;
        return;
      }
      // 在中间滚动（先不去管最后一个元素）
      for (let i = 0; i < listHeight.length - 1; i++) {
        let h1 = listHeight[i];
        let h2 = listHeight[i + 1];
        if (((-newY) < h2 && (-newY) >= h1)) {
          this.currentIndex = i;
          this.diff = h2 + newY; // 表示下一个title到顶部的距离
          return;
        };
      };

      // 当滚动到底部，且-newY大于最后一个元素的上限,因为左边的高度是(假设左边有两个区级，就数组就有3个高度，右边区间是2，index又是从0开始的，所以要－2)
      this.currentIndex = listHeight.length - 2;
    },
    diff(newVal) {
      // 如果下一个title已经来到了上一个title的范围内，那么动画就要上升他们的差值
      let fiexdTop = (newVal > 0 && newVal < TITLE_HEIGHT) ? newVal - TITLE_HEIGHT : 0;
      // 因为diff是实时变化的，但是如果我们的fiexdTop没有变化，也就是下一个title没有来到了上一个title的范围内，他就一直是0，我们DOM就不用变化
      if (this.fiexdTop === fiexdTop) {
        return;
      }
      this.fiexdTop = fiexdTop;
      // 上一个title会有一个向上移动的距离，像是这个title把他给顶上去的
      this.$refs.fixed.style.transform = `translate3d(0, ${fiexdTop}px, 0)`;
    }
  },
  methods: {
    // 点击歌手，跳到详情
    selectItem(singer) {
      this.$emit('select', singer);
    },
    // 使用事件委托，而不是每一个li都添加事件
    // 滑动a-z使得歌手滑动到响应的位置
    onShortcutStart(event) {
      let anchorIndex = getData(event.target, 'index');
      this._scrollTo(anchorIndex);

      // 获取初始点击的位置
      let firstTouch = event.touches[0]; // touches表示触发touch的手指，【0】表示第一个触发的手指
      this.touch.p1 = firstTouch.pageY; // 第一个手指的纵向位置
      this.touch.anchorIndex = anchorIndex;
    },
    // 滑动a-z使得歌手滑动到响应的位置
    onShortcutMove(event) {
      // 获取初始move的位置
      let firstTouch = event.touches[0]; // touches表示触发touch的手指，【0】表示第一个触发的手指
      this.touch.p2 = firstTouch.pageY; // 第一个手指的纵向位置
      let h = parseInt((this.touch.p2 - this.touch.p1) / ANCHOR_HEIGHT || 0); // 滑动的高度(要确保是整数)
      let anchorIndex = parseInt(this.touch.anchorIndex) + h; // 滑动到的index(要确保是整数)
      this._scrollTo(anchorIndex);
    },
    // 滚动触发的事件
    scrollfn(pos) {
      this.scrollY = pos.y;
    },
    _scrollTo(index) {
      console.log(this.listHeight.length);
      // 当点击热上面或者最后一个字母下面的时候，index为null，直接返回，啥也不做
      if (!index && index !== 0) {
        return;
      }
      // 当滑动的时候，如果一直向上滑，那就保持在a-z的第一个，如果一直向下滑就一直保证在最后一个
      if (index < 0) {
        index = 0;
      } else if (index > this.listHeight.length - 2) {
        index = this.listHeight.length - 2;
      }
      // 起到滑动a-z也会触发高亮
      this.scrollY = -this.listHeight[index];
      // 调用scroll组件的scrollToElement事件，可以使得点击a-z使得歌手滑动到响应的位置，参数2表示滚动的时间
      this.$refs.listview.scrollToElement(this.$refs.listgrop[index], 0);
    },
    // 每一个字母开头的歌手所在的区间位置
    _calculateHeight() {
      this.listHeight = [];
      const list = this.$refs.listgrop;
      let height = 0;
      this.listHeight.push(height);
      for (let i = 0; i < list.length; i++) {
        let item = list[i];
        height += item.clientHeight;
        this.listHeight.push(height);
      }
    }
  },
  created() {
    this.touch = {}; // 关于touch相关的信息，不放在data是因为不需要被监测，我们只是想在全局用而已
    this.listenScroll = true; // 告诉scroll组件监听事件滚动
    setTimeout(() => {
      this._calculateHeight();
    }, 20);
  }
};
</script>

<style lang="scss" scoped>
  .listview {
    position: relative;
    height: 100%;
    width: 100%;
    overflow: hidden;
    background: $color-background;
    .list-grop {
      padding-bottom: 30px;
      .list-grop-title {
        height: 30px;
        line-height: 30px;
        padding-left: 20px;
        font-size: $font-size-small;
        color: $color-text-l;
        background: $color-highlight-background;
      }
      .list-grop-item {
        display: flex;
        align-items: center;
        padding: 20px 0 0 30px;
      }
      .avatar {
        width: 50px;
        height: 50px;
        border-radius: 50%;
      }
      .name {
        margin-left: 20px;
        color: $color-text-l;
        font-size: $font-size-medium;
      }
    }
    .list-shortList {
      position: absolute;
      z-index: 30;
      right: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 20px;
      padding: 20px 0;
      border-radius: 10px;
      text-align: center;
      background: $color-background-d;
      font-family: Helvetica;
      .shortList-item{
        padding: 3px;
        line-height: 1;
        color: $color-text-l;
        font-size: $font-size-small;
        &.current {
          color: $color-theme;
        }
      }
    }
    .list-fixed {
      position: absolute;
      top: 0;
      width: 100%;
      .fixed-title {
        height: 30px;
        line-height: 30px;
        padding-left: 20px;
        font-size: $font-size-small;
        color: $color-text-l;
        background: $color-highlight-background;
      }
    }
    .load {
      position: absolute;
      width: 100%;
      top: 50%;
      transform: translateY(-50%);
    }
  }
</style>
