import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import { database } from '@data/db';

dotenv.config();

const app: Express = express();
const port = process.env.PORT ?? 3001;

// Connect to the database
database.authenticate()
 .then(() => console.log('Database connected'))
 .catch((err) => console.error('Error connecting to database:', err));

// Middleware to parse JSON requests
app.use(express.json());

app.get('/', (req: Request, res: Response) => {
  console.log(`Hello!`);
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Dexter Servie is runnin on port ${port}`)
})