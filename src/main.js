import 'babel-polyfill';
import Vue from 'vue';
import App from './App';
import router from './router';
import store from './store';
import fastclick from 'fastclick';
// 引入的字体样式
import '../src/common/style/icon.scss';
import VueLazyload from 'vue-lazyload';

Vue.use(VueLazyload, {
  loading: require('./common/image/default.png')
});

Vue.config.productionTip = false;

fastclick.attach(document.body);
/* eslint-disable no-new */
new Vue({
  el: '#app',
  store,
  router,
  render: h => h(App)
});
