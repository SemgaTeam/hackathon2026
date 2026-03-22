import { Request, Response } from "express";
import { randomUUID, UUID } from "node:crypto";
import { createReadStream, promises as fs } from "node:fs";
import { Service } from "../service/service";
import { PlaybackInterface } from "../repository/playback";
import { StorageInterface } from "../repository/storage";

export class MediaController {
    constructor(
        private readonly service: Service,
        private readonly storage: StorageInterface,
        private readonly playback: PlaybackInterface
    ) {}

    public uploadAudio = async (req: Request, res: Response) => {
        type UploadedFile = {
            path: string;
            filename?: string;
            mimetype?: string;
            originalname?: string;
        };
        const file = (req as Request & { file?: UploadedFile }).file;
        if (!file) {
            return res.status(400).json({ error: "Файл не найден" });
        }

        const bucket = (req.body?.bucket as string | undefined) || process.env.S3Bucket || "media";
        const key = file.filename || `${randomUUID()}`;

        try {
            const stream = createReadStream(file.path);
            await this.storage.put(bucket, key, stream, file.mimetype || "application/octet-stream");

            return res.status(201).json({
                bucket,
                key,
                mimeType: file.mimetype || "application/octet-stream",
                originalName: file.originalname
            });
        } catch (error) {
            return res.status(500).json({ error: "Ошибка загрузки файла" });
        } finally {
            try {
                await fs.unlink(file.path);
            } catch {
                // ignore cleanup errors
            }
        }
    };

    public deleteAudio = async (req: Request, res: Response) => {
        try {
            const itemId = req.params.id as UUID;
            const mediaItem = await this.service.getMediaItemById(itemId);

            await this.storage.delete(mediaItem.bucket, mediaItem.key);
            res.status(204).send();
        } catch (error) {
            res.status(404).json({ error: "Аудио не найдено" });
        }
    };

    public playAudio = async (req: Request, res: Response) => {
        try {
            const itemId = req.params.id as UUID;
            const mediaItem = await this.service.getMediaItemById(itemId);

            const stream = await this.storage.get(mediaItem.bucket, mediaItem.key);
            await this.playback.setCurrent(stream);
            res.status(200).json({ message: "Воспроизведение начато" });
        } catch (error) {
            res.status(404).json({ error: "Аудио не найдено" });
        }
    };

    public toggleLoop = async (_req: Request, res: Response) => {
        try {
            await this.service.toggleLoop();
            res.status(200).json({ message: "Loop переключен" });
        } catch (error) {
            res.status(500).json({ error: "Не удалось переключить loop" });
        }
    };

    public togglePlayback = async (_req: Request, res: Response) => {
        try {
            await this.service.togglePlayback();
            res.status(200).json({ message: "Playback переключен" });
        } catch (error) {
            res.status(500).json({ error: "Не удалось переключить playback" });
        }
    };

    public runPlaylist = async (req: Request, res: Response) => {
        try {
            const playlistId = req.params.id as UUID;
            const shuffle = Boolean(req.body?.shuffle);

            await this.service.runPlaylist(playlistId, shuffle);
            res.status(200).json({ message: "Плейлист запущен" });
        } catch (error) {
            res.status(400).json({ error: "Не удалось запустить плейлист" });
        }
    };

    public createPlaylist = async (req: Request, res: Response) => {
        try {
            const name = String(req.body?.name || "");
            const playlist = await this.service.createPlaylist({
                id: randomUUID() as UUID,
                name
            });
            res.status(201).json(playlist);
        } catch (error) {
            res.status(400).json({ error: "Не удалось создать плейлист" });
        }
    };

    public addItemToPlaylist = async (req: Request, res: Response) => {
        try {
            const playlistId = req.params.id as UUID;
            const mediaItemId = req.body?.mediaItemId as UUID;
            await this.service.addItemToPlaylist(playlistId, mediaItemId);
            res.status(200).json({ message: "Трек добавлен" });
        } catch (error) {
            res.status(400).json({ error: "Не удалось добавить трек" });
        }
    };

    public moveItemBefore = async (req: Request, res: Response) => {
        try {
            const playlistId = req.params.id as UUID;
            const itemIndex = Number(req.body?.itemIndex);
            const beforeIndex = Number(req.body?.beforeIndex);

            await this.service.moveItemBefore(playlistId, itemIndex, beforeIndex);
            res.status(200).json({ message: "Трек перемещен" });
        } catch (error) {
            res.status(400).json({ error: "Не удалось переместить трек" });
        }
    };

    public removeFromPlaylist = async (req: Request, res: Response) => {
        try {
            const playlistId = req.params.id as UUID;
            const itemId = req.params.itemId as UUID;

            const item = await this.service.removeFromPlaylist(playlistId, itemId);
            res.status(200).json(item);
        } catch (error) {
            res.status(400).json({ error: "Не удалось удалить трек" });
        }
    };
}
