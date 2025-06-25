import app from './app';
import dotenv from 'dotenv';
import { dbconnect } from './config/database';
dotenv.config();

const PORT = process.env.PORT || 8000;

app.listen(PORT, async() => {
  await dbconnect();
  console.log(`Server running on http://localhost:${PORT}`);
});
