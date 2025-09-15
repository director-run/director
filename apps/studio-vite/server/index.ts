import express from 'express'
import path from 'path'
import { createSPAMiddleware } from './middleware/spa.js'
import { fileURLToPath } from 'url'

const app = express()
const PORT = process.env.PORT || 8080

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename) 

const config = {
  appName: process.env.APP_NAME || 'Hello World SPA',
  apiUrl: process.env.API_URL || 'http://localhost:3001',
  environment: process.env.NODE_ENV || 'production',
  version: process.env.APP_VERSION || '1.0.0'
}

app.use('*', express.static(path.join(__dirname, '../dist')))
app.get('*', createSPAMiddleware({
  distPath: path.join(__dirname, '../dist'),
  config
}));

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
})