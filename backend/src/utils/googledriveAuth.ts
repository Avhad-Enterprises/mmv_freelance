//   import {google} from 'googleapis'
//   import express from "express";
  
  
//   const app = express();
//   const port = 3000;
  
//   // Replace with your credentials
//   const CLIENT_ID = process.env.CLIENT_ID;
//   const CLIENT_SECRET = process.env.CLIENT_SECRET;
//   const REDIRECT_URI = process.env.REDIRECT_URI;
  
//   const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
  
//   // STEP 1: Go to this URL in browser to authenticate
//   app.get('/', (req, res) => {
//     const authUrl = oauth2Client.generateAuthUrl({
//       access_type: 'offline',
//       scope: [
//         'https://www.googleapis.com/auth/drive.readonly',
//         'https://www.googleapis.com/auth/drive.file',
//       ],
//     });
//     res.send(`<a href="${authUrl}">Authenticate with Google Drive</a>`);
//   });
  
//   // STEP 2: Google redirects here with ?code=...
//   app.get('/oauth2callback', async (req, res) => {
//     const code = req.query.code;
//     const { tokens } = await oauth2Client.getToken(code);
//     oauth2Client.setCredentials(tokens);
//     console.log('✅ Access Token:', tokens.access_token);
  
//     res.send('Authentication successful. Check terminal for access token!');
//   });
  
//   app.listen(port, () => {
//     console.log(`Visit http://localhost:${port} to authenticate`);
//   });
  