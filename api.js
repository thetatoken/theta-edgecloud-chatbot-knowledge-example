const axios = require('axios');
const { EdgeCloudControllerHost, getProjectId, getTecApiKey, getChatbotId } = require('./constants');
const { generateFileSignature } = require('./utils/file');
const { getFileDbMetadataFromFilename, saveFileDbMetadata } = require('./db/file-metadata');

async function processNewFile(content, filename, description, dataId, clientId) {
    const fileContent = typeof content === 'string' ? content : content.data;
    const metadata = typeof content === 'object' ? content.metadata : (description ? { description } : null);

    if (!fileContent || (typeof fileContent === 'string' && !fileContent.trim())) {
        console.error(`[${clientId}][${dataId}] Error: Empty file content for ${filename}`);
        return;
    }

    try {
        const fileDbMetadata = await getFileDbMetadataFromFilename(filename, clientId);
        const newSignature = generateFileSignature(fileContent);

        if (fileDbMetadata) {
            const { fileId, signature, last_updated } = fileDbMetadata;

            console.log(`[${clientId}][${dataId}] File last updated: ${new Date(last_updated).toLocaleString()}`);

            if (signature !== newSignature) {
                await replaceFileInEdgeCloud(fileId, fileContent, filename, clientId, metadata);
                await saveFileDbMetadata(filename, fileId, newSignature, Date.now(), clientId);
                console.log(`[${clientId}][${dataId}] File replaced: ${filename} with id ${fileId} (signature changed)`);
            } else {
                console.log(`[${clientId}][${dataId}] File ${filename} unchanged (same signature)`);
            }
        } else {
            const fileId = await uploadFileToEdgeCloud(fileContent, filename, clientId, metadata);
            if (!fileId) {
                return;
            }
            await saveFileDbMetadata(filename, fileId, newSignature, Date.now(), clientId);
            console.log(`[${clientId}][${dataId}] File uploaded`);
        }
    } catch (error) {
        console.error(`Error - [${clientId}][${dataId}] Error processing file`, error.message);
        throw error;
    } finally {
        await new Promise(resolve => setTimeout(resolve, 500));
    }
}

async function uploadFileToEdgeCloud(fileContent, filename, clientId, metadata) {
    const formData = buildPayload(fileContent, filename, clientId, metadata);

    try {
        const response = await axios.post(
            `${EdgeCloudControllerHost}/chatbot/${getChatbotId(clientId)}/document`,
            formData,
            {
                headers: {
                    'x-api-key': getTecApiKey(clientId),
                    'Content-Type': 'multipart/form-data'
                }
            }
        );
        return response?.data?.body?.id;
    } catch (error) {
        console.error(`Error - [${clientId}][${filename}] Error uploading file to EdgeCloud:`, error.message);
        console.error(error.stack);
    }
}

async function replaceFileInEdgeCloud(fileId, fileContent, filename, clientId, metadata = null) {
    const formData = buildPayload(fileContent, filename, clientId, metadata);
    const tecApiKey = getTecApiKey(clientId);
    const chatbotId = getChatbotId(clientId);

    try {
        const response = await axios.put(`${EdgeCloudControllerHost}/chatbot/${chatbotId}/document/${fileId}`, formData, {
            headers: {
                'x-api-key': tecApiKey,
                'Content-Type': 'multipart/form-data'
            }
        });
        return response?.body?.id;
    } catch (error) {
        if (error.response.status === 404) {
            console.log(`[${clientId}][${filename}] File doesn't exists, uploading...`);
            const uploadResponse = await uploadFileToEdgeCloud(fileContent, filename, clientId, metadata);
            return uploadResponse;
        } else {
            console.error(`Error - [${clientId}][${filename}] Error replacing file in EdgeCloud:`, error.message);
            console.error(error.response.data);
        }
    }
}

async function fetchEdgeCloudDocument(docId, clientId) {
    try {
        const response = await axios.get(`${EdgeCloudControllerHost}/chatbot/${getChatbotId(clientId)}/document/${docId}?project_id=${getProjectId(clientId)}`, 
        {
            headers: {
                'x-api-key': getTecApiKey(clientId),
                'Content-Type': 'application/json'
            }
        });
        return response.data.body;
    } catch (error) {
        console.error(`Error - [${clientId}] Error fetching EdgeCloud document:`, error.message);
    }
}

async function updateTecWarmupMessages(messages, clientId) {
    try {
        const chatbotResponse = await axios.get(
            `${EdgeCloudControllerHost}/chatbot/${getChatbotId(clientId)}?project_id=${getProjectId(clientId)}`, 
            {
                headers: {
                    'x-api-key': getTecApiKey(clientId),
                    'Content-Type': 'application/json'
                }
            }
        );

        let warmupMessages = chatbotResponse.data.body.warm_up_messages ?? [];

        // Process each message pair
        for (let i = 0; i < messages.length; i += 2) {
            const userMessage = messages[i];
            const assistantMessage = messages[i + 1];

            // Find existing message pair or add new ones
            const existingIndex = warmupMessages.findIndex((msg, index) =>
                msg.role === 'user' &&
                msg.content === userMessage.content &&
                index < warmupMessages.length - 1
            );

            if (existingIndex !== -1) {
                // Replace existing assistant message
                warmupMessages[existingIndex + 1] = assistantMessage;
            } else {
                // Add new message pair
                warmupMessages.push(userMessage, assistantMessage);
            }
        }

        const body = {
            project_id: chatbotResponse.data.body.project_id,
            warm_up_messages: warmupMessages,
        };

        await axios.put(`${EdgeCloudControllerHost}/chatbot/${getChatbotId(clientId)}`, body, {
            headers: {
                'x-api-key': getTecApiKey(clientId),
                'Content-Type': 'application/json'
            }
        });

        console.log(`[${clientId}] TEC chatbot warmup messages updated successfully`);
    } catch (error) {
        console.error(`Error - [${clientId}] Error updating TEC warmup messages:`, error.message);
        console.error(error.stack);
    }
}

async function saveToClientDirectory(content, filename, clientId = 'vgk') {
    const fs = require('fs').promises;
    const path = require('path');
    const dir = path.join('data', clientId);

    try {
        await fs.mkdir(dir, { recursive: true });

        let contentToWrite;
        if (typeof content === 'object') {
            // If the file is a CSV (check filename extension)
            if (filename.toLowerCase().endsWith('.csv')) {
                // Convert array of objects to CSV string
                const headers = Object.keys(content[0]);
                const csvRows = content.map(row =>
                    headers.map(header => row[header]).join(',')
                );
                contentToWrite = [headers.join(','), ...csvRows].join('\n');
            } else {
                // For JSON and other formats
                contentToWrite = JSON.stringify(content, null, 2);
            }
        } else {
            contentToWrite = content;
        }

        await fs.writeFile(path.join(dir, filename), contentToWrite, 'utf8');
        console.log(`[${clientId}] File created successfully: ${filename}`);
    } catch (err) {
        console.error(`[${clientId}] Error creating file ${filename}:`, err);
        throw err;
    }
}

function buildPayload(fileContent, filename, clientId, metadata) {
    const file = new File([fileContent], filename, { type: 'application/json' });
    const formData = new FormData();
    formData.append('file', file);
    formData.append('project_id', getProjectId(clientId));

    formData.append('metadata', JSON.stringify({
        type: 'file',
        filename: filename,
        ...metadata
    }));

    return formData;
}


module.exports = {
    uploadArticleToEdgeCloud: uploadFileToEdgeCloud,
    processNewFile,
    replaceFileInEdgeCloud,
    updateTecWarmupMessages,
    saveToClientDirectory,
    fetchEdgeCloudDocument
};