// (c) 2023 Dan Saul
import { ChildProcess } from 'child_process';
import { Cam } from 'onvif';

interface ICamera {
	name: string;
	host: string;
	username: string;
	password: string;
	port: number;
	alwaysKeepLatestCount: number;
	segmentDurationSeconds: number;
	mediaDirectoryRoot: string;
	cam?: Cam | null;
	streamURI?: string | null;
	ffmpegProcess?: ChildProcess | null;
	transpose?: null | 'clockwise' | 'counterclockwise';
}
export { ICamera }