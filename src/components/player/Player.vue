<template>
  <div class="player" v-show="playList.length>0">
    <transition name="normal"
                @enter="enter"
                @after-enter="afterEnter"
                @leave="leave"
                @after-leave="afterLeave"
    >
      <div class="normal-player" v-show="fullScreen">
        <div class="background">
          <img width="100%" height="100%" :src="currentSong.image">
        </div>
        <div class="top">
          <div class="back">
            <i class="icon-back" @click="back"></i>
          </div>
          <h1 class="title">{{currentSong.name}}</h1>
          <h2 class="subtitle">{{currentSong.singer}}</h2>
        </div>
        <div class="middle" @touchstart.prevent="middleTouchStart"
                            @touchmove.prevent="middleTouchMove"
                            @touchend="middleTouchEnd">
          <div class="middle-l" ref="middleL">
            <div class="cd-wrapper" ref="cdWrapper">
              <div class="cd" :class="cdCls">
                <img class="image" :src="currentSong.image">
              </div>
            </div>
            <div class="playing-lyric-wrapper">
              <div class="playing-lyric">{{playingLyric}}</div>
            </div>
          </div>
          <scroll class="middle-r" ref="lyricList" :data="currentLyric && currentLyric.lines">
              <div class="lyric-wrapper">
                <div v-if="currentLyric">
                  <p ref="lyricLine"
                    class="text"
                    :class="{'current': currentLineNum ===index}"
                    v-for="(line,index) in currentLyric.lines" :key="index">{{line.txt}}</p>
                </div>
              </div>
            </scroll>
        </div>
        <div class="bottom">
          <div class="dot-wrapper">
            <span class="dot" :class="{'active':currentShow==='cd'}"></span>
            <span class="dot" :class="{'active':currentShow==='lyric'}"></span>
          </div>
          <div class="progress-wrapper">
            <span class="time time-l">{{formate(currentTime)}}</span>
            <div class="progress-bar-wrapper">
              <progress-bar :percent="percent" @percentChange="percentChange"></progress-bar>
            </div>
            <span class="time time-r">{{formate(currentSong.duration)}}</span>
          </div>
          <div class="operators">
            <div class="icon i-left">
              <i :class="iconMode" @click="changeMode"></i>
            </div>
            <div class="icon i-left" :class="disableCls">
              <i class="icon-prev" @click="prev"></i>
            </div>
            <div class="icon i-center" :class="disableCls">
              <i @click="togglePlaying" :class="playIcon"></i>
            </div>
            <div class="icon i-right" :class="disableCls">
              <i @click="next" class="icon-next"></i>
            </div>
            <div class="icon i-right">
              <i class="icon"></i>
            </div>
          </div>
        </div>
      </div>
    </transition>
    <transition name="mini">
      <div class="mini-player" v-show="!fullScreen" @click="open">
        <div class="icon">
          <img  width="40" height="40" :src="currentSong.image" :class="cdCls">
        </div>
        <div class="text">
          <h2 class="name">{{currentSong.name}}</h2>
          <p class="desc"></p>
        </div>
        <div class="control">
          <progress-circle :radius="32" :percent="percent">
            <i :class="miniIcon" @click.stop="togglePlaying" class="icon-mini"></i>
          </progress-circle>
        </div>
        <div class="control">
          <i class="icon-playlist"></i>
        </div>
      </div>
    </transition>
    <audio ref="audio" :src="currentSong.url"  @canplay="ready" @error="error" @timeupdate="updateTime"
           @ended="end"></audio>
  </div>
</template>

<script>
import {mapGetters, mapMutations} from 'vuex'; // 获取vuex的getter方法和Mutations方法
import animations from 'create-keyframe-animation';
import {profixStyle} from './../../common/js/dom';
import progressBar from '../../base/progress-bar/progress-bar';
import progressCircle from '../../base/progress-circle/progress-circle';
import {playModel} from '../../common/js/config';
import {shuffle} from '../../common/js/utils';
import LyricParser from 'lyric-parser'; // 通过该对象将歌唱整理
import scroll from './../../base/scroll/scroll';
const transform = profixStyle('transform');
const transitionDuration = profixStyle('transitionDuration'); // 动画延时
export default {
  data() {
    return {
      songReady: false, // 歌曲是否加载完成
      currentTime: 0, // 歌曲当前播放时间
      currentLyric: null, // 当前已经解析过的歌词对象
      currentLineNum: 0, // 当前高亮的行
      currentShow: 'cd', // 当前显示是cd还是歌词
      playingLyric: '' // 歌曲当前播放的歌词内容(具体到那一句)
    };
  },
  computed: {
    ...mapGetters([
      'playing',
      'fullScreen',
      'playList',
      'sequenceList',
      'mode',
      'currentIndex',
      'currentSong'
    ]),
    // 播放与暂停按钮显示的class不同，样式不同
    playIcon() {
      return this.playing ? 'icon-pause' : 'icon-play';
    },
    // 缩小音乐后的播放与暂停，按钮样式不同
    miniIcon() {
      return this.playing ? 'icon-pause-mini' : 'icon-play-mini';
    },
    // 当歌曲没有加载完，用户不能点击，按钮样式不同
    disableCls() {
      return this.songReady ? '' : 'disable';
    },
    // 播放模式不同 图标不同
    iconMode() {
      return this.mode === playModel.sequence ? 'icon-sequence' : this.mode === playModel.loop ? 'icon-loop' : this.mode === playModel.random ? 'icon-random' : '';
    },
    // 播放音乐图片旋转
    cdCls() {
      return this.playing ? 'play' : 'play pause';
    },
    // 当前音乐已经播放的比例
    percent() {
      return this.currentTime / this.currentSong.duration;
    }
  },
  watch: {
    currentSong(olds, news) {
      if (olds.id === news.id) {
        return;
      }
      // 将当前的音乐stop掉，防止歌词切换的bug
      if (this.currentLyric) {
        this.currentLyric.stop();
      }
      // 在手机浏览器，前后台切换的时候js不会执行，再次切换到音乐播放的时候可能会有问题,为了防止切换歌曲无法播放，我们使用定时器延长时间
      // this.$nextTick(() => {
      //   this.$refs.audio.play();
      //   this._getlyric();
      // });
      setTimeout(() => {
        this.$refs.audio.play();
        this._getlyric();
      }, 1000);
    },
    playing(newPlaying) {
      const audio = this.$refs.audio;
      // this.$nextTick(() => {
      // });
      setTimeout(() => {
        newPlaying ? audio.play() : audio.pause();
      }, 20);
    }
  },
  components: {
    progressBar,
    progressCircle,
    scroll
  },
  methods: {
    // 缩小播放器
    back() {
      this.setFullScreen(false);
    },
    // 还原播放器
    open() {
      this.setFullScreen(true);
    },
    // 获取Mutations方法
    ...mapMutations({
      setFullScreen: 'SET_FULL_SCREEN',
      play: 'SET_PLAYING_STATE',
      setCurrentIndex: 'SET_CURRENT_INDEX',
      setMode: 'SET_MODE',
      setPlaylist: 'SET_PLAYLIST'
    }),
    // 动画(由小变大)
    enter(el, done) {
      const {x, y, scale} = this._getPosAndScale();
      let animation = {
        0: {
          transform: `translate3d(${x}px, ${y}px, 0) scale(${scale})`
        },
        60: {
          transform: `translate3d(0, 0, 0) scale(1.1)`
        },
        100: {
          transform: `translate3d(0, 0, 0) scale(1)`
        }
      };
      animations.registerAnimation({
        name: 'move',
        animation,
        presets: {
          duration: 400,
          easing: 'linear'
        }
      });
      animations.runAnimation(this.$refs.cdWrapper, 'move', done);
    },
    afterEnter() {
      // 动画结束，移除动画
      animations.unregisterAnimation('move');
      this.$refs.cdWrapper.style.animation = '';
    },
    // 动画有大变小
    leave(el, done) {
      this.$refs.cdWrapper.style.transition = 'all .4s';
      const {x, y, scale} = this._getPosAndScale();
      this.$refs.cdWrapper.style[transform] = `translate3d(${x}px, ${y}px, 0) scale(${scale})`;
      this.$refs.cdWrapper.addEventListener('transitionend', done);
    },
    afterLeave() {
      this.$refs.cdWrapper.style.transition = '';
      this.$refs.cdWrapper.style[transform] = '';
    },
    // 获取mini中图片的坐标和缩放大小
    _getPosAndScale() {
      // 小图片的宽度
      const targetWidth = 40;
      // 小图片的中心距离左边和下面的距离
      const paddingLeft = 20;
      const paddingBottom = 10;
      // 播放大图片中心距离上面的距离
      const paddingTop = 80;
      // 大图片宽度，为屏幕的80%
      const width = window.innerWidth * 0.8;
      // 初始缩放的比例
      const scale = targetWidth / width;
      // x，y轴移动的距离(由大图到小图中心点)
      const x = -(window.innerWidth / 2 - paddingLeft);
      const y = window.innerHeight - paddingTop - width / 2 - paddingBottom;
      return {
        x,
        y,
        scale
      };
    },
    // 播放与暂停
    togglePlaying() {
      // 如果歌曲没有ready就return
      if (!this.songReady) {
        return;
      }
      // 当前状态的取反
      this.play(!this.playing);
      this.songReady = false;
      // 暂停播放时候，我们应该去停止播放歌词
      if (this.currentLyric) {
        this.currentLyric.togglePlay();
      }
    },
    // 上一曲
    prev() {
      // 如果歌曲没有ready就return
      if (!this.songReady) {
        return;
      }
      if (this.playList === 1) {
        this.loop();
      } else {
        let index = this.currentIndex - 1;
        // 如果已经是第一首歌曲了  那么我们(暂时按照顺序播放处理)就该播放最后一首歌曲了
        if (index === -1) {
          index = this.playList.length - 1;
          console.log(index);
        }
        this.setCurrentIndex(index);
        // 如果当前歌曲是暂停，那么切换到下一首歌曲为播放 按钮的样式也要跟着变化
        if (!this.playing) {
          this.togglePlaying();
        }
      }
      this.songReady = false;
    },
    // 下一曲
    next() {
      // 如果歌曲没有ready就return
      if (!this.songReady) {
        return;
      }
      if (this.playList.length === 1) {
        this.loop();
      } else {
        let index = this.currentIndex + 1;
        // 如果已经是最后一首歌曲了  那么我们(暂时按照顺序播放处理)就该播放第一首歌曲了
        if (index === this.playList.length) {
          index = 0;
        }
        this.setCurrentIndex(index);
        // 如果当前歌曲是暂停，那么切换到下一首歌曲为播放 按钮的样式也要跟着变化
        if (!this.playing) {
          this.togglePlaying();
        }
      }
      this.songReady = false;
    },
    // 歌曲加载完成
    ready() {
      this.songReady = true;
      console.log(this.songReady);
    },
    // 当加载歌曲失败(我们任然能切换歌曲)
    error() {
      this.songReady = true;
      console.log('ppp');
    },
    // 歌曲播放时间变化，就会触发
    updateTime(event) {
      // audio有自带的可读写的当前播放时间的属性currentTime
      this.currentTime = event.target.currentTime;
    },
    // 当前歌曲播放完后触发
    end() {
      // 如果是单曲循环
      if (this.mode === playModel.loop) {
        this.loop();
      } else {
        // 否则切换到下一首
        this.next();
      }
    },
    // 单曲循环
    loop() {
      this.$refs.audio.currentTime = 0;
      this.$refs.audio.play();
      // 我们将歌词从新开始(插件带的方法)seek表示歌词回到其所对应的时间的位置
      if (this.currentLyric) {
        this.currentLyric.seek(0);
      }
    },
    // 将音乐的相关时间进行整理
    formate(interval) {
      interval = Math.floor(interval);
      const m = Math.floor(interval / 60); // 分
      // 这样发现会显示个位数的比如 0:3,我们想要的是0:03这样的时间
      // const s = interval % 60; // 秒
      const s = this._pad(interval % 60);
      return `${m}:${s}`;
    },
    // 对秒的时间进行整理，未满10秒显示为0：03这样的
    // 参数：秒，位数(我们要的是2位，未满2位用0补位)
    _pad(num, n = 2) {
      let len = num.toString().length;
      while (len < n) {
        num = '0' + num;
        len++;
      }
      return num;
    },
    // 改变音乐的播放进度
    percentChange(per) {
      const currentTime = this.currentSong.duration * per;
      this.$refs.audio.currentTime = currentTime;
      // 如果非播放状态，我们将其改为播放状态
      if (!this.playing) {
        this.togglePlaying();
      }
      // 将歌词调整到相关的位置
      if (this.currentLyric) {
        this.currentLyric.seek(currentTime * 1000);
      }
    },
    // 改变播放的模式
    changeMode() {
      let num = (this.mode + 1) % 3; // 因为只有3种模式
      this.setMode(num);

      let list = [];
      // 如果是随机播放，我们就将原始的音乐数据列表打乱赋值给list，否则直接赋值给list
      if (num === playModel.random) {
        list = shuffle(this.sequenceList);
      } else {
        list = this.sequenceList;
      }
      this._resetCurrentIndex(list);
    },
    // 当播放列表(playlist)发生变化,我们当前播放的音乐应该是不变的，但是currentSong是由index进和playlist决定的，所有要设置一下
    _resetCurrentIndex(list) {
      let index = list.findIndex((item) => {
        return item.id === this.currentSong.id;
      });
      this.setCurrentIndex(index);
    },
    // 获取歌词
    _getlyric() {
      this.currentSong.getlyric().then((lyric) => {
        this.currentLyric = new LyricParser(lyric, this.handleLyric); // 歌唱被封装为对象
        if (this.playing) { // 如果歌曲在播放那么歌唱也在播放
          this.currentLyric.play();
        }
        console.log(this.currentLyric);
      }).catch(() => {
        // 如果没有获取到歌词
        this.currentLyric = null;
        this.playingLyric = '';
        this.currentLineNum = 0;
      });
    },
    // 歌词每一行改变就会触发回调 lineNum表示当前行
    handleLyric({lineNum, txt}) {
      this.currentLineNum = lineNum;
      // 如果当前行> 5，那么就每隔1秒上升一行
      if (lineNum > 5) {
        let lineEl = this.$refs.lyricLine[lineNum - 5];
        this.$refs.lyricList.scrollToElement(lineEl, 1000);
      } else {
        // 一直在顶部
        this.$refs.lyricList.scrollTo(0, 0, 1000);
      }
      this.playingLyric = txt;
      console.log(this.playingLyric);
    },
    // 滑动开始
    middleTouchStart(e) {
      this.touch.initiated = true;
      const touch = e.touches[0];
      this.touch.startX = touch.pageX;
      this.touch.startY = touch.pageY;
    },
    // 滑动
    middleTouchMove(e) {
      if (!this.touch.initiated) {
        return;
      }
      const touch = e.touches[0];
      const deltX = touch.pageX - this.touch.startX;
      const deltY = touch.pageY - this.touch.startY;
      if (Math.abs(deltY) > Math.abs(deltX)) { // 因为歌词可以上下滑动，所以如果我们手指纵轴滑动大于横轴，我们就不横向移动页面
        return;
      }
      // 歌词页距离屏幕左边的距离
      const left = this.currentShow === 'cd' ? 0 : -window.innerWidth;
      // 因为向左滑动  所以为负数(我们取绝对值的最大值，但是不超过整个屏幕)
      const offsetWidth = Math.min(0, Math.max(-window.innerWidth, left + deltX));
      // 滑动的距离占屏幕的比例
      this.touch.percent = Math.abs(offsetWidth / window.innerWidth);
      this.$refs.lyricList.$el.style[transform] = `translate3d(${offsetWidth}px, 0, 0)`;
      this.$refs.lyricList.$el.style[transitionDuration] = 0;
      this.$refs.middleL.style.opacity = 1 - this.touch.percent; // 原来cd页面的透明度
      this.$refs.middleL.style[transitionDuration] = 0;
    },
    // 滑动结束
    middleTouchEnd(e) {
      let offsetWidth;
      let opacity;
      // 左滑和右滑10%就会起作用
      if (this.currentShow === 'cd') {
        if (this.touch.percent > 0.1) {
          offsetWidth = -window.innerWidth;
          opacity = 0;
          this.currentShow = 'lyric';
        } else {
          offsetWidth = 0;
          opacity = 1;
        }
      } else {
        if (this.touch.percent < 0.9) {
          offsetWidth = 0;
          this.currentShow = 'cd';
          opacity = 1;
        } else {
          offsetWidth = -window.innerWidth;
          opacity = 0;
        }
      }
      this.$refs.lyricList.$el.style[transform] = `translate3d(${offsetWidth}px, 0, 0)`;
      const time = 300; // 动画延时时间
      this.$refs.lyricList.$el.style[transitionDuration] = `${time}ms`;
      this.$refs.middleL.style.opacity = opacity;
      this.$refs.middleL.style[transitionDuration] = `${time}ms`;
    }
  },
  created() {
    this.touch = {};
  }
};
</script>

<style lang="scss" scoped>
  .player{
    .normal-player{
      position: fixed;
      left: 0;
      right: 0;
      top: 0;
      bottom: 0;
      z-index: 150;
      background: $color-background;
      .background{
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        z-index: -1;
        opacity: 0.6;
        filter: blur(20px);
      }
      .top {
        position: relative;
        margin-bottom: 25px;
        .back {
          position: absolute;
          top: 0;
          left: 6px;
          z-index: 50;
          .icon-back {
            display: block;
            padding: 9px;
            font-size: $font-size-large-x;
            color: $color-theme;
            transform: rotate(-90deg);
          }
        }
        .title{
          width: 70%;
          margin: 0 auto;
          line-height: 40px;
          text-align: center;
          @include no-wrap();
          font-size: $font-size-large;
          color: $color-text;
        }
        .subtitle{
          line-height: 20px;
          text-align: center;
          font-size: $font-size-medium;
          color: $color-text;
        }
      }
      .middle {
        position: fixed;
        width: 100%;
        top: 80px;
        bottom: 170px;
        white-space: nowrap;
        font-size: 0;
        .middle-l {
          display: inline-block;
          vertical-align: top;
          position: relative;
          width: 100%;
          height: 0;
          padding-top: 80%;
          .cd-wrapper {
            position: absolute;
            left: 10%;
            top: 0;
            width: 80%;
            height: 100%;
            .cd {
              width: 100%;
              height: 100%;
              box-sizing: border-box;
              border: 10px solid rgba(255, 255, 255, 0.1);
              border-radius: 50%;
              &.play{
                animation: rotate 20s linear infinite;
              }
              &.pause{
                animation-play-state: paused;
              }
              .image {
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
                height: 100%;
                border-radius: 50%;
              }
            }
          }
          .playing-lyric-wrapper {
            width: 80%;
            margin: 30px auto 0 auto;
            overflow: hidden;
            text-align: center;
            .playing-lyric{
              height: 20px;
              line-height: 20px;
              font-size: $font-size-medium;
              color: $color-text-l;
            }
          }
        }
        .middle-r {
          display: inline-block;
          vertical-align: top;
          width: 100%;
          height: 100%;
          overflow: hidden;
          .lyric-wrapper{
            width: 80%;
            margin: 0 auto;
            overflow: hidden;
            text-align: center;
            .text {
              line-height: 32px;
              color: $color-text-l;
              font-size: $font-size-medium;
              &.current {
                color: $color-text;
              }
            }
          }
        }
      }
      .bottom{
        position: absolute;
        bottom: 50px;
        width: 100%;
        .dot-wrapper {
          text-align: center;
          font-size: 0;
          .dot {
            display: inline-block;
            vertical-align: middle;
            margin: 0 4px;
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: $color-text-l;
            &.active {
              width: 20px;
              border-radius: 5px;
              background: $color-text-ll;
            }
          }
        }
        .progress-wrapper {
          display: flex;
          align-items: center;
          width: 80%;
          margin: 0px auto;
          padding: 10px 0;
          .time {
            color: $color-text;
            font-size: $font-size-small;
            flex: 0 0 30px;
            line-height: 30px;
            width: 30px;
            &.time-l {
              text-align: left;
            }
            &.time-r {
              text-align: right;
            }
          }
          .progress-bar-wrapper {
            flex: 1;
          }
        }
        .operators {
          display: flex;
          align-items: center;
          .icon {
            flex: 1;
            color: $color-theme;
            &.disable{
              color: $color-theme-d;
            }
            i{
              font-size: 30px;
            }
          }
          .i-left {
            text-align: right;
          }
          .i-center{
            padding: 0 20px;
            text-align: center;
            i{
              font-size: 40px;
            }
          }
          .i-right{
            text-align: left;
          }
          .icon-favorite{
            color: $color-sub-theme;
          }
        }
      }
      &.normal-enter-active, &.normal-leave-active {
        transition: all 0.4s;
        .top, .bottom {
          transition: all 0.4s cubic-bezier(0.86, 0.18, 0.82, 1.32);
        }
      }
      &.normal-enter, &.normal-leave-to{
        opacity: 0;
        .top {
          transform: translate3d(0, -100px, 0);
        }
        .bottom{
          transform: translate3d(0, 100px, 0);
        }
      }
    }
    .mini-player{
      display: flex;
      align-items: center;
      position: fixed;
      left: 0;
      bottom: 0;
      z-index: 180;
      width: 100%;
      height: 60px;
      background: $color-highlight-background;
      &.mini-enter-active, &.mini-leave-active{
        transition: all 0.4s;
      }
      &.mini-enter, &.mini-leave-to{
        opacity: 0;
      }
      .icon{
        flex: 0 0 40px;
        width: 40px;
        padding: 0 10px 0 20px;
        img{
          border-radius: 50%;
          &.play{
            animation: rotate 10s linear infinite;
          }
          &.pause{
            animation-play-state: paused;
          }
        }
      }
      .text{
        display: flex;
        flex-direction: column;
        justify-content: center;
        flex: 1;
        line-height: 20px;
        overflow: hidden;
        .name {
          margin-bottom: 2px;
          @include no-wrap();
          font-size: $font-size-medium;
          color: $color-text;
        }
        .desc {
          @include no-wrap();
          font-size: $font-size-small;
          color: $color-text-d;
        }
      }
      .control{
        flex: 0 0 30px;
        width: 30px;
        padding: 0 10px;
        .icon-play-mini, .icon-pause-mini, .icon-playlist{
          font-size: 30px;
          color: $color-theme-d;
        }
        .icon-mini{
          font-size: 32px;
          position: absolute;
          left: 0;
          top: 0;
        }
      }
    }
  }
  @keyframes rotate {
    0%{
      transform: rotate(0);
    }
    100%{
      transform: rotate(360deg);
    }
  }
</style>
