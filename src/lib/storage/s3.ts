import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { SIGNED_PDF_URL_TTL_SECONDS } from "@/lib/constants/auth";
import { env } from "@/lib/env";

const s3Client = new S3Client({
  endpoint: env.S3_ENDPOINT,
  region: "auto",
  forcePathStyle: true,
  credentials: {
    accessKeyId: env.S3_ACCESS_KEY,
    secretAccessKey: env.S3_SECRET_KEY,
  },
});

/** Uploads a generated PDF to the exports bucket under the given key. */
export async function uploadPdf(key: string, body: Buffer): Promise<void> {
  await s3Client.send(
    new PutObjectCommand({
      Bucket: env.S3_BUCKET,
      Key: key,
      Body: body,
      ContentType: "application/pdf",
    }),
  );
}

/** Returns a signed download URL for a stored PDF, valid for 15 minutes. */
export async function getSignedPdfUrl(key: string): Promise<string> {
  return getSignedUrl(s3Client, new GetObjectCommand({ Bucket: env.S3_BUCKET, Key: key }), {
    expiresIn: SIGNED_PDF_URL_TTL_SECONDS,
  });
}
