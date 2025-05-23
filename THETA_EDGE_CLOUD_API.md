# ThetaEdgeCloud RAG Chatbot API Specifications

This document provides specifications for the ThetaEdgeCloud API used in the Yosemite Activities Chatbot Knowledge Example project. The API allows you to manage documents in the ThetaEdgeCloud knowledge base.

## Base URL

```
https://controller.thetaedgecloud.com
```

## Authentication

All API requests require authentication using an API key. The API key should be included in the request headers as `x-api-key`.

```
x-api-key: your_tec_api_key_here
```

## Configuration

The following environment variables are required for API configuration:

```
EDGE_CLOUD_CONTROLLER_HOST=https://controller.thetaedgecloud.com
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
  - `file`: The file content (CSV, etc.)
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
  `https://controller.thetaedgecloud.com/chatbot/${CHATBOT_ID}/document`,
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
  `https://controller.thetaedgecloud.com/chatbot/${CHATBOT_ID}/document/${documentId}`,
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
  `https://controller.thetaedgecloud.com/chatbot/${CHATBOT_ID}/document/${documentId}`,
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
  `https://controller.thetaedgecloud.com/chatbot/${CHATBOT_ID}/document/list`,
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
  "status": "success",
  "body": {
    "documents": [
      {
        "id": "document_id_here",
        "knowledge_base_id": "knowledge_base_id_here",
        "metadata": {
          "type": "file",
          "filename": "filename.csv",
          "query_type": "sql",
          "sql_schema": {
            "table_name": "table_name",
            "columns": [
              { "name": "column1", "type": "TEXT" },
              { "name": "column2", "type": "TEXT" }
              // Additional columns...
            ]
          },
          "sql_description": "Description of the data."
        },
        "created_at": "2023-01-01T00:00:00.000000Z",
        "embedding_token_count": 0
      }
      // Additional documents...
    ],
    "total_documents": 1,
    "total_pages": 1
  }
}
```

### Fetch Chatbot Details

Retrieves detailed information about a specific chatbot.

- **URL**: `/chatbot/{chatbotId}`
- **Method**: `GET`
- **Headers**:
  - `x-api-key`: Your ThetaEdgeCloud API key
- **Query Parameters**:
  - `project_id`: The project ID

**Example Request**:

```javascript
const response = await axios.get(
  `https://controller.thetaedgecloud.com/chatbot/${CHATBOT_ID}`,
  {
    params: {
      project_id: PROJECT_ID
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
  "id": "chatbot_id_here",
  "name": "Chatbot Name",
  "project_id": "project_id_here",
  "llm_endpoint": "https://llm-endpoint-url.thetaedgecloud.com/v1",
  "knowledge_base_id": "knowledge_base_id_here",
  "created_at": "2023-01-01T00:00:00.000000Z",
  "model": "model_name_here",
  "max_tokens": 2000,
  "temperature": 0.5,
  "system_prompt": "System prompt that defines the chatbot's personality and behavior",
  "context_window": null,
  "settings": {
    "agent.tools": {
      "web_search": false,
      "text_to_sql": true
    },
    "retriever.type": "rerank"
  },
  "warm_up_messages": [],
  "llm_endpoints": [
    {
      "id": "llm_endpoint_id_here",
      "name": "LLM Endpoint Name",
      "rank": 5
    }
    // Additional LLM endpoints...
  ]
}
```

### Update Chatbot

Updates an existing chatbot's configuration.

- **URL**: `/chatbot/{chatbotId}`
- **Method**: `PUT`
- **Headers**:
  - `x-api-key`: Your ThetaEdgeCloud API key
  - `Content-Type`: `application/json`
- **Request Body**:
  - `name`: Name of the chatbot
  - `project_id`: The project ID
  - `max_tokens`: Maximum number of tokens for LLM responses
  - `temperature`: Temperature setting for LLM (controls randomness)
  - `system_prompt`: System prompt that defines the chatbot's personality
  - `warm_up_messages`: Array of initial messages to prime the chatbot
  - `llm_endpoint_id`: ID of the LLM endpoint to use
  - `settings`: Object containing chatbot settings
    - `retriever.type`: Type of retriever to use (e.g., "rerank")
    - `agent.tools`: Object specifying which tools are enabled
      - `web_search`: Boolean indicating if web search is enabled
      - `text_to_sql`: Boolean indicating if text-to-SQL is enabled

**Example Request**:

```javascript
const response = await axios.put(
  `https://controller.thetaedgecloud.com/chatbot/${CHATBOT_ID}`,
  {
    "name": "Chatbot Name",
    "project_id": PROJECT_ID,
    "max_tokens": 2000,
    "temperature": 0.5,
    "system_prompt": "System prompt that defines the chatbot's personality and behavior",
    "warm_up_messages": [],
    "llm_endpoint_id": "llm_endpoint_id_here",
    "settings": {
      "retriever.type": "rerank",
      "agent.tools": {
        "web_search": false,
        "text_to_sql": true
      }
    }
  },
  {
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': TEC_API_KEY
    }
  }
);
```

**Response**: Same as the response for Fetch Chatbot Details.

### Create Chatbot

Creates a new chatbot.

- **URL**: `/chatbot`
- **Method**: `POST`
- **Headers**:
  - `x-api-key`: Your ThetaEdgeCloud API key
  - `Content-Type`: `application/json`
- **Request Body**:
  - `name`: Name of the chatbot
  - `project_id`: The project ID
  - `max_tokens`: Maximum number of tokens for LLM responses
  - `temperature`: Temperature setting for LLM (controls randomness)
  - `system_prompt`: System prompt that defines the chatbot's personality
  - `warm_up_messages`: Array of initial messages to prime the chatbot
  - `llm_endpoint_id`: ID of the LLM endpoint to use
  - `settings`: Object containing chatbot settings
    - `retriever.type`: Type of retriever to use (e.g., "rerank")
    - `agent.tools`: Object specifying which tools are enabled
      - `web_search`: Boolean indicating if web search is enabled
      - `text_to_sql`: Boolean indicating if text-to-SQL is enabled

**Example Request**:

```javascript
const response = await axios.post(
  `https://controller.thetaedgecloud.com/chatbot`,
  {
    "name": "New Chatbot Name",
    "project_id": PROJECT_ID,
    "max_tokens": 2000,
    "temperature": 0.5,
    "system_prompt": "System prompt that defines the chatbot's personality and behavior",
    "warm_up_messages": [],
    "llm_endpoint_id": "llm_endpoint_id_here",
    "settings": {
      "retriever.type": "rerank",
      "agent.tools": {
        "web_search": false,
        "text_to_sql": true
      }
    }
  },
  {
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': TEC_API_KEY
    }
  }
);
```

**Response**: Same as the response for Fetch Chatbot Details.

## Metadata Structure

### For SQL-queryable data (CSV, etc.)

The metadata for SQL-queryable documents should include the following fields:

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

### For Plaintext files

For plaintext files, use the following metadata structure:

```json
{
  "query_type": "text",
  "description": "Detailed description of the text content."
}
```

**Example Request for Plaintext File**:

```javascript
const formData = new FormData();

// Add file to form data
formData.append('file', Buffer.from(textContent), {
  filename: 'yosemite-info.txt',
  contentType: 'text/plain'
});

// Add project ID
formData.append('project_id', PROJECT_ID);

// Add metadata
formData.append('metadata', JSON.stringify({
  query_type: "text",
  description: "General information about Yosemite National Park including visitor guidelines, operating hours, and safety information."
}));

const response = await axios.post(
  `https://controller.thetaedgecloud.com/chatbot/${CHATBOT_ID}/document`,
  formData,
  {
    headers: {
      ...formData.getHeaders(),
      'x-api-key': TEC_API_KEY
    }
  }
);
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

## Best Practices

1. **Store Document IDs**: Store document IDs for future updates to avoid creating duplicate documents
2. **File Types**: Choose the appropriate file type and metadata structure based on your data:
   - Use CSV with SQL metadata for structured data
   - Use plaintext with text metadata for unstructured content
3. **Descriptive Metadata**: For plaintext files, provide a detailed description to help the chatbot understand the content
4. **Metadata**: Provide accurate and complete metadata to ensure the chatbot can effectively use the data 
