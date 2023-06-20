// (c) 2023 Dan Saul
import { ref, Ref } from 'vue';
import { ICamera } from './ICamera';
import ini from 'ini';
import fs from 'fs';

import { useEnsureDirectoryCamera } from './composables/useEnsureDirectory';
import { useEnsureONVIFCamera } from './composables/useEnsureONVIFCamera';
import { useLaunchFFMPEGIfRequired } from './composables/useLaunchFFMPEGIfRequired';
import isEmpty from './isEmpty';



// find ini in current directory

const config = ini.parse(fs.readFileSync('config.ini', 'utf-8'));

const cameras = ref<Ref<ICamera>[]>([]);

for (const [key, value] of Object.entries(config)) {
	
	const kvp = value as {
		host?: string;
		username?: string;
		password?: string;
		port?: string;
		alwaysKeepLatestCount?: string;
		mediaDirectoryRoot?: string;
		segmentDurationSeconds?: string;
	}
	
	const name = key;
	const host = kvp.host;
	const username = kvp.username;
	const password = kvp.password;
	const port = parseInt(`${ kvp.port || ''}`, 10);
	const alwaysKeepLatestCount = parseInt(`${ kvp.alwaysKeepLatestCount || ''}`, 10);
	const mediaDirectoryRoot = kvp.mediaDirectoryRoot;
	const segmentDurationSeconds = parseInt(`${ kvp.segmentDurationSeconds || ''}`, 10);
	
	if (isEmpty(name)) {
		console.error('name is invalid');
		continue;
	}
	if (isEmpty(host)) {
		console.error('host is invalid');
		continue;
	}
	if (isEmpty(username)) {
		console.error('username is invalid');
		continue;
	}
	if (isEmpty(password)) {
		console.error('password is invalid');
		continue;
	}
	if (isNaN(port)) {
		console.error('port is invalid');
		continue;
	}
	if (isNaN(alwaysKeepLatestCount)) {
		console.error('alwaysKeepLatestCount is invalid');
		continue;
	}
	if (isNaN(segmentDurationSeconds)) {
		console.error('segmentDurationSeconds is invalid');
		continue;
	}
	if (isEmpty(mediaDirectoryRoot)) {
		console.error('mediaDirectoryRoot is invalid');
		continue;
	}
	
	const camera = ref<ICamera>({
		name,
		host,
		username,
		password,
		port,
		alwaysKeepLatestCount,
		mediaDirectoryRoot,
		segmentDurationSeconds,
	});
	
	cameras.value.push(camera);
}


const loop = async () => {
	// console.log('loop');

	for (const camera of cameras.value) {
		const ensureRootDirectory = useEnsureDirectoryCamera(camera);
		
		const ensureONVIFCamera = useEnsureONVIFCamera(camera);
		const launchFFMPEGIfRequired = useLaunchFFMPEGIfRequired(camera);
		
		await ensureRootDirectory();
		await ensureONVIFCamera();
		await launchFFMPEGIfRequired();
	}
}

(async () => {

	await loop();
	setInterval(() => {
		loop();
	}, 100);

})();

