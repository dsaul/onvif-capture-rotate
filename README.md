# onvif-capture-rotate

There are many open source NVR systems out there, a lot of these have advanced features such as AI object detection, notifications, and more. These features however, can be very CPU intensive, and thus don't work well in a shared server environment.

This tool does one thing, it talks to a list of ONVIF cameras, gets the stream link, then begins capturing the video stream to disk. If disk space is getting low, it will delete the oldest segment for that camera to ensure that disk space doesn't run out.

This can be done in less than 1% cpu usage per camera, as compared to transcoding which take up to 25% cpu on a Ryzen 3950x.

