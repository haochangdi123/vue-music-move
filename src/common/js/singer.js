// 我们构造的Singer类
export default class Singer {
  constructor({id, name, mid}) {
    this.name = name;
    this.id = id;
    this.mid = mid;
    this.avatar = `https://y.gtimg.cn/music/photo_new/T001R150x150M000${mid}.jpg`;
  }
}
