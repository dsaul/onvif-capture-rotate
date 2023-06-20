# onvif-capture-rotate

There are many open source NVR systems out there, a lot of these have advanced features such as AI object detection, notifications, and more. These features however, can be very CPU intensive, and thus don't work well in a shared server environment.

This tool does one thing, it talks to a list of ONVIF cameras, gets the stream link, then begins capturing the video stream to disk. If disk space is getting low, it will delete the oldest segment for that camera to ensure that disk space doesn't run out.

This can be done in less than 1% cpu usage per camera, as compared to transcoding which take up to 25% cpu on a Ryzen 3950x.

## Deploy with Docker

1. Create a folder where you store your docker configuration, for example ```onvif-capture-rotate``` .
2. Create the following  ```docker-compose.yml``` file:
	```
	version: '2.0'
	services:
	  ovif-capture-rotate:
	  container_name: ovif-capture-rotate
	  image: maskawanian/ovif-capture-rotate:latest
	  restart: always
	  volumes:
		- ./data-CCTV:/CCTV
		- ./config.ini:/app/config.ini
	  ```
3. Create the following ```config.ini``` file:

	One of the following sections, per camera.

	```
	[unique-camera-name]
	host = 
	username = 
	password = 
	port = 80
	alwaysKeepLatestCount = 5
	mediaDirectoryRoot = /CCTV
	segmentDurationSeconds = 3600
	```
	The following setting keys can be set:
	* **host** The IP Address of the ONVIF compatible camera.
	* **username** The username configured on the camera.
	* **password** The password configured on the camera.
	* **port** The API HTTP port on the camera.
	* **alwaysKeepLatestCount** How many videos will be protected from deletion in low disk space situations.
	* **mediaDirectoryRoot** Where to store the stream captures. Can be the same for each camera, a sub folder will be created with the camera name.
	* **segmentDurationSeconds** How long should each segment should be, in seconds.
	