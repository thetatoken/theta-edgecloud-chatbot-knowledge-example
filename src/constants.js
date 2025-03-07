require('dotenv').config();

// National Park Service API configuration
const NPS_API_KEY = process.env.NPS_API_KEY;
const NPS_API_BASE_URL = 'https://developer.nps.gov/api/v1';

// ThetaEdgeCloud configuration
const EDGE_CLOUD_CONTROLLER_HOST = 'https://controller.thetaedgecloud.com';
const TEC_API_KEY = process.env.TEC_API_KEY;
const CHATBOT_ID = process.env.CHATBOT_ID;
const PROJECT_ID = process.env.PROJECT_ID;


module.exports = {
  NPS_API_KEY,
  NPS_API_BASE_URL,
  EDGE_CLOUD_CONTROLLER_HOST,
  TEC_API_KEY,
  CHATBOT_ID,
  PROJECT_ID,
}; 