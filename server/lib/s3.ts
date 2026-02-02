import { S3Client } from "@aws-sdk/client-s3";

export const s3Client = new S3Client({
    region: process.env.S3_REGION || "auto",
    endpoint: process.env.S3_ENDPOINT,
    credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY!,
        secretAccessKey: process.env.S3_SECRET_KEY!,
    },
    forcePathStyle: true, // Necessário para alguns providers como R2 ou Minio
});

export const BUCKET_NAME = process.env.S3_BUCKET_NAME!;
export const PUBLIC_URL = process.env.S3_PUBLIC_URL; // Ex: https://xxx.r2.dev or CDN
