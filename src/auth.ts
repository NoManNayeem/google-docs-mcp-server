import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import fs from 'fs/promises';
import http from 'http';
import { parse } from 'url';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SCOPES = [
  'https://www.googleapis.com/auth/documents',
  'https://www.googleapis.com/auth/drive.file'
];
const TOKEN_PATH = path.join(__dirname, '..', 'token.json');
const CREDENTIALS_PATH = path.join(__dirname, '..', 'credentials.json');

export async function getAuthClient(): Promise<OAuth2Client> {
  // Load credentials
  const credentials = JSON.parse(
    await fs.readFile(CREDENTIALS_PATH, 'utf-8')
  );
  
  const { client_id, client_secret, redirect_uris } = credentials.installed;
  const oauth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris[0]
  );

  // Check for existing token
  try {
    const token = await fs.readFile(TOKEN_PATH, 'utf-8');
    const tokenData = JSON.parse(token);
    oauth2Client.setCredentials(tokenData);
    
    // Test if token is still valid by making a simple API call
    try {
      await oauth2Client.getAccessToken();
      console.error('✅ Using existing valid token from token.json');
      return oauth2Client;
    } catch (error) {
      console.error('⚠️ Token expired, attempting refresh...');
      try {
        // Try to refresh the token
        const { credentials } = await oauth2Client.refreshAccessToken();
        oauth2Client.setCredentials(credentials);
        await fs.writeFile(TOKEN_PATH, JSON.stringify(credentials));
        console.error('✅ Token refreshed successfully');
        return oauth2Client;
      } catch (refreshError) {
        console.error('❌ Token refresh failed, starting OAuth flow...');
        // Token refresh failed, we'll need to re-authenticate
        throw new Error('Token refresh failed');
      }
    }
  } catch (error) {
    console.error('❌ No valid token found, starting OAuth flow...');
    // First-time authentication flow or token refresh needed
    return authenticateUser(oauth2Client);
  }
}

async function authenticateUser(oauth2Client: OAuth2Client): Promise<OAuth2Client> {
  // First, determine which port we'll use for the callback
  const callbackPort = 3001; // We'll use 3001 as the default
  
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    redirect_uri: `http://localhost:${callbackPort}/oauth2callback`
  });

  console.error('🔐 Google Docs MCP Server - OAuth Authentication Required');
  console.error('');
  console.error('📋 To complete setup, please:');
  console.error('1. Open this URL in your browser:');
  console.error(`   ${authUrl}`);
  console.error('');
  console.error('2. Sign in with your Google account');
  console.error('3. Click "Allow" to grant permissions');
  console.error('4. The page will redirect and show "Authentication successful!"');
  console.error('');
  console.error('⏳ Waiting for authentication...');

  // Create temporary server to receive callback on a different port
  const code = await new Promise<string>((resolve, reject) => {
    const server = http.createServer(async (req, res) => {
      if (req.url && req.url.indexOf('/oauth2callback') > -1) {
        const qs = parse(req.url, true).query;
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(`
          <html>
            <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
              <h1 style="color: green;">✅ Authentication Successful!</h1>
              <p>You can now close this window and return to Claude Desktop.</p>
              <p>The Google Docs MCP server is ready to use!</p>
            </body>
          </html>
        `);
        server.close();
        resolve(qs.code as string);
      }
    });
    
    // Use the same port as specified in the redirect_uri
    server.listen(callbackPort, () => {
      console.error(`🌐 Callback server listening on http://localhost:${callbackPort}`);
    }).on('error', (err: any) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`❌ Port ${callbackPort} is already in use. Please try again.`);
        reject(new Error(`Port ${callbackPort} is already in use`));
      } else {
        reject(err);
      }
    });
  });

  console.error('🔄 Exchanging authorization code for tokens...');

  // Exchange code for tokens
  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);

  // Save token for future use
  await fs.writeFile(TOKEN_PATH, JSON.stringify(tokens));
  console.error('💾 Authentication tokens saved successfully!');
  console.error('✅ Google Docs MCP Server is now ready to use!');

  return oauth2Client;
}
