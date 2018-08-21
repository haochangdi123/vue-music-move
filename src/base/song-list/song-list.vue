<template>
  <div class="song-list">
    <ul>
      <li v-for="(song,index) in songs" :key="index" class="item" @click="selectitem(song,index)">
        <div class="content">
          <h1 class="name">{{song.name}}</h1>
          <p class="desc">{{getDesc(song)}}</p>
        </div>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  props: {
    songs: {
      type: Array,
      default() {
        return [];
      }
    }
  },
  data() {
    return {
    };
  },
  methods: {
    // 歌曲的描述
    getDesc(song) {
      return `${song.singer}·${song.album}`;
    },
    // 选择歌曲播放
    selectitem(song, index) {
      this.$emit('select', song, index);
    }
  },
  created() {}
};
</script>

<style lang="scss" scoped>
  .song-list {
    padding: 20px;
    .item {
      height: 64px;
      .content {
        line-height: 20px;
        .name {
           color: $color-text;
           @include no-wrap();
        }
        .desc {
          margin-top: 4px;
          color: $color-text-d;
          @include no-wrap();
        }
      }
    }
  }
</style>
