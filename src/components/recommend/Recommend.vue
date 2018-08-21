<template>
  <div class="recommend">
    <scroll class="recommenf-main" :data="musicList">
      <div>
        <div class="swiper-wrapper" v-if="swiperList.length">
          <slider>
            <div v-for="(item,index) in swiperList" :key="index">
              <a :src="item.linkUrl">
                <img :src="item.picUrl">
              </a>
            </div>
          </slider>
        </div>
        <div class="recommend-music">
          <div class="title">热门歌单推荐</div>
          <ul class='music-list'>
            <li class="music-item" v-for="(item,index) in musicList" :key="index">
              <div class="music-img">
                <img v-lazy="item.imgurl" alt="" width="50" height="50">
              </div>
              <div class="music-msg">
                <h3 class="name">{{item.creator.name}}</h3>
                <p class="message">{{item.dissname}}</p>
              </div>
            </li>
          </ul>
        </div>
      </div>
       <div class="load-wrapper" v-if="!musicList.length">
          <load></load>
        </div>
    </scroll>
  </div>
</template>
<script>
import {getDiscList} from './../../api/recommmend.js';
import {ERR_OK} from './../../api/config.js';
import Scroll from './../../base/scroll/scroll.vue';
import load from './../../base/loading/loading';
import slider from './../../base/slider/slider';
import axios from 'axios';
export default {
  data() {
    return {
      swiperList: [],
      musicList: []
    };
  },
  components: {
    slider,
    Scroll,
    load
  },
  methods: {
    _getSwiperlist() {
      axios.get('/api/getSwiperList', {
      }).then((res) => {
        if (res.data.code === ERR_OK) {
          this.swiperList = res.data.data.slider;
        }
      });
    },
    _getDiscList() {
      getDiscList().then((res) => {
        if (res.code === ERR_OK) {
          this.musicList = res.data.list;
        }
      });
    }
  },
  created() {
    this._getSwiperlist();
    this._getDiscList();
  }
};
</script>

<style lang="scss" scoped>
  .recommend {
    position: fixed;
    top: 80px;
    bottom: 0;
    width: 100%;
    .recommenf-main {
      height: 100%;
      overflow: hidden;
       .recommend-music {
        .title {
          font-size: $font-size-small;
          text-align: center;
          color: $color-theme;
          line-height: 52px;
        }
        .music-list {
          .music-item {
            display: flex;
            padding: 0 20px 20px 20px;
            align-items: center;
            .music-img {
              flex: 0 0 50px;
              width: 50px;
            }
            .music-msg {
              flex: 1;
              margin-left: $font-size-medium-x;
              font-size: $font-size-small;
              line-height: 25px;
              text-align: left;
              .message {
                color: $color-text-d;
              }
            }
            &:last-child {
              margin-bottom: 0;
            }
          }
        }
      }
      .load-wrapper {
        position: absolute;
        width: 100%;
        top: 50%;
        transform: translateY(-50%);
      }
    }
  }
</style>
