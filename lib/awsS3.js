import { CopyObjectCommand, DeleteObjectCommand, DeleteObjectsCommand, ListObjectsV2Command, S3Client, } from '@aws-sdk/client-s3';
import { config as loadEnv } from 'dotenv';
import path from 'path';
import { existsSync } from 'fs';
const root = process.cwd();
const envFiles = ['.env.local', '.env'];
for (const file of envFiles) {
    const envPath = path.join(root, file);
    if (existsSync(envPath)) {
        loadEnv({ path: envPath });
        break;
    }
}
export const S3_REGION = process.env.AWS_REGION ?? 'us-east-1';
export const S3_BUCKET = process.env.AWS_S3_BUCKET ?? 'dominicanos-unidos';
const accessKeyId = process.env.AWS_ACCESS_KEY_ID ?? process.env.AWS_ACCESS_KEY ?? '';
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY ?? process.env.AWS_SECRET_KEY ?? '';
export function getS3Client() {
    return new S3Client({
        region: S3_REGION,
        credentials: accessKeyId && secretAccessKey
            ? {
                accessKeyId,
                secretAccessKey,
            }
            : undefined,
    });
}
export async function listObjectKeys(prefix) {
    const client = getS3Client();
    const keys = [];
    let continuationToken;
    do {
        const command = new ListObjectsV2Command({
            Bucket: S3_BUCKET,
            Prefix: prefix,
            ContinuationToken: continuationToken,
        });
        const response = await client.send(command);
        const contents = response.Contents ?? [];
        for (const item of contents) {
            if (item.Key && !item.Key.endsWith('/')) {
                keys.push(item.Key);
            }
        }
        continuationToken = response.IsTruncated ? response.NextContinuationToken : undefined;
    } while (continuationToken);
    return keys;
}
export async function deleteS3Objects(keys) {
    if (keys.length === 0)
        return;
    const client = getS3Client();
    const chunkSize = 1000;
    for (let index = 0; index < keys.length; index += chunkSize) {
        const chunk = keys.slice(index, index + chunkSize);
        await client.send(new DeleteObjectsCommand({
            Bucket: S3_BUCKET,
            Delete: {
                Objects: chunk.map((Key) => ({ Key })),
                Quiet: true,
            },
        }));
    }
}
export async function copyS3Object(sourceKey, destinationKey) {
    const client = getS3Client();
    await client.send(new CopyObjectCommand({
        Bucket: S3_BUCKET,
        CopySource: `${S3_BUCKET}/${encodeURI(sourceKey)}`,
        Key: destinationKey,
    }));
}
export async function deleteS3Object(key) {
    const client = getS3Client();
    await client.send(new DeleteObjectCommand({
        Bucket: S3_BUCKET,
        Key: key,
    }));
}
export async function moveS3Prefix(oldPrefix, newPrefix) {
    if (oldPrefix === newPrefix)
        return;
    const keys = await listObjectKeys(oldPrefix);
    if (keys.length === 0)
        return;
    for (const key of keys) {
        const destinationKey = key.replace(oldPrefix, newPrefix);
        await copyS3Object(key, destinationKey);
        await deleteS3Object(key);
    }
}
export async function deleteS3Prefix(prefix) {
    const keys = await listObjectKeys(prefix);
    await deleteS3Objects(keys);
}
