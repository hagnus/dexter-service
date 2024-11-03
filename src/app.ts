import 'dotenv/config';
import express, { Express, Request, Response } from "express";
import { database } from '@data/db';
import userRouter from '@routes/users';
import syncRouter from '@routes/sync';

const app: Express = express();
const port = Number(process.env.NODE_LOCAL_PORT);
const host = process.env.NODE_LOCAL_HOST ?? '';

// Connect to the database
database.authenticate()
  .then(() => console.log('Database Connected'))
  .catch((err) => console.error('Error connecting to database:', err));

// Middleware to parse JSON requests
app.use(express.json());

app.get('/', (req: Request, res: Response) => {
  console.log(`Hello!`);
  res.send('Hello World!')
})

app.use('/sync', syncRouter)
app.use('/users', userRouter);

database.sync()
  .then(() => app.listen(port, host, () => {
    console.log(`Dexter Service is running on: ${host}:${port}`)
  })
)