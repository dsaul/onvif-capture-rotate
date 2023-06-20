import { Ref, computed } from 'vue';
import fs from 'fs';
import isEmpty from '../isEmpty';
import { IFilesystemError } from '../IFilesystemError';
import { ICamera } from '../ICamera';



const useEnsureDirectory = (path: Ref<string>) => {

	return async () => {
		try {
			const stat = await fs.promises.stat(path.value);

			if (!stat.isDirectory()) {
				throw new Error(`${path.value} is not a directory`);
			}

		} catch (err) {
			if (err &&
				err instanceof Error &&
				!isEmpty((err as IFilesystemError).code)
				&& (err as IFilesystemError).code === 'ENOENT'
			) {
				fs.promises.mkdir(path.value);
			}
			else {
				console.error(`can't access ${path.value}`, err);
				throw err;
			}
		}
	};

};

const useEnsureDirectoryCamera = (camera: Ref<ICamera>) => {
	
	const path = computed(() => {
		return camera.value.mediaDirectoryRoot;
	})
	
	return useEnsureDirectory(path);
};

export { useEnsureDirectory, useEnsureDirectoryCamera }