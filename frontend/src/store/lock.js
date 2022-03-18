import AwaitLock from 'await-lock';

export default class Lock {
	constructor(lock) {
		this.lock = lock;
	}

	static create() {
		return new Lock(new AwaitLock());
	}

	async initialize(callback, commit, dispatch, getters) {
		await this.lock.acquireAsync();
		try {
			if (!getters.getInitialized) {
				await callback();
				commit('setInitialized', true);
			}
		}
		finally {
			this.lock.release();
		}
	}

	async uninitialize(callback, commit, dispatch, getters) {
		await this.lock.acquireAsync();
		try {
			if (getters.getInitialized) {
				await callback();
				commit('setInitialized', false);
			}
		}
		finally {
			this.lock.release();
		}
	}
}
