import 'dotenv/config';
import { Environment } from '@constants';
import express, { Express, json } from "express";
import { database } from '@data/db';
import userRouter from '@domains/user/users.route';
import syncRouter from '@routes/sync';
import { authenticate, authorize } from '@middlewares/auth';
import cors from 'cors';
import { AuthRole } from '@domains/auth/auth.types';
import authRouter from '@domains/auth/auth.route';
import cookieParser from 'cookie-parser';

const app: Express = express();
const { NODE_LOCAL_PORT, NODE_LOCAL_HOST, ALLOWED_DOMAINS } = Environment;

// Connect to the database
database.authenticate()
  .then(() => console.log('Database Connected'))
  .catch((err) => console.error('Error connecting to database:', err));

// Middlewares
app.use(cors({
  origin: ALLOWED_DOMAINS.split(','),
  methods: ['GET', 'PUT', 'POST', 'HEAD', 'DELETE', 'OPTIONS'],
  optionsSuccessStatus: 200,
}));

app.use(json());
app.use(cookieParser());

// PUBLIC ROUTES
app.use('/auth', authRouter);

// AUTH ROUTES
app.use(authenticate);
app.use('/users/:userId', authorize(AuthRole.USER));
app.use('/users', userRouter);

// MANAGER ROUTES
// app.use(authorize(AuthRole.MANAGER));

// ADMIN ROUTES
app.use(authorize(AuthRole.ADMIN));
app.use('/sync', syncRouter);

database.sync()
  .then(() => app.listen(Number(NODE_LOCAL_PORT), NODE_LOCAL_HOST, () => {
    console.log(`Dexter Service is running on: ${NODE_LOCAL_HOST}:${NODE_LOCAL_PORT}`)
  })
  )