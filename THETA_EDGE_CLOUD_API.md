# ThetaEdgeCloud API Specifications

This document provides specifications for the ThetaEdgeCloud API used in the Yosemite Activities Chatbot Knowledge Example project. The API allows you to manage documents in the ThetaEdgeCloud knowledge base.

## Base URL

```
https://api.thetaedgecloud.com
```

## Authentication

All API requests require authentication using an API key. The API key should be included in the request headers as `x-api-key`.

```
x-api-key: your_tec_api_key_here
```

## Configuration

The following environment variables are required for API configuration:

```
EDGE_CLOUD_CONTROLLER_HOST=https://api.thetaedgecloud.com
TEC_API_KEY=your_tec_api_key_here
CHATBOT_ID=your_chatbot_id_here
PROJECT_ID=your_project_id_here
```

## API Endpoints

### Create Document

Creates a new document in ThetaEdgeCloud.

- **URL**: `/chatbot/{chatbotId}/document`
- **Method**: `POST`
- **Headers**:
  - `x-api-key`: Your ThetaEdgeCloud API key
  - `Content-Type`: `multipart/form-data`
- **Request Body**:
  - `file`: The file content (CSV, JSON, etc.)
  - `project_id`: The project ID
  - `metadata`: JSON string containing metadata about the document

**Example Request**:

```javascript
const formData = new FormData();

// Add file to form data
formData.append('file', Buffer.from(csvContent), {
  filename: 'yosemite-activities.csv',
  contentType: 'text/csv'
});

// Add project ID
formData.append('project_id', PROJECT_ID);

// Add metadata
formData.append('metadata', JSON.stringify({
  query_type: "sql",
  sql_schema: {
    table_name: "yosemite_activities",
    columns: [
      { name: "id", type: "TEXT" },
      { name: "title", type: "TEXT" },
      // Additional columns...
    ]
  },
  sql_description: "Yosemite National Park activities."
}));

const response = await axios.post(
  `${EDGE_CLOUD_CONTROLLER_HOST}/chatbot/${CHATBOT_ID}/document`,
  formData,
  {
    headers: {
      ...formData.getHeaders(),
      'x-api-key': TEC_API_KEY
    }
  }
);
```

**Response**:

```json
{
  "body": {
    "id": "document_id_here"
  }
}
```

### Update Document

Updates an existing document in ThetaEdgeCloud.

- **URL**: `/chatbot/{chatbotId}/document/{documentId}`
- **Method**: `PUT`
- **Headers**:
  - `x-api-key`: Your ThetaEdgeCloud API key
  - `Content-Type`: `multipart/form-data`
- **Request Body**:
  - `file`: The updated file content
  - `project_id`: The project ID
  - `metadata`: JSON string containing metadata about the document

**Example Request**:

```javascript
const formData = new FormData();

// Add file to form data
formData.append('file', Buffer.from(csvContent), {
  filename: 'yosemite-activities.csv',
  contentType: 'text/csv'
});

// Add project ID
formData.append('project_id', PROJECT_ID);

// Add metadata
formData.append('metadata', JSON.stringify({
  query_type: "sql",
  sql_schema: {
    table_name: "yosemite_activities",
    columns: [
      { name: "id", type: "TEXT" },
      { name: "title", type: "TEXT" },
      // Additional columns...
    ]
  },
  sql_description: "Yosemite National Park activities."
}));

const response = await axios.put(
  `${EDGE_CLOUD_CONTROLLER_HOST}/chatbot/${CHATBOT_ID}/document/${documentId}`,
  formData,
  {
    headers: {
      ...formData.getHeaders(),
      'x-api-key': TEC_API_KEY
    }
  }
);
```

**Response**:

```json
{
  "body": {
    "id": "document_id_here"
  }
}
```

### Fetch Document

Fetches a document from ThetaEdgeCloud.

- **URL**: `/chatbot/{chatbotId}/document/{documentId}`
- **Method**: `GET`
- **Headers**:
  - `x-api-key`: Your ThetaEdgeCloud API key

**Example Request**:

```javascript
const response = await axios.get(
  `${EDGE_CLOUD_CONTROLLER_HOST}/chatbot/${CHATBOT_ID}/document/${documentId}`,
  {
    headers: {
      'x-api-key': TEC_API_KEY
    }
  }
);
```

**Response**:

```json
{
  "body": {
    "id": "document_id_here",
    "content": "...",
    "metadata": {
      "query_type": "sql",
      "sql_schema": {
        "table_name": "yosemite_activities",
        "columns": [
          { "name": "id", "type": "TEXT" },
          { "name": "title", "type": "TEXT" },
          // Additional columns...
        ]
      },
      "sql_description": "Yosemite National Park activities."
    }
  }
}
```

### List Documents

Fetches a list of documents from ThetaEdgeCloud.

- **URL**: `/chatbot/{chatbotId}/document/list`
- **Method**: `GET`
- **Headers**:
  - `x-api-key`: Your ThetaEdgeCloud API key
- **Query Parameters**:
  - `project_id`: The project ID
  - `page`: Page number (default: 0)
  - `number`: Number of documents per page (default: 30)

**Example Request**:

```javascript
const response = await axios.get(
  `${EDGE_CLOUD_CONTROLLER_HOST}/chatbot/${CHATBOT_ID}/document/list`,
  {
    params: {
      project_id: PROJECT_ID,
      page: 0,
      number: 30
    },
    headers: {
      'x-api-key': TEC_API_KEY
    }
  }
);
```

**Response**:

```json
{
  "body": [
    {
      "id": "document_id_1",
      "filename": "yosemite-activities.csv",
      "metadata": {
        "query_type": "sql",
        "sql_schema": {
          "table_name": "yosemite_activities",
          "columns": [
            { "name": "id", "type": "TEXT" },
            { "name": "title", "type": "TEXT" },
            // Additional columns...
          ]
        },
        "sql_description": "Yosemite National Park activities."
      }
    },
    // Additional documents...
  ]
}
```

## Metadata Structure

The metadata for documents should include the following fields for SQL-queryable data:

```json
{
  "query_type": "sql",
  "sql_schema": {
    "table_name": "table_name_here",
    "columns": [
      { "name": "column_name", "type": "TEXT" },
      // Additional columns...
    ]
  },
  "sql_description": "Description of the data."
}
```

### SQL Schema

The SQL schema defines the structure of the data for SQL queries:

- `table_name`: The name of the table
- `columns`: An array of column definitions
  - `name`: The name of the column
  - `type`: The data type of the column (e.g., TEXT, INTEGER, etc.)

### SQL Description

The SQL description provides context about the data for the chatbot. It should include:

- A brief description of the data
- Any relevant information about how to interpret the data

## Error Handling

The API may return the following error responses:

- **400 Bad Request**: The request was malformed or missing required parameters
- **401 Unauthorized**: Invalid or missing API key
- **404 Not Found**: The requested resource was not found
- **500 Internal Server Error**: An error occurred on the server

Error responses will include an error message in the response body:

```json
{
  "error": "Error message here"
}
```

## Rate Limiting

The API may implement rate limiting to prevent abuse. If you exceed the rate limit, you will receive a 429 Too Many Requests response. The response will include a Retry-After header indicating how long to wait before making another request.

## Best Practices

1. **Store Document IDs**: Store document IDs for future updates to avoid creating duplicate documents
2. **Batch Updates**: Limit the frequency of updates to avoid rate limiting
3. **Error Handling**: Implement proper error handling to handle API failures gracefully
4. **Metadata**: Provide accurate and complete metadata to ensure the chatbot can effectively use the data 