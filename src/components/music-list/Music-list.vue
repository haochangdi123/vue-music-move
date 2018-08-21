<template>
  <div class="music-list">
    <div class="back" @click="back">
      <i class="icon-back"></i>
    </div>
    <h2 class="title">{{title}}</h2>
    <div class="bg-image" :style="bgStyle" ref="bgImage">
      <div class="play-warpper" v-show='songs.length>0' ref="playWarpper">
        <div class="play" @click="random">
          <i class="icon-play"></i>
          <span class="text">随机播放全部</span>
        </div>
      </div>
      <div class="filter" ref="filter"></div>
    </div>
    <div class="bg-layer" ref="layer"></div>
    <scroll :data="songs" class="list"  ref="list" :probe-type="probeType" :listen-scroll="listenScroll" @scrollfn="scrollfn">
      <div class="song-list-wrapper">
        <song-list :songs="songs" @select="select"></song-list>
      </div>
      <div class="load" v-if="!songs.length">
        <loading></loading>
      </div>
    </scroll>
  </div>
</template>

<script>
import songList from './../../base/song-list/song-list';
import scroll from '../../base/scroll/scroll';
import loading from './../../base/loading/loading';
import {profixStyle} from '../../common/js/dom';
import {mapActions} from 'vuex'; // 获取actions的方法
const transform = profixStyle('transform');
const backdrop = profixStyle('backdrop-filter');

const RES_HEIGHT = 40; // 标题的高度
export default {
  props: {
    bgImg: { // 背景
      type: String,
      default: ''
    },
    songs: { // 歌曲列表
      type: Array,
      default() {
        return [];
      }
    },
    title: { // 音乐的title(音乐人的名字)
      type: String,
      default: ''
    }
  },
  data() {
    return {
      scrollY: 0 // 滚动的y
    };
  },
  computed: {
    // 背景图片
    bgStyle() {
      return `background-image:url(${this.bgImg})`;
    }
  },
  watch: {
    scrollY(newy) {
      let allowY = -this.bgImageHeight + RES_HEIGHT; // 允许向上滑动的最大高度
      let translateY = Math.max(allowY, newy); // 计算向上滑动的高度，去滑动的最小值
      // this.$refs.layer.style['transform'] = `translate3d(0, ${translateY}px, 0)`;
      // this.$refs.layer.style['-webkit-transform'] = `translate3d(0, ${translateY}px, 0)`;
      this.$refs.layer.style[transform] = `translate3d(0, ${translateY}px, 0)`;

      // 为了将滑动到标题部分的歌曲隐藏，我们做一下操作
      let bgIndex = 0;
      if (newy < allowY) { // 表示的滚动的距离已经超过了title
        bgIndex = 10;
        this.$refs.bgImage.style.paddingTop = 0;
        this.$refs.bgImage.style.height = `${RES_HEIGHT}px`;
        this.$refs.playWarpper.style.display = 'none'; // 将播放按钮隐藏
      } else {
        // 回复原来的样式
        this.$refs.bgImage.style.paddingTop = '70%';
        this.$refs.bgImage.style.height = 0;
        this.$refs.playWarpper.style.display = '';
      }
      this.$refs.bgImage.style.zIndex = bgIndex;

      // 歌曲列表向下滑动,图片变大
      let scale = 1;
      const percent = Math.abs(newy / this.bgImageHeight); // Math.abs 表示绝对值
      if (newy > 0) { // 如果是向下滑动
        scale = 1 + percent; // 表示图片缩放的比例
        bgIndex = 10;
      } else {
        var blur = Math.min(20 * percent, 20); // 最大的模糊度为20
      }
      // this.$refs.bgImage.style['transform'] = `scale(${scale})`;
      // this.$refs.bgImage.style['-webkit-transform'] = `scale(${scale})`;
      this.$refs.bgImage.style[transform] = `scale(${scale})`;
      this.$refs.bgImage.style.zIndex = bgIndex;

      // 设置模糊度，随着滚动的不同，图片的模糊度不同(ios才能识别)
      // this.$refs.filter.style['backdrop-filter'] = `blur(${blur}px)`;
      // this.$refs.filter.style['wbekitBackdrop-filter'] = `blur(${blur}px)`;
      this.$refs.filter.style[backdrop] = `blur(${blur}px)`;
    }
  },
  components: {
    scroll,
    songList,
    loading
  },
  methods: {
    // 返回上一页
    back() {
      this.$router.back();
    },
    // 获取当前的实时y
    scrollfn(pro) {
      this.scrollY = pro.y;
    },
    // 选择歌曲播放
    select(song, index) {
      // 调用actions的方法
      this.selectPlay({
        list: this.songs,
        index
      });
    },
    ...mapActions([
      'selectPlay',
      'randomPlay'
    ]),
    // 随机播放歌曲
    random() {
      this.randomPlay({
        list: this.songs
      });
    }
  },
  created() {
    // 为了实现歌曲列表上移，图片上移，我们要实时获取高度，这是需要向scroll传递参数
    this.probeType = 3;
    this.listenScroll = true;
  },
  mounted() {
    // 歌曲列表的top有上面图面的高度决定
    this.$refs.list.$el.style.top = `${this.$refs.bgImage.clientHeight}px`;
    // 将这个高度记录一下，在后面使用layer向上滚动的时候会用到
    this.bgImageHeight = this.$refs.bgImage.clientHeight;
  }
};
</script>

<style lang="scss" scoped>
.music-list {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background: $color-background;
  .back {
    position: absolute;
    top: 0;
    left: 6px;
    z-index: 50;
    .icon-back {
      display: block;
      padding: 10px;
      font-size: $font-size-large-x;
      color: $color-theme;
    }
  }
  .title {
    position: absolute;
    top: 0;
    left: 15%;
    width: 70%;
    text-align: center;
    line-height: 40px;
    font-size: $font-size-large;
    color: $color-text;
    @include no-wrap();
    z-index: 40;
  }
  .bg-image {
    position: relative;
    width: 100%;
    height: 0;
    padding-top: 70%;
    transform-origin: top;
    background-size: cover;
    .play-warpper {
      position: absolute;
      bottom: 20px;
      z-index: 50;
      width: 100%;
        .play {
          box-sizing: border-box;
          width: 135px;
          padding: 7px 0;
          margin: 0 auto;
          text-align: center;
          border: 1px solid $color-theme;
          color: $color-theme;
          border-radius: 100px;
          font-size: 0;
          .icon-play {
            display: inline-block;
            vertical-align: middle;
            margin-right: 6px;
            font-size: $font-size-medium-x;
          }
          .text {
            display: inline-block;
            vertical-align: middle;
            font-size: $font-size-small;
          }
        }
    }
    .filter {
      position: absolute;
      top: 0;
      bottom: 0;
      left: 0;
      right: 0;
      background: rgba(7, 17, 27, 0.4);
    }
  }
  .bg-layer {
    position: relative;
    height: 100%;
    background: $color-background;
  }
  .list {
    position: fixed;
    top: 0;
    bottom: 0;
    width: 100%;
    background: $color-background;
  }
}
</style>
