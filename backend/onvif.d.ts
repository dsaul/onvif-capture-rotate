declare module 'onvif' {
	type TCamCallback = (this, err: Error, time: unknown, xml: unknown) => void;
	type TGetStreamUriCallback = (err: Error, stream: { uri: string }) => void;
	
	class Cam {
		constructor(options: {
			useSecure?: boolean;
			secureOpts?: any;
			hostname?: string;
			username?: string | undefined;
			password?: string | undefined;
			port?: number | undefined;
			path?: string | undefined;
			timeout?: number | undefined;
			autoconnect?: boolean | undefined;
			preserveAddress?: boolean | undefined;
		}, callback: TCamCallback);
		
		getStreamUri: (options: {
			stream?: string;
			protocol?: string;
			profileToken?: string;
		}, callback: TGetStreamUriCallback) => void;
		
		
	}
	class Discovery {
		
	}
}

