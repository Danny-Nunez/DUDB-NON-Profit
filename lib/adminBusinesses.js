import { QueryCommand, PutCommand, DeleteCommand, UpdateCommand, } from '@aws-sdk/lib-dynamodb';
import crypto from 'crypto';
import { docClient, CONTENT_TABLE_NAME } from './dynamo.js';
const BUSINESS_PK = 'BUSINESS';
export async function listBusinesses() {
    const command = new QueryCommand({
        TableName: CONTENT_TABLE_NAME,
        KeyConditionExpression: 'PK = :pk',
        ExpressionAttributeValues: {
            ':pk': BUSINESS_PK,
        },
        ScanIndexForward: true,
    });
    const result = await docClient.send(command);
    return (result.Items?.map((item) => ({
        id: item.SK.replace('BUSINESS#', ''),
        name: item.name ?? '',
        category: item.category ?? '',
        description: item.description ?? '',
        imageUrl: item.imageUrl ?? '',
        imageKey: item.imageKey ?? '',
        contact: item.contact ?? '',
        hours: item.hours ?? '',
        address: item.address ?? '',
        createdAt: item.createdAt ?? '',
    })) ?? []);
}
export async function createBusiness(payload) {
    const id = crypto.randomUUID();
    const createdAt = new Date().toISOString();
    await docClient.send(new PutCommand({
        TableName: CONTENT_TABLE_NAME,
        Item: {
            PK: BUSINESS_PK,
            SK: `BUSINESS#${id}`,
            name: payload.name,
            category: payload.category,
            description: payload.description ?? '',
            imageUrl: payload.imageUrl ?? '',
            imageKey: payload.imageKey ?? '',
            contact: payload.contact ?? '',
            hours: payload.hours ?? '',
            address: payload.address ?? '',
            createdAt,
        },
    }));
    return {
        id,
        name: payload.name,
        category: payload.category,
        description: payload.description ?? '',
        imageUrl: payload.imageUrl ?? '',
        imageKey: payload.imageKey ?? '',
        contact: payload.contact ?? '',
        hours: payload.hours ?? '',
        address: payload.address ?? '',
        createdAt,
    };
}
export async function updateBusiness(id, payload) {
    const updateExpressions = [];
    const expressionAttributeValues = {};
    const expressionAttributeNames = {};
    if (payload.name !== undefined) {
        updateExpressions.push('#name = :name');
        expressionAttributeValues[':name'] = payload.name;
        expressionAttributeNames['#name'] = 'name';
    }
    if (payload.category !== undefined) {
        updateExpressions.push('category = :category');
        expressionAttributeValues[':category'] = payload.category;
    }
    if (payload.description !== undefined) {
        updateExpressions.push('description = :description');
        expressionAttributeValues[':description'] = payload.description;
    }
    if (payload.imageUrl !== undefined) {
        updateExpressions.push('imageUrl = :imageUrl');
        expressionAttributeValues[':imageUrl'] = payload.imageUrl;
    }
    if (payload.imageKey !== undefined) {
        updateExpressions.push('imageKey = :imageKey');
        expressionAttributeValues[':imageKey'] = payload.imageKey;
    }
    if (payload.contact !== undefined) {
        updateExpressions.push('contact = :contact');
        expressionAttributeValues[':contact'] = payload.contact;
    }
    if (payload.hours !== undefined) {
        updateExpressions.push('hours = :hours');
        expressionAttributeValues[':hours'] = payload.hours;
    }
    if (payload.address !== undefined) {
        updateExpressions.push('address = :address');
        expressionAttributeValues[':address'] = payload.address;
    }
    if (updateExpressions.length === 0) {
        throw new Error('No fields provided to update.');
    }
    const command = new UpdateCommand({
        TableName: CONTENT_TABLE_NAME,
        Key: {
            PK: BUSINESS_PK,
            SK: `BUSINESS#${id}`,
        },
        UpdateExpression: `SET ${updateExpressions.join(', ')}`,
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues,
        ReturnValues: 'ALL_NEW',
    });
    const result = await docClient.send(command);
    const item = result.Attributes;
    if (!item) {
        throw new Error('Business not found.');
    }
    return {
        id,
        name: item.name ?? '',
        category: item.category ?? '',
        description: item.description ?? '',
        imageUrl: item.imageUrl ?? '',
        imageKey: item.imageKey ?? '',
        contact: item.contact ?? '',
        hours: item.hours ?? '',
        address: item.address ?? '',
        createdAt: item.createdAt ?? '',
    };
}
export async function deleteBusiness(id) {
    await docClient.send(new DeleteCommand({
        TableName: CONTENT_TABLE_NAME,
        Key: {
            PK: BUSINESS_PK,
            SK: `BUSINESS#${id}`,
        },
    }));
}
