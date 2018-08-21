<template>
  <div id="app">
    <headerc></headerc>
    <tab></tab>
    <keep-alive>
      <router-view/>
    </keep-alive>
    <player></player>
  </div>
</template>

<script>
import Headerc from './components/header/Header';
import Tab from './components/tab/Tab';
import Player from './components/player/Player'; // 因为音乐播放器是每一个页面都是可以用到的，所以放在app.vue
export default {
  name: 'App',
  components: {
    Headerc,
    Tab,
    Player
  }
};
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>
