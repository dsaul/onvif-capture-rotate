interface IFilesystemError extends Error {
	code: string;
	errorno: number;
	path: string;
	syscall: string;
}

export { IFilesystemError }