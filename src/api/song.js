import { commonParams } from './config.js';
import axios from 'axios';

export function getlyric(mid) {
  const url = '/api/lyric';

  const data = Object.assign({}, commonParams, {
    pcachetime: +new Date(),
    songmid: mid,
    g_tk: 5381,
    format: 'json',
    platform: 'yqq',
    needNewCode: 0,
    hostUin: 0
  });

  return axios.get(url, {
    params: data
  }).then((res) => {
    return Promise.resolve(res.data);
  });
}
