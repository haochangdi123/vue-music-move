import {playModel} from '../common/js/config';
const state = {
  singer: {}, // 歌手
  playing: false, // 播放
  fullScreen: false, // 全屏
  playList: [], // 音乐播放的顺序列表，可为正序，逆序，随机，单曲
  sequenceList: [], // 播放列表(就是所有音乐的原始列表)
  mode: playModel.sequence, // 音乐播放模式
  currentIndex: -1 // 当前播放音乐的下标
};
export default state;
