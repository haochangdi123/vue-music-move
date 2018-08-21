import Vue from 'vue';
import Router from 'vue-router';
import recommend from '../components/recommend/Recommend';
import singer from '../components/singer/Singer';
import rank from '../components/rank/Rank';
import search from '../components/search/Search';
import singerDetail from '../components/singer-detail/Singer-detail';

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/',
      redirect: '/recommend'
    },
    {
      path: '/recommend',
      component: recommend
    },
    {
      path: '/singer',
      component: singer,
      children: [
        {
          path: ':id',
          component: singerDetail
        }
      ]
    },
    {
      path: '/rank',
      component: rank
    },
    {
      path: '/search',
      component: search
    }
  ]
});
