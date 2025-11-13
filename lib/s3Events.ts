import { ListObjectsV2Command } from '@aws-sdk/client-s3';
import { listEventMetadata } from './adminEvents';
import { getS3Client, S3_BUCKET, S3_REGION } from './awsS3';

export interface EventAsset {
  key: string;
  url: string;
}

export interface EventFolder {
  id: string;
  folder: string;
  assets: EventAsset[];
  content?: {
    en?: {
      title?: string;
      description?: string;
      date?: string;
    };
    es?: {
      title?: string;
      description?: string;
      date?: string;
    };
  };
  createdAt?: string;
  updatedAt?: string;
}

const EVENTS_PREFIX = 'events/';

export async function listEventFolders(): Promise<EventFolder[]> {
  const client = getS3Client();

  const command = new ListObjectsV2Command({
    Bucket: S3_BUCKET,
    Prefix: EVENTS_PREFIX,
    Delimiter: '/',
  });

  const listing = await client.send(command);
  const prefixes = listing.CommonPrefixes ?? [];

  const metadata = await listEventMetadata();
  const metadataByFolder = new Map(metadata.map((item) => [item.folder, item]));

  const result: EventFolder[] = [];

  for (const prefix of prefixes) {
    const folder = prefix.Prefix ?? '';
    if (!folder || folder === EVENTS_PREFIX) {
      continue;
    }

    const childListing = await client.send(
      new ListObjectsV2Command({
        Bucket: S3_BUCKET,
        Prefix: folder,
      }),
    );

    const assets =
      childListing.Contents?.filter((item) => item.Key && !item.Key.endsWith('/')).map((item) => ({
        key: item.Key!,
        url: `https://${S3_BUCKET}.s3.${S3_REGION}.amazonaws.com/${item.Key}`,
      })) ?? [];

    const folderName = folder.replace(EVENTS_PREFIX, '').replace(/\/$/, '');
    const metadataMatch = metadataByFolder.get(folderName);

    result.push({
      id: metadataMatch?.id ?? folderName,
      folder: folderName,
      assets,
      content: metadataMatch?.content,
      createdAt: metadataMatch?.createdAt,
      updatedAt: metadataMatch?.updatedAt,
    });
  }

  // Include metadata entries that may not yet have assets
  for (const meta of metadata) {
    if (result.some((event) => event.id === meta.id)) continue;
    result.push({
      id: meta.id,
      folder: meta.folder,
      assets: [],
      content: meta.content,
      createdAt: meta.createdAt,
      updatedAt: meta.updatedAt,
    });
  }

  result.sort((a, b) => {
    const aDate = a.updatedAt ?? a.createdAt ?? '';
    const bDate = b.updatedAt ?? b.createdAt ?? '';
    return bDate.localeCompare(aDate);
  });

  return result;
}

