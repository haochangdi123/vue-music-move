import * as types from './mutation-types';

const mutations = {
  // 设置set方法，对state进行赋值
  [types.SET_SINGER](state, singer) {
    state.singer = singer;
  },
  [types.SET_PLAYING_STATE](state, flag) {
    state.playing = flag; // 因为播放状态通常是布尔值，所以用flag
  },
  [types.SET_FULL_SCREEN](state, flag) {
    state.fullScreen = flag;
  },
  [types.SET_PLAYLIST](state, list) {
    state.playList = list;
  },
  [types.SET_SEQUENCELIST](state, list) {
    state.sequenceList = list;
  },
  [types.SET_MODE](state, obj) {
    state.mode = obj;
  },
  [types.SET_CURRENT_INDEX](state, index) {
    state.currentIndex = index;
  }
};

export default mutations;
