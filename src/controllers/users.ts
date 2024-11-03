import { User } from '@data/models';
import { Request, Response } from "express";
import { identity, pickBy } from 'lodash';

export async function create(req: Request, res: Response) {
  const { username, email, firstName, lastName, password } = req.body;
  try {
    const newUser = await User.create({
      username,
      password,
      email,
      firstName,
      lastName,
    });
    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' + error});
  }
}

export async function findById(req: Request, res: Response) {
  const { id } = req.params;

  try {
    const user = await User.findByPk(id);

    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

export async function filterBy(req: Request, res: Response) {
  const filters = pickBy(req.query, identity);

  try {
    const user = await User.findAll({
      where: { ...filters }
    })

    if (user) {
      res.status(404).json({ error: 'User not found' });
    } else {
      res.json(user);
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

export async function update(req: Request, res: Response) {
  const { id } = req.params;
  const { userName, email, firstName, lastName, password } = req.body;

  try {
    const user = await User.findByPk(id);

    if (user) {
      user.setDataValue('userName', userName ?? user.getDataValue('userName'));
      user.setDataValue('email', email ?? user.getDataValue('email'));
      user.setDataValue('firstName', firstName ?? user.getDataValue('firstName'));
      user.setDataValue('lastName', lastName ?? user.getDataValue('lastName'));
      user.setDataValue('password', password ?? user.getDataValue('password'));
      
      await user.save();

      res.json(user);
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};