import { spawn } from "node:child_process";
import ffmpegPath from "ffmpeg-static";
import { Readable } from "node:stream";

export interface PlaybackInterface {
    setCurrent(stream: Readable): Promise<void>;
}

export class PlaybackRepository implements PlaybackInterface {
    private readonly rtmpAddr: string;
    private readonly ffmpegPath: string;

    constructor(rtmpAddr: string) {
        if (!ffmpegPath) {
            throw new Error("ffmpeg not found");
        }
        this.ffmpegPath = ffmpegPath;
        this.rtmpAddr = rtmpAddr;
    }

    async setCurrent(stream: Readable): Promise<void> {
        const ffmpeg = spawn(this.ffmpegPath, [
            "-re",
            "-i", "pipe:0",
            "-c:a", "aac",
            "-b:a", "128k",
            "-f", "flv",
            `${this.rtmpAddr}`
        ]);

        stream.pipe(ffmpeg.stdin);
    }
}