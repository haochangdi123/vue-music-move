import Vue from 'vue';
import Vuex from 'vuex';

import * as actions from './actions'; // 用* as actions这样的方式，我们可以用 actions. 来获取引入的方法和属性
import * as getters from './getters';
import state from './state';
import mutations from './mutations';

import createLogger from 'vuex/dist/logger'; // vuex自带的，会在每一次更改state的时候，会打印该state，将过去与现在进行对比

Vue.use(Vuex);

// 在非生产模式可以调试
const debug = process.env.NODE_ENV !== 'production';
export default new Vuex.Store({
  state,
  getters,
  mutations,
  actions,
  strict: debug, // 会判断state的修改是不是来源于mutations，如果不是会在非生产模式报警告
  plugins: debug ? [createLogger()] : []
});
