const { 
  fetchActivitiesFromNPS, 
  createDocument, 
  updateDocument
} = require('./api');

// Store document ID in memory for reuse
let documentId = null;

/**
 * Processes activities data to extract relevant information
 * @param {Array} activities - Raw activities data from NPS API
 * @returns {Array} - Processed activities data
 */
function processActivitiesData(activities) {
  return activities.map(activity => ({
    id: activity.id,
    title: activity.title,
    shortDescription: activity.shortDescription,
    activityType: activity.activities.map(a => a.name).join(', '),
    location: activity.location,
    season: activity.season,
    timeOfDay: activity.timeOfDay,
    url: activity.url,
    isReservationRequired: activity.isReservationRequired ? 'Yes' : 'No',
    arePetsPermitted: activity.arePetsPermitted ? 'Yes' : 'No'
  }));
}

/**
 * Converts an array of objects to CSV string
 * @param {Array} data - Array of objects to convert to CSV
 * @returns {string} - CSV string
 */
function convertToCSV(data) {
  if (!data || data.length === 0) {
    return '';
  }
  
  const headers = Object.keys(data[0]);
  const csvRows = data.map(row =>
    headers.map(header => {
      // Handle values that might contain commas or quotes
      const value = row[header] !== null && row[header] !== undefined ? String(row[header]) : '';
      return value.includes(',') || value.includes('"') 
        ? `"${value.replace(/"/g, '""')}"` 
        : value;
    }).join(',')
  );
  
  return [headers.join(','), ...csvRows].join('\n');
}

/**
 * Generates SQL schema for the activities data
 * @returns {Object} - SQL schema definition
 */
function generateSQLSchema() {
  return {
    table_name: "yosemite_activities",
    columns: [
      { name: "id", type: "TEXT" },
      { name: "title", type: "TEXT" },
      { name: "shortDescription", type: "TEXT" },
      { name: "activityType", type: "TEXT" },
      { name: "location", type: "TEXT" },
      { name: "season", type: "TEXT" },
      { name: "timeOfDay", type: "TEXT" },
      { name: "url", type: "TEXT" },
      { name: "isReservationRequired", type: "TEXT" },
      { name: "arePetsPermitted", type: "TEXT" }
    ]
  };
}

/**
 * Main function to fetch and upload Yosemite activities to ThetaEdgeCloud
 * @returns {Promise<string>} - The document ID
 */
async function fetchAndUpdateActivities() {
  try {
    console.log('Fetching Yosemite activities...');
    const activities = await fetchActivitiesFromNPS();
    
    // Process the activities data
    const processedActivities = processActivitiesData(activities);
    
    // Convert to CSV
    const csvData = convertToCSV(processedActivities);
    
    // Generate SQL schema
    const sqlSchema = generateSQLSchema();
    
    // Prepare metadata with only the necessary parameters
    const metadata = {
      query_type: "sql",
      sql_schema: sqlSchema,
      sql_description: "Yosemite National Park activities. Contains information about various activities available in Yosemite. Sample data: title='Backpacking', activityType='Hiking, Camping', location='Yosemite Valley', season='Spring, Summer, Fall', isReservationRequired='Yes', arePetsPermitted='No'"
    };
    
    // Update or create document in ThetaEdgeCloud
    const filename = 'yosemite-activities.csv';
    let resultId;
    
    if (documentId) {
      console.log(`Updating existing document (ID: ${documentId})...`);
      resultId = await updateDocument(documentId, csvData, filename, metadata);
    } else {
      console.log('Creating new document...');
      resultId = await createDocument(csvData, filename, metadata);
    }
    
    // Store document ID in memory for future updates
    documentId = resultId;
    console.log(`Document ID stored in memory: ${documentId}`);
    
    console.log(`Activities successfully ${documentId ? 'updated' : 'created'} in ThetaEdgeCloud (Document ID: ${resultId})`);
    return resultId;
  } catch (error) {
    console.error('Error in fetchAndUpdateActivities:', error.message);
    throw error;
  }
}

/**
 * Starts the crawler to update data every 10 minutes
 */
function startCrawler() {
  console.log('Starting Yosemite activities crawler...');
  
  // Run immediately on start
  fetchAndUpdateActivities()
    .then(() => console.log('Initial data update complete'))
    .catch(err => console.error('Error in initial data update:', err));
  
  setInterval(async () => {
    try {
      await fetchAndUpdateActivities();
      console.log(`Data updated at ${new Date().toLocaleString()}`);
    } catch (error) {
      console.error('Error updating data:', error.message);
    }
  }, 10 * 60 * 1000);
}

// Execute the main function if this file is run directly
if (require.main === module) {
  startCrawler();
}

module.exports = {
  fetchAndUpdateActivities,
  startCrawler
}; 