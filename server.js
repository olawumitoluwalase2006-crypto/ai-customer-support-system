import app from './api/index.js';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`=================================================`);
  console.log(`🚀 Customer Support AI Server running on port ${PORT}`);
  console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`📨 API Endpoint: http://localhost:${PORT}/api/requests`);
  console.log(`=================================================`);
});
