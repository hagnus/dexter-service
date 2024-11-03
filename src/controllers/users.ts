import { Request, Response } from "express";
import { User } from '@data/models';
import { compare } from 'bcrypt';
import { identity, pickBy } from 'lodash';
import { generateAccessToken } from "@data/models/utils";

export async function create(req: Request, res: Response) {
  const { userName, email, firstName, lastName, password } = req.body;
  try {
    const newUser = await User.create({
      userName,
      password,
      email,
      firstName,
      lastName,
    });
    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
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

export async function signIn(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    const user = await User.scope('auth').findOne({ where: { email: email } });

    if (!user) {
      res.status(401).json({ error: 'Authentication failed' });
      return
    }

    const passwordMatch = await compare(password, user.dataValues.password);
    if (!passwordMatch) {
      res.status(401).json({ error: 'Authentication failed (password)' });
      return
    }

    console.log('AUTH', user.dataValues);

    const token = generateAccessToken(user.dataValues.id, user.dataValues.userName);
    res.status(200).json({ token });

  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
}