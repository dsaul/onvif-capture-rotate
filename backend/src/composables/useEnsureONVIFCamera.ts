import { ICamera } from "../ICamera";
import { Ref } from 'vue';
import { Cam } from 'onvif';

const useEnsureONVIFCamera = (camera: Ref<ICamera>) => {
	return () => {
		
		return new Promise<void>((resolve, reject) => {
			if (!camera.value.cam) {
				camera.value.cam = new Cam({
					hostname: camera.value.host,
					username: camera.value.username,
					password: camera.value.password,
					port: camera.value.port
				}, (err: Error) => {
					if (!camera.value.cam) {
						reject(new Error('!camera.value.cam'));
						return;
					}
	
					if (err) {
						reject(new Error(`[${camera.value.host}:${camera.value.port}] Connection Failed Username: ${camera.value.username} Password: ${camera.value.password} Reason: ${err.message}`));
						return;
					}
					console.info(`[${camera.value.host}:${camera.value.port}] Connected`);
					
					camera.value.cam.getStreamUri({ protocol: 'RTSP' }, (err: Error, stream: { uri: string }) => {
						camera.value.streamURI = stream.uri;
						
						resolve();
						return;
					});
				});
			}
			
			resolve();
			return;
		});
	}
};

export { useEnsureONVIFCamera }