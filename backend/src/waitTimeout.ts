const waitTimeout = (timeout: number) => {
	return new Promise((resolve) => {
		setTimeout(resolve, timeout);
	});
}

export { waitTimeout };