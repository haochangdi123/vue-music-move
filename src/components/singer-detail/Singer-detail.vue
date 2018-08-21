<template>
  <transition name="slide">
    <!-- <div class="singer-detail"></div> -->
    <music-list :songs="songList" :title="title" :bg-img="bgImg"></music-list>
  </transition>
</template>

<script>
import {mapGetters} from 'vuex'; // 获取state的语法糖，
import {getSingerDetail} from './../../api/singer';
import {ERR_OK} from '../../api/config';
import {createSong} from '../../common/js/song';
import musicList from './../music-list/Music-list';
export default {
  data() {
    return {
      songList: []
    };
  },
  computed: {
    ...mapGetters([
      'singer'
    ]),
    title() {
      return this.singer.name;
    },
    bgImg() {
      return this.singer.avatar;
    }
  },
  components: {
    musicList
  },
  methods: {
    _getSingerDetail() {
      // 因为是通过vuex设置的数据，又通过vuex获取的数据，但是刷新后数据就没了，所以一刷新我们就回到上一页
      if (!this.singer.mid) {
        this.$router.push('/singer');
        return;
      }
      getSingerDetail(this.singer.mid).then((res) => {
        if (ERR_OK === res.code) {
          this.songList = this._normalizeSongs(res.data.list);
        }
      });
    },
    _normalizeSongs(list) {
      let res = [];
      list.forEach(ele => {
        let {musicData} = ele;
        if (musicData.songid && musicData.songmid) { // 这两个id是必须的
          res.push(createSong(musicData));
        }
      });
      return res;
    }
  },
  created() {
    this._getSingerDetail();
  }
};
</script>

<style lang="scss" scoped>
  // .singer-detail {
  //   position: fixed;
  //   top: 0;
  //   bottom: 0;
  //   left: 0;
  //   right: 0;
  //   z-index: 100;
  //   background: $color-background;
  // }
  .slide-enter-active,
  .slide-leave-active {
    transition: all .3s ease;
  }
  .slide-enter,
  .slide-leave-to {
    transform: translate3d(100%, 0, 0);
  }
</style>
