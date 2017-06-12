function update(vm, next) {
	const promise = vm.$options.prefetch({
		store: vm.$store,
		props: vm.$route.params,
		route: vm.$route
	});
	if (!promise) return next ? next() : undefined;
	vm.prefetching = true;
	promise
		.then(data => {
			vm.prefetching = false;
			Object.assign(vm.$data, data);
			if (next) next();
		})
		.catch(err => {
			vm.prefetching = false;
			vm.$store.commit('fireServerError', err);
			if (next) next(err);
		});
}

export default {
	data: () => ({
		// let component know when prefetching is done
		prefetching: false
	}),
	created() {
		// add prefetched data only after hydration (just after SSR)
		if (this.$root._isMounted || !this.$options.prefetchedData) return;
		Object.assign(this.$data, this.$options.prefetchedData);
	},
	// on route parameter change
	beforeRouteUpdate(to, from, next) {
		if (this.$options.prefetch) update(this, next);
		else next();
	},
	// trigger only on client (beforeMount is not triggered on server)
	beforeMount() {
		if (this.$root._isMounted && this.$options.prefetch) update(this);
	}
};