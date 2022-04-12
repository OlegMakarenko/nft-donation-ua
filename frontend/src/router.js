import Vue from 'vue';
import Router from 'vue-router';
Vue.use(Router);

const routerConfig = {
	mode: 'history',
	scrollBehavior(to, from, savedPosition) {
		if (to.name === 'details' || to.name === 'account') {
			return { x: 0, y: 0 };
		}

		if (savedPosition) {
			setTimeout(() => {
				window.scrollTo && window.scrollTo({top: savedPosition.y})	
			}, 500);
			return savedPosition;
		}
	},
	routes: [
		{
			path: '/',
			name: 'home',
			component: () => import('./views/Home.vue')
		},
		{
			path: '/nft/:id',
			name: 'details',
			component: () => import('./views/Details.vue')
		},
		{
			path: '/account',
			name: 'account',
			component: () => import('./views/Account.vue')
		},
		{
			path: '/account/:address',
			name: 'account',
			component: () => import('./views/Account.vue')
		},
		{
			path: '/raised',
			name: 'raised',
			component: () => import('./views/Participants.vue')
		},
		{
			path: '*',
			name: '404',
			component: () => import('./views/NotFound.vue')
		}
	]
};

export default new Router(routerConfig);
