import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { MediaItem } from "./mediaItems";
import { ReadStream } from "node:fs";
import { Readable } from "node:stream";
import { QueryResultRow, QueryResult } from "pg";

type QueryFunction = <T extends QueryResultRow = any>(
    text: string, 
    params?: any[]
) => Promise<QueryResult<T>>;

export interface StorageInterface {
    get(bucket: string, key: string): Promise<Readable>;
    put(bucket: string, key: string, body: ReadStream, contentType: string): Promise<void>;
    delete(bucket: string, key: string): Promise<void>;
}

export class StorageRepository implements StorageInterface {
    private readonly s3: S3Client;
    private readonly query: QueryFunction;

    constructor(s3: S3Client, query: QueryFunction) {
        this.s3 = s3;
        this.query = query;
    }

    async get(bucket: string, key: string): Promise<Readable> {
        const response = await this.s3.send(
            new GetObjectCommand({
                Bucket: bucket,
                Key: key
            })
        )

        const stream = response.Body as Readable;
        if (!stream) {
            throw new Error("file not found");
        }

        return stream;
    }

    async put(bucket: string, key: string, body: ReadStream, contentType: string): Promise<void> {
        await this.s3.send(
            new PutObjectCommand({
                Bucket: bucket,
                Key: key,
                Body: body,
                ContentType: contentType,
            })
        );

        const sql = `
            INSERT INTO media_items(bucket, key, mime_type)
            VALUES($1, $2, $3)
        `;
        await this.query(sql, [bucket, key, contentType]);
    }

    async delete(bucket: string, key: string): Promise<void> {
        await this.s3.send(
            new DeleteObjectCommand({
                Bucket: bucket,
                Key: key,
            })
        )

        const sql = `
            DELETE FROM media_items
            WHERE bucket = $1 AND key = $2
        `
        await this.query(sql, [bucket, key])
    }
}
