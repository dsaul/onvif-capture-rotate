// (c) 2023 Dan Saul
interface IFilesystemError extends Error {
	code: string;
	errorno: number;
	path: string;
	syscall: string;
}

export { IFilesystemError }