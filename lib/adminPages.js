import { GetCommand, PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { docClient, CONTENT_TABLE_NAME } from './dynamo';
const PAGE_PK = 'PAGE';
export async function listPageSlugs() {
    const command = new QueryCommand({
        TableName: CONTENT_TABLE_NAME,
        KeyConditionExpression: 'PK = :pk',
        ExpressionAttributeValues: {
            ':pk': PAGE_PK,
        },
        ProjectionExpression: 'SK',
    });
    const result = await docClient.send(command);
    return (result.Items?.map((item) => item.SK.replace('PAGE#', ''))?.sort((a, b) => a.localeCompare(b)) ?? []);
}
export async function getPageContent(slug) {
    const command = new GetCommand({
        TableName: CONTENT_TABLE_NAME,
        Key: {
            PK: PAGE_PK,
            SK: `PAGE#${slug}`,
        },
    });
    const result = await docClient.send(command);
    if (!result.Item) {
        return null;
    }
    return {
        slug,
        content: result.Item.content ?? {},
        updatedAt: result.Item.updatedAt ?? '',
    };
}
export async function upsertPageContent(slug, content) {
    const updatedAt = new Date().toISOString();
    await docClient.send(new PutCommand({
        TableName: CONTENT_TABLE_NAME,
        Item: {
            PK: PAGE_PK,
            SK: `PAGE#${slug}`,
            content,
            updatedAt,
        },
    }));
    return {
        slug,
        content,
        updatedAt,
    };
}
