import {getlyric} from '../../api/song'; // 获取歌词的方法
import {ERR_OK} from '../../api/config';
import {Base64} from 'js-base64'; // 解码歌词

export default class Song {
  // id,mid,歌手，歌曲名字，专辑的名字， 歌曲长度,歌曲的图片，歌曲的真实路径
  constructor({id, mid, singer, name, album, duration, image, url}) {
    this.id = id;
    this.mid = mid;
    this.singer = singer;
    this.name = name;
    this.album = album;
    this.duration = duration;
    this.image = image;
    this.url = url;
  }

  getlyric() { // 获取歌词
    if (this.lyric) {
      return Promise.reslove(this.lyric);
    }
    return new Promise((resolve, reject) => {
      getlyric(this.mid).then((res) => {
        if (res.code === ERR_OK) {
          this.lyric = Base64.decode(res.lyric);
          resolve(this.lyric);
        } else {
          reject(new Error('no lyric'));
        }
      });
    });
  }
}

export function createSong(musicData) {
  return new Song({
    id: musicData.songid,
    mid: musicData.songmid,
    singer: filterSinger(musicData.singer),
    name: musicData.songname,
    album: musicData.albumname,
    duration: musicData.interval,
    image: `https://y.gtimg.cn/music/photo_new/T002R300x300M000${musicData.albummid}.jpg?max_age=2592000`,
    url: 'http://dl.stream.qqmusic.qq.com/C4000024vbNZ4bQz74.m4a?vkey=FD7B8F3FD919B6D0E34BC374B599D14768B5B1586F10F2560BF6A9236EF2EC036EE9AEEC94A4ADAE1FA6A76983BC172332C422E61A601C0E&guid=8308852841&uin=0&fromtag=66'
  });
}

function filterSinger(singer) {
  let res = [];
  if (!singer) {
    return '';
  }
  singer.forEach(ele => {
    res.push(ele.name);
  });
  return res.join('/');
}
