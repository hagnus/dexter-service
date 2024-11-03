import { Router, Request, Response } from 'express';
import { database } from '@data/db';

const syncRouter = Router();

syncRouter.get('/:option', (req: Request, res: Response) => {
  if(req.params.option === 'alter') {
    database.sync({ alter: true})
      .then(() => res.send('Database Synchronized: Alter'))
      .catch((err) => res.status(500).send(`
        <h1>Error synchronizing the database</h1>
        <p>${err}</p> 
      `));

  } else if(req.params.option === 'force') {
    database.sync({ force: true})
      .then(() => res.send('Database Synchronized: Force'))
      .catch((err) => res.status(500).send(`
        <h1>Error synchronizing the database</h1>
        <p>${err}</p> 
      `));

  } else {
    database.sync()
      .then(() => res.send('Database Synchronized: Default'))
      .catch((err) => res.status(500).send(`
        <h1>Error synchronizing the database</h1>
        <p>${err}</p> 
      `));
  }
});

export default syncRouter;