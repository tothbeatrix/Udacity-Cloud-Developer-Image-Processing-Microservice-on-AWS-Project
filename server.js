import express from 'express';
import bodyParser from 'body-parser';
import { filterImageFromURL, deleteLocalFiles } from './util/util.js';

// Init the Express application
const app = express();

// Set the network port
const port = process.env.PORT || 8082;

// Use the body parser middleware for post requests
app.use(bodyParser.json());

// GET /filteredimage?image_url={{URL}}
app.get('/filteredimage', async (req, res) => {
  const { image_url } = req.query;

  // Validate the image_url query
  if (!image_url) {
    return res.status(400).send({ message: 'image_url is required' });
  }

  try {
    // Filter the image based on url
    const filteredPath = await filterImageFromURL(image_url);

    // Send the resulting file in the response
    res.sendFile(filteredPath, {}, (err) => {
      if (err) {
        return res.status(500).send({ message: 'Error sending the file' });
      }

      // Deletes any files on the server on finish of the response
      deleteLocalFiles([filteredPath]);
    });
  } catch (error) {
    return res
      .status(422)
      .send({ message: 'Unable to process the image at the provided URL' });
  }
});

// Root Endpoint
// Displays a simple message to the user
app.get('/', async (req, res) => {
  res.send('try GET /filteredimage?image_url={{}}');
});

// Start the Server
app.listen(port, () => {
  console.log(`server running http://localhost:${port}`);
  console.log(`press CTRL+C to stop server`);
});
