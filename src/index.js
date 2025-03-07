const { startCrawler } = require('./fetch-activities');

/**
 * Main entry point for the application
 */
function main() {
  console.log('Starting Yosemite activities crawler for ThetaEdgeCloud...');
  startCrawler();
}

// Execute the main function if this file is run directly
if (require.main === module) {
  main();
}

module.exports = { main }; 