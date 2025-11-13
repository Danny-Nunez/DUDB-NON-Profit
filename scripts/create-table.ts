import { DynamoDBClient, CreateTableCommand, DescribeTableCommand } from '@aws-sdk/client-dynamodb';
import { config as loadEnv } from 'dotenv';
import { existsSync } from 'fs';
import path from 'path';

const root = process.cwd();
const envFiles = ['.env.local', '.env'];
for (const file of envFiles) {
  const envPath = path.join(root, file);
  if (existsSync(envPath)) {
    loadEnv({ path: envPath });
    break;
  }
}

const tableName = process.env.DYNAMODB_TABLE_NAME ?? 'dominicanos_unidos_content';
const region = process.env.AWS_REGION ?? 'us-east-1';

const accessKeyId = process.env.AWS_ACCESS_KEY_ID ?? process.env.AWS_ACCESS_KEY ?? '';
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY ?? process.env.AWS_SECRET_KEY ?? '';

if (!accessKeyId || !secretAccessKey) {
  console.error('Missing AWS credentials. Set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY.');
  process.exit(1);
}

const client = new DynamoDBClient({
  region,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
});

async function createTable() {
  try {
    await client.send(
      new DescribeTableCommand({
        TableName: tableName,
      }),
    );
    console.log(`Table "${tableName}" already exists.`);
    return;
  } catch (error: unknown) {
    const err = error as { name?: string };
    if (err.name !== 'ResourceNotFoundException') {
      console.error('Unexpected error inspecting table:', error);
      process.exit(1);
    }
  }

  console.log(`Creating DynamoDB table "${tableName}" in region "${region}"...`);

  try {
    await client.send(
      new CreateTableCommand({
        TableName: tableName,
        AttributeDefinitions: [
          { AttributeName: 'PK', AttributeType: 'S' },
          { AttributeName: 'SK', AttributeType: 'S' },
        ],
        KeySchema: [
          { AttributeName: 'PK', KeyType: 'HASH' },
          { AttributeName: 'SK', KeyType: 'RANGE' },
        ],
        BillingMode: 'PAY_PER_REQUEST',
      }),
    );
    console.log('Table creation initiated. It may take a moment to become active.');
  } catch (error) {
    console.error('Failed to create table:', error);
    process.exit(1);
  }
}

createTable().catch((error) => {
  console.error('Unhandled error:', error);
  process.exit(1);
});

