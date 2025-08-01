const functions = require('@google-cloud/functions-framework');
/**
 * A minimal "hello world" function to test deployment.
 */
functions.cloudEvent('dataloader', (cloudEvent) => {
  console.log('Hello World! The function was triggered successfully.');
  console.log('Cloud Event Data:', JSON.stringify(cloudEvent.data));
});
