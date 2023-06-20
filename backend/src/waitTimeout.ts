// (c) 2023 Dan Saul
const waitTimeout = (timeout: number) => {
	return new Promise((resolve) => {
		setTimeout(resolve, timeout);
	});
}

export { waitTimeout };