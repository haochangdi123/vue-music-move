import * as types from './mutation-types';
import {playModel} from '../common/js/config';
import {shuffle} from '../common/js/utils';

// 找到当前播放歌曲的index
function findI(list, song) {
  return list.findIndex((item) => {
    return item.id === song.id;
  });
}
// 通过commit才能调用mutation的方法,
export const selectPlay = function({commit, state}, {list, index}) {
  commit(types.SET_SEQUENCELIST, list); // 调用mutations的SET_PLAYING_STATE方法，将歌曲列表设置为list
  // 如果歌曲已经在按照随机播放顺序播放了
  if (state.mode === playModel.random) {
    let randomList = shuffle(list);
    commit(types.SET_PLAYLIST, randomList);
    index = findI(randomList, list[index]); // 找到当前播放歌曲在randomList中的索引
  } else {
    // 播放列表就是顺序列表
    commit(types.SET_PLAYLIST, list); // 将歌曲播列表设置为list
  }
  commit(types.SET_CURRENT_INDEX, index); // 将当前播放歌曲的下标设置为index
  commit(types.SET_PLAYING_STATE, true); // 将歌曲的播放状态设置为true
  commit(types.SET_FULL_SCREEN, true); // 将歌曲全屏展示
};

// 随机播放
export const randomPlay = function ({commit}, {list}) {
  commit(types.SET_MODE, playModel.random); // 将播放模式改为随机播放
  commit(types.SET_SEQUENCELIST, list); // 调用mutations的SET_PLAYING_STATE方法，将歌曲列表设置为list
  let randomList = shuffle(list);
  commit(types.SET_PLAYLIST, randomList); // 将歌曲播列表设置为list
  commit(types.SET_CURRENT_INDEX, 0); // 将当前播放歌曲的下标设置为index
  commit(types.SET_PLAYING_STATE, true); // 将歌曲的播放状态设置为true
  commit(types.SET_FULL_SCREEN, true); // 将歌曲全屏展示
};
