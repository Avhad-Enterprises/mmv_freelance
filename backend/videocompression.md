# 📼 Online Video Compression Tool – README

## 🎯 Project Overview

This is a **cloud-to-cloud video compression microservice** built with **Node.js**, **Express**, and **FFmpeg**, designed to work with **Google Drive** and **Dropbox** via OAuth. The goal is to:

- 🔽 Compress large video files by 70–80% using CRF-based compression (visually lossless)
- 🔁 Stream video directly from the user's cloud (no download or temp file)
- 🔼 Upload the compressed video back to the user's own cloud

The entire system runs in memory, supports OAuth authentication, and is suitable for frontend integration with platforms like MakeMyVid.io.

---

## 🧱 Architecture

```
User's Google Drive / Dropbox
        ⬇
  [OAuth Access Token]       
        ⬇
Express.js Server (Node.js + FFmpeg + Streams)
        ⬇
  [Compressed Stream]
        ⬇
User's Google Drive / Dropbox (Upload)
```

- 🎬 FFmpeg used via `ffmpeg-static` and `child_process.spawn`
- 🚫 No disk writes — everything is streamed in memory

---

## 🛠️ Tech Stack

| Layer        | Tool/Service          | Purpose                    |
| ------------ | --------------------- | -------------------------- |
| Backend      | Node.js + Express     | REST API server            |
| Video Engine | ffmpeg-static + spawn | Compression pipeline       |
| Auth/Storage | Google Drive API      | Download/upload via stream |
|              | Dropbox API           | Dropbox stream I/O         |
| Realtime     | Socket.io             | Live compression progress  |

---

## 🚀 How It Works (Flow)

### 1. User authenticates with Google or Dropbox

- Access token is saved (temporarily or in frontend memory)

### 2. Client sends POST `/compress` with:

```json
{
  "provider": "gdrive" | "dropbox",
  "fileId": "<file_id_or_path>",
  "accessToken": "<oauth_access_token>"
}
```

### 3. Backend:

- Fetches video from the user's cloud via stream
- Pipes it to FFmpeg (in-memory compression)
- Emits real-time compression percentage via WebSocket
- Pipes the compressed output to a new upload stream
- Sends success or error response

---

## 📦 Key Files and Responsibilities

### `index.js`

- Starts server, loads routes

### `routes/compress.route.js`

- Defines `/api/compress` endpoint

### `controllers/compress.controller.js`

- Validates request, calls compression service

### `services/compressService.js`

- Handles stream-based FFmpeg logic
- Emits progress updates using Socket.io
- Calls Google/Dropbox upload after compression

### `utils/cloudStreams.js`

- Contains `getCloudReadableStream()` and `uploadToCloud()` for:
  - Google Drive (via `googleapis`)
  - Dropbox (via `fetch` or `dropbox-sdk`)

---

## ✅ Tasks List (Detailed & Specific)

### 🔐 OAuth & API Setup

- [ ] Implement Google Drive and Dropbox OAuth flow in the frontend (store accessToken securely)
- [ ] Validate and refresh OAuth tokens as needed

### 🧠 Backend Core

#### [`src/utils/cloudStream.ts`]
- [ ] Implement `getCloudReadableStream(provider, fileId, accessToken)` to fetch video as a stream from Google Drive or Dropbox
- [ ] Implement `uploadToCloud(provider, stream, accessToken, filename)` to upload the compressed video stream back to the user's cloud
- [ ] Handle errors for unsupported providers and failed API calls

#### [`src/routes/compress.route.ts`]
- [ ] Define `/compress/compress` POST endpoint
- [ ] Route requests to the compression controller

#### [`src/controllers/compress.controller.ts`]
- [ ] Validate incoming request body for `provider`, `fileId`, and `accessToken`
- [ ] Call the compression service with the correct parameters
- [ ] Handle and return errors with appropriate status codes

#### [`src/services/compress.services.ts`]
- [ ] Implement `handleCompression(inputStream)` to compress video using FFmpeg (in-memory)
- [ ] Integrate with `cloudStream.ts` to fetch and upload streams
- [ ] (Optional) Emit real-time compression progress via WebSocket
- [ ] Handle FFmpeg errors and process cleanup

### 📡 WebSocket Integration

- [ ] Integrate Socket.io for real-time compression progress updates (optional/advanced)
- [ ] Emit progress events from FFmpeg stderr parsing
- [ ] Handle client connection/disconnection events

---

## 📘 Example Request (Postman)

```
POST /api/compress
{
  "provider": "gdrive",
  "fileId": "1A2B3C4D5E6",
  "accessToken": "ya29.a0ARrdaM..."
}
```

---

## 🧪 Testing Flow

### 1. Prerequisites
- Ensure your backend server is running (e.g., `npm run dev` or `npm start`).
- Obtain a valid OAuth access token for Google Drive or Dropbox.
- Get the file ID (Google Drive) or file path (Dropbox) of a video you want to compress.

### 2. Test the API Endpoint
- Use Postman or curl to send a POST request to your backend:

**POST http://localhost:PORT/compress**

Request body (JSON):
```json
{
  "provider": "gdrive" | "dropbox",
  "fileId": "<file_id_or_path>",
  "accessToken": "<oauth_access_token>"
}
```

Example curl command:
```sh
curl -X POST http://localhost:PORT/compress \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "gdrive",
    "fileId": "1A2B3C4D5E6",
    "accessToken": "ya29.a0ARrdaM..."
  }'
```

### 3. Expected Response
- On success: `{ "status": "success", "result": { ...uploaded file metadata... } }`
- On error: `{ "error": "...error message..." }`

### 4. Verify the Upload
- Check your Google Drive or Dropbox for a new file named `compressed.mp4` (or the name you provided).
- Confirm the file size is reduced and the video plays correctly.

### 5. Troubleshooting
- **400 error:** Check that all required fields (`provider`, `fileId`, `accessToken`) are present and valid.
- **500 error:** Review backend logs for FFmpeg or cloud API errors.
- **OAuth issues:** Ensure your access token is valid and has the correct scopes.
- **File not found:** Double-check the file ID/path and permissions.

---

# 🚀 Google Drive API Setup & OAuth Flow (Step-by-Step)

## ✅ PHASE 1: Enable Google Drive API and Create OAuth Credentials

**Step 1: Go to Google Cloud Console**
🔗 https://console.cloud.google.com/

**Step 2: Create a Project**
- Click on the top dropdown → New Project
- Give it a name like VideoCompressor
- Click Create

**Step 3: Enable Google Drive API**
- From the dashboard → go to "APIs & Services" > "Library"
- Search for "Google Drive API"
- Click on it → Click Enable

**Step 4: Configure OAuth Consent Screen**
- Go to "APIs & Services" > "OAuth Consent Screen"
- Choose External
- Fill in:
  - App name
  - Support email
  - Add scopes:
    - https://www.googleapis.com/auth/drive.readonly
    - https://www.googleapis.com/auth/drive.file
  - Add test users (use your Gmail account)
- Save and Continue

**Step 5: Create OAuth 2.0 Credentials**
- Go to "APIs & Services" > "Credentials"
- Click "Create Credentials" > OAuth Client ID
- Choose Web Application
- Add redirect URI (e.g., http://localhost:3000/oauth2callback or your domain)
- Once created, copy:
  - Client ID
  - Client Secret

---

## ✅ PHASE 2: Implement OAuth Flow to Get Access Token

You can test it using a small Node.js script:

**google-oauth.js (run locally):**
```js
const { google } = require('googleapis');
const express = require('express');

const app = express();
const port = 3000;

// Replace with your credentials
const CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID';
const CLIENT_SECRET = 'YOUR_GOOGLE_CLIENT_SECRET';
const REDIRECT_URI = 'http://localhost:3000/oauth2callback';

const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

// STEP 1: Go to this URL in browser to authenticate
app.get('/', (req, res) => {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: [
      'https://www.googleapis.com/auth/drive.readonly',
      'https://www.googleapis.com/auth/drive.file',
    ],
  });
  res.send(`<a href="${authUrl}">Authenticate with Google Drive</a>`);
});

// STEP 2: Google redirects here with ?code=...
app.get('/oauth2callback', async (req, res) => {
  const code = req.query.code;
  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);
  console.log('✅ Access Token:', tokens.access_token);

  res.send('Authentication successful. Check terminal for access token!');
});

app.listen(port, () => {
  console.log(`Visit http://localhost:${port} to authenticate`);
});
```

**Install required packages:**
```bash
npm install express googleapis
```

**Run the server:**
```bash
node google-oauth.js
```

Then go to http://localhost:3000 → click the link → login → and copy the access token from terminal.

---

## ✅ PHASE 3: Get File ID from Google Drive
You can get the fileId from the URL of a file in Google Drive:

Example:
```
https://drive.google.com/file/d/1A2B3C4D5E6FgH7Ij8/view?usp=sharing
```
Your fileId is: `1A2B3C4D5E6FgH7Ij8`

---

## ✅ PHASE 4: Test Compression API
Using Postman or curl:

**Request:**
```bash
POST http://localhost:8000/api/compress
Content-Type: application/json
Body:
{
  "provider": "gdrive",
  "fileId": "1A2B3C4D5E6FgH7Ij8",
  "accessToken": "ya29.a0ARrdaM..."
}
```

---

## 🧪 Recap (Quick Checklist)
| Step | Output |
|------|--------|
| ✅ Enable Google Drive API | Ready to use API |
| ✅ Set up OAuth credentials | Client ID, Secret |
| ✅ Run google-oauth.js script | Get accessToken |
| ✅ Get fileId from Drive link | Use in request body |
| ✅ Test /compress endpoint | Video gets compressed/uploaded |

---

