import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
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

const region = process.env.AWS_REGION ?? 'us-east-1';
const accessKeyId = process.env.AWS_ACCESS_KEY_ID ?? process.env.AWS_ACCESS_KEY ?? '';
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY ?? process.env.AWS_SECRET_KEY ?? '';

if (!accessKeyId || !secretAccessKey) {
  // eslint-disable-next-line no-console
  console.warn('AWS credentials were not found in the environment when configuring DynamoDB.');
}

const client = new DynamoDBClient({
  region,
  credentials: accessKeyId && secretAccessKey ? { accessKeyId, secretAccessKey } : undefined,
});

export const docClient = DynamoDBDocumentClient.from(client, {
  marshallOptions: {
    removeUndefinedValues: true,
  },
});

export const CONTENT_TABLE_NAME = process.env.DYNAMODB_TABLE_NAME ?? 'dominicanos_unidos_content';

