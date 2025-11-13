import { DeleteCommand, GetCommand, PutCommand, QueryCommand, UpdateCommand, } from '@aws-sdk/lib-dynamodb';
import crypto from 'crypto';
import { docClient, CONTENT_TABLE_NAME } from './dynamo';
const EVENT_PK = 'EVENT';
export function normalizeEventFolder(folder) {
    return folder.trim().replace(/^events\//i, '').replace(/^\//, '').replace(/\/+$/u, '');
}
export async function listEventMetadata() {
    const command = new QueryCommand({
        TableName: CONTENT_TABLE_NAME,
        KeyConditionExpression: 'PK = :pk',
        ExpressionAttributeValues: {
            ':pk': EVENT_PK,
        },
        ScanIndexForward: false,
    });
    const result = await docClient.send(command);
    return (result.Items?.map((item) => ({
        id: item.SK.replace('EVENT#', ''),
        folder: normalizeEventFolder(item.folder ?? ''),
        content: item.content ?? {},
        createdAt: item.createdAt ?? '',
        updatedAt: item.updatedAt ?? '',
    })) ?? []);
}
export async function getEventMetadata(id) {
    const command = new GetCommand({
        TableName: CONTENT_TABLE_NAME,
        Key: {
            PK: EVENT_PK,
            SK: `EVENT#${id}`,
        },
    });
    const result = await docClient.send(command);
    if (!result.Item) {
        return null;
    }
    return {
        id,
        folder: normalizeEventFolder(result.Item.folder ?? ''),
        content: result.Item.content ?? {},
        createdAt: result.Item.createdAt ?? '',
        updatedAt: result.Item.updatedAt ?? '',
    };
}
export async function createEvent(payload) {
    const id = crypto.randomUUID();
    const timestamp = new Date().toISOString();
    const folder = normalizeEventFolder(payload.folder);
    await docClient.send(new PutCommand({
        TableName: CONTENT_TABLE_NAME,
        Item: {
            PK: EVENT_PK,
            SK: `EVENT#${id}`,
            folder,
            content: payload.content,
            createdAt: timestamp,
            updatedAt: timestamp,
        },
        ConditionExpression: 'attribute_not_exists(PK) AND attribute_not_exists(SK)',
    }));
    return {
        id,
        folder,
        content: payload.content,
        createdAt: timestamp,
        updatedAt: timestamp,
    };
}
export async function updateEvent(id, payload) {
    const updates = [];
    const expressionAttributeValues = {
        ':updatedAt': new Date().toISOString(),
    };
    const expressionAttributeNames = {};
    if (payload.folder !== undefined) {
        updates.push('folder = :folder');
        expressionAttributeValues[':folder'] = normalizeEventFolder(payload.folder);
    }
    if (payload.content !== undefined) {
        updates.push('#content = :content');
        expressionAttributeValues[':content'] = payload.content;
        expressionAttributeNames['#content'] = 'content';
    }
    if (updates.length === 0) {
        throw new Error('No fields provided to update.');
    }
    const command = new UpdateCommand({
        TableName: CONTENT_TABLE_NAME,
        Key: {
            PK: EVENT_PK,
            SK: `EVENT#${id}`,
        },
        UpdateExpression: `SET ${updates.join(', ')}, updatedAt = :updatedAt`,
        ExpressionAttributeNames: Object.keys(expressionAttributeNames).length > 0 ? expressionAttributeNames : undefined,
        ExpressionAttributeValues: expressionAttributeValues,
        ReturnValues: 'ALL_NEW',
    });
    const result = await docClient.send(command);
    if (!result.Attributes) {
        throw new Error('Event not found.');
    }
    return {
        id,
        folder: normalizeEventFolder(result.Attributes.folder ?? ''),
        content: result.Attributes.content ?? {},
        createdAt: result.Attributes.createdAt ?? '',
        updatedAt: result.Attributes.updatedAt ?? '',
    };
}
export async function deleteEvent(id) {
    await docClient.send(new DeleteCommand({
        TableName: CONTENT_TABLE_NAME,
        Key: {
            PK: EVENT_PK,
            SK: `EVENT#${id}`,
        },
    }));
}
