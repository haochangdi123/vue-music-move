<template>
  <div class="singer">
    <listview :singerData="singerList" v-if="singerList.length" @select="selectSinger"></listview>
    <router-view></router-view>
  </div>
</template>

<script>
import {getSingerList} from '../../api/singer';
import {ERR_OK} from '../../api/config';
import Singer from '../../common/js/singer';
import listview from '../../base/listview/listview';
import {mapMutations} from 'vuex'; // vuex自带的语法糖,用来调用store的方法
const HOT_NAME = '热门';
const HOT_SINGER_LENGTH = 10; // 我们设置热门的歌手数量为10
export default {
  data() {
    return {
      singerList: []
    };
  },
  components: {
    listview
  },
  methods: {
    // 获取歌手
    _getSinger() {
      getSingerList().then((res) => {
        if (res.code === ERR_OK) {
          this.singerList = this._normalizeSinger(res.data.list);
        }
      });
    },
    // 对歌手进行二次封装(list为歌手列表，是按找热门排序的)
    _normalizeSinger(list) {
      let map = {
        hot: {
          title: HOT_NAME,
          items: []
        }
      };
      list.forEach((ele, index) => {
        // 我们将热门的前10个歌手导入到热门中
        if (index < HOT_SINGER_LENGTH) {
          map.hot.items.push(new Singer({
            id: ele.Fsinger_id,
            name: ele.Fsinger_name,
            mid: ele.Fsinger_mid
          }));
        }
        // 将每一个歌手按照首字母放在自己的该放在的字母中
        let key = ele.Findex;
        if (!map[key]) {
          map[key] = {
            title: key,
            items: []
          };
        }
        map[key].items.push(new Singer({
          id: ele.Fsinger_id,
          name: ele.Fsinger_name,
          mid: ele.Fsinger_mid
        }));
      });
      // 为了得到有序列表(a-z)，我们要对map进行排序
      let hot = []; // hot数组
      let res = []; // a-z数组
      for (let k in map) {
        let val = map[k];
        // title为a-z的放在res数组
        if (val.title.match(/[a-zA-Z]/)) {
          res.push(val);
        } else if (val.title === HOT_NAME) {
          hot.push(val);
        }
      }
      // 对a-z排序，首先将a-z变为数子再比较
      res.sort((a, b) => {
        return a.title.charCodeAt(0) - b.title.charCodeAt(0);
      });
      return hot.concat(res);
    },
    selectSinger(item) {
      this.$router.push({
        path: `/singer/${item.mid}`
      });
      this.setSinger(item);
    },
    ...mapMutations({
      setSinger: 'SET_SINGER'
    })
  },
  created() {
    this._getSinger();
  }
};
</script>

<style lang="scss" scoped>
  .singer {
    position: fixed;
    top: 80px;
    width: 100%;
    bottom: 0;
  }
</style>
