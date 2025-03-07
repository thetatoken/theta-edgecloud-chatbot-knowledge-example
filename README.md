# Yosemite Activities Chatbot Knowledge Example

This is a simple example project that demonstrates how to fetch Yosemite National Park activities from the National Park Service API and add them to ThetaEdgeCloud for use in a chatbot knowledge base. The data is automatically updated every 10 minutes.

## Before you start

1. Create a NPS API key here https://www.nps.gov/subjects/developer/get-started.htm
2. Create a Theta Edge Cloud API Key by going to [this link](https://www.thetaedgecloud.com/dashboard/settings/projects), select your project and click on "Create API Key"

## Setup

1. Clone this repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file with your API keys:
   ```
   NPS_API_KEY=your_nps_api_key_here
   
   # ThetaEdgeCloud configuration
   TEC_API_KEY=your_tec_api_key_here
   CHATBOT_ID=your_chatbot_id_here
   PROJECT_ID=your_project_id_here
   ```

## Usage

To start the crawler that fetches and updates activities data every 10 minutes:

```
npm start
```

This will:
1. Fetch activities data from the NPS API for Yosemite National Park
2. Process the data to extract relevant information
3. Convert the data to CSV format
4. Generate SQL schema metadata for the data
5. Upload the data to ThetaEdgeCloud as a document
6. Store the document ID in memory for future updates
7. Automatically update the data every 10 minutes

You can also run a single fetch and update operation:

```
npm run fetch
```

## How It Works

1. The crawler fetches activities data from the National Park Service API
2. The data is processed to extract relevant information
3. The processed data is converted to CSV format
4. SQL schema metadata is generated for the data
5. The CSV data is uploaded to ThetaEdgeCloud with the metadata
8. The process repeats automatically every 10 minutes

NB: You can also send a plain text file to Theta Edge Cloud. If you do so, add a description field to the metadata object.


## Data and Metadata

The project uploads two types of information to ThetaEdgeCloud:

1. **CSV Data**: Contains information about Yosemite activities including:
   - Activity title and description
   - Activity type (hiking, camping, etc.)
   - Location within Yosemite
   - Seasonal availability
   - Reservation requirements
   - Pet permissions

2. **SQL Schema Metadata**: Provides structure for the data:
   - `query_type`: Indicates this is SQL-queryable data
   - `sql_schema`: Defines the table structure with column names and types
   - `sql_description`: Provides a description of the data


### Available API Functions

The project includes the following ThetaEdgeCloud API functions:

- `createDocument`: Creates a new document in ThetaEdgeCloud
- `updateDocument`: Updates an existing document in ThetaEdgeCloud
- `fetchDocument`: Fetches a document from ThetaEdgeCloud
- `fetchDocumentsList`: Fetches a list of documents from ThetaEdgeCloud
