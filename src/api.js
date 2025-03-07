const axios = require('axios');
const FormData = require('form-data');
const { 
  NPS_API_KEY, 
  NPS_API_BASE_URL, 
  EDGE_CLOUD_CONTROLLER_HOST, 
  TEC_API_KEY, 
  CHATBOT_ID, 
  PROJECT_ID 
} = require('./constants');


/**
 * Creates a new document in ThetaEdgeCloud
 * @param {string} csvContent - The CSV content to upload
 * @param {string} filename - The name of the file
 * @param {object} metadata - Additional metadata
 * @returns {Promise<string>} - The document ID
 */
async function createDocument(csvContent, filename, metadata = null) {
  const formData = buildPayload(csvContent, filename, metadata);
  
  try {
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
    
    console.log(`Document created successfully: ${filename}`);
    return response?.data?.body?.id;
  } catch (error) {
    console.error(`Error creating document in EdgeCloud: ${error.message}`);
    throw error;
  }
}

/**
 * Updates an existing document in ThetaEdgeCloud
 * @param {string} documentId - The ID of the document to update
 * @param {string} csvContent - The CSV content
 * @param {string} filename - The name of the file
 * @param {object} metadata - Additional metadata
 * @returns {Promise<string>} - The document ID
 */
async function updateDocument(documentId, csvContent, filename, metadata = null) {
  if (!documentId) {
    throw new Error('Document ID is required for updating a document');
  }
  
  const formData = buildPayload(csvContent, filename, metadata);
  
  try {
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
    
    console.log(`Document updated successfully: ${filename} (ID: ${documentId})`);
    return response?.data?.body?.id;
  } catch (error) {
    console.error(`Error updating document in EdgeCloud: ${error.message}`);
    throw error;
  }
}

/**
 * Fetches a document from ThetaEdgeCloud
 * @param {string} documentId - The ID of the document to fetch
 * @returns {Promise<object>} - The document data
 */
async function fetchDocument(documentId) {
  if (!documentId) {
    throw new Error('Document ID is required');
  }
  
  try {
    const response = await axios.get(
      `${EDGE_CLOUD_CONTROLLER_HOST}/chatbot/${CHATBOT_ID}/document/${documentId}`,
      {
        headers: {
          'x-api-key': TEC_API_KEY
        }
      }
    );
    
    console.log(`Document fetched successfully (ID: ${documentId})`);
    return response?.data?.body;
  } catch (error) {
    console.error(`Error fetching document from EdgeCloud: ${error.message}`);
    throw error;
  }
}

/**
 * Fetches a list of documents from ThetaEdgeCloud
 * @param {number} page - The page number (default: 0)
 * @param {number} number - The number of documents per page (default: 30)
 * @returns {Promise<Array>} - The list of documents
 */
async function fetchDocumentsList(page = 0, number = 30) {
  try {
    const response = await axios.get(
      `${EDGE_CLOUD_CONTROLLER_HOST}/chatbot/${CHATBOT_ID}/document/list`,
      {
        params: {
          project_id: PROJECT_ID,
          page,
          number
        },
        headers: {
          'x-api-key': TEC_API_KEY
        }
      }
    );
    
    console.log(`Documents list fetched successfully (page: ${page}, count: ${response?.data?.body?.length || 0})`);
    return response?.data?.body;
  } catch (error) {
    console.error(`Error fetching documents list from EdgeCloud: ${error.message}`);
    throw error;
  }
}


/**
 * Builds the payload for ThetaEdgeCloud API
 * @param {string} csvContent - The CSV content to upload
 * @param {string} filename - The name of the file
 * @param {object} metadata - Additional metadata
 * @returns {FormData} - The form data payload
 */
function buildPayload(csvContent, filename, metadata = null) {
  const formData = new FormData();
  
  // Add file to form data
  formData.append('file', Buffer.from(csvContent), {
    filename,
    contentType: 'text/csv'
  });
  
  // Add project ID
  formData.append('project_id', PROJECT_ID);
  
  // Add metadata
  formData.append('metadata', JSON.stringify({
    type: 'file',
    filename: filename,
    ...(metadata || {})
  }));
  
  return formData;
}


/**
 * Fetches activities from the National Park Service API for Yosemite
 * @param {string} parkCode - The park code (default: 'yose' for Yosemite)
 * @returns {Promise<Array>} - Array of activities
 */
async function fetchActivitiesFromNPS(parkCode = 'yose') {
  try {
    const url = `${NPS_API_BASE_URL}/thingstodo?parkCode=${parkCode}`;
    const response = await axios.get(url, {
      headers: {
        'accept': 'application/json',
        'x-api-key': NPS_API_KEY
      }
    });
    
    console.log(`Successfully fetched ${response.data.data.length} activities from NPS API`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching activities from NPS API:', error.message);
    throw error;
  }
}

module.exports = {
  fetchActivitiesFromNPS,
  createDocument,
  updateDocument,
  fetchDocument,
  fetchDocumentsList
}; 