// (c) 2023 Dan Saul
import isEmpty from '../isEmpty';
import { ICamera } from "../ICamera";
import { Ref, ref } from 'vue';
import path from 'path';
import fs from 'fs';
import checkDiskSpace from 'check-disk-space';
import { spawn } from 'child_process';
import { useEnsureDirectory } from './useEnsureDirectory';

const useLaunchFFMPEGIfRequired = (
	camera: Ref<ICamera>
	) => {
	const normalizedName = camera.value.name.replace(/[^A-Za-z0-9-]/i, '-');
	const cameraMediaRoot = ref(path.join(camera.value.mediaDirectoryRoot, normalizedName));

	const ensureCameraDirectory = useEnsureDirectory(cameraMediaRoot);
	
	return async () => {
		
		await ensureCameraDirectory();
		
		// console.log('camera.value.ffmpegProcess', !!camera.value.ffmpegProcess, 'camera.value.streamURI', !isEmpty(camera.value.streamURI))
		
		if (!camera.value.ffmpegProcess && !isEmpty(camera.value.streamURI)) {
				
			const uri  = new URL(camera.value.streamURI);
			uri.username = camera.value.username;
			uri.password = camera.value.password;
			const uriStr = uri.toString();
			// console.log(uriStr);
			
			// If we are running low on disk space, remove the oldest 
			// recording for this camera before starting recording.
			while ((await checkDiskSpace(cameraMediaRoot.value)).free < 2147483648) { // 2gb
				const files = await fs.promises.readdir(cameraMediaRoot.value);
				const mkvFiles = files.filter((filename) => {
					return path.extname(filename) === '.mkv';
				});
				
				// Always ensure we keep the last 5 files.
				if (mkvFiles.length < camera.value.alwaysKeepLatestCount) {
					break;
				}
				
				const mkvFilesSized = mkvFiles.map((filename) => {
					const stat = fs.statSync(path.join(cameraMediaRoot.value, filename));
					
					return {
						filename: filename,
						mtimeMs: stat.mtimeMs,
					};
				})
				
				const oldest = mkvFilesSized.reduce((prev, current) => {
					if (prev.mtimeMs > current.mtimeMs) {
						return current;
					}
					return prev;
				});
				
				const pathToUnlink = path.join(cameraMediaRoot.value, oldest.filename);
				console.info(`[${camera.value.host}:${camera.value.port}] unlinking ${pathToUnlink}`);
				await fs.promises.unlink(pathToUnlink);
			}
			
			const filePath = path.join(cameraMediaRoot.value, `${normalizedName}-%Y-%m-%d_%H-%M-%S.mkv`);
			
			const ffmpegArgs = [];
			ffmpegArgs.push(...[
				'-i', uriStr, // the rtsp stream to save
				'-err_detect', 'explode',
				'-acodec', 'copy', // just copy the audio stream
				'-map', '0', // select all streams
				'-f', 'segment', // we want to save the stream in a collection of files
				'-segment_time', `${camera.value.segmentDurationSeconds}`, // segment duration in seconds
				'-reset_timestamps', '1', // the saved file should have its own timestamps
				'-segment_format', 'mkv', // use the container format mkv, because it rocks
				'-strftime', '1', // we want to do advanced filename replacements
				'-loglevel', 'quiet', // reduce logging
			]);
			
			switch (camera.value?.transpose) {
				default:
					ffmpegArgs.push(...[
						'-vcodec', 'copy', // just copy the video stream
					]);	
					
					break;
				case 'clockwise': {
					ffmpegArgs.push(...[
						'-vcodec',
						'hevc',
						'-vf',
						'transpose=1',
					]);
					break;
				}
				case 'counterclockwise': {
					ffmpegArgs.push(...[
						'-vcodec',
						'hevc',
						'-vf',
						'transpose=2',
					]);
					break;
				}
			}
			
			ffmpegArgs.push(filePath);
			
			// Double check here because of concurrency
			if (!camera.value.ffmpegProcess) {
				console.info(`launching ffmpeg arguments`, ffmpegArgs);
				
				camera.value.ffmpegProcess = spawn(
					'ffmpeg', 
					ffmpegArgs
				);
				
				camera.value.ffmpegProcess.on('error', (error) => {
					console.error(`[${camera.value.host}:${camera.value.port}]  error: ${error.message}`);
					camera.value.ffmpegProcess = null;
				});
				camera.value.ffmpegProcess.on('close', (code) => {
					console.log(`[${camera.value.host}:${camera.value.port}] child process exited with code ${code}`);
					camera.value.ffmpegProcess = null;
				});
				if (camera.value.ffmpegProcess.stdout) {
					camera.value.ffmpegProcess.stdout.on('data', (data) => {
						console.log(`[${camera.value.host}:${camera.value.port}] ${data}`);
					});
				}
				if (camera.value.ffmpegProcess.stderr) {
					camera.value.ffmpegProcess.stderr.on('data', (data) => {
						console.warn(`[${camera.value.host}:${camera.value.port}] ${data}`);
					});
				}
			}
		}
	}
	
};

export { useLaunchFFMPEGIfRequired }