import { Request, Response } from "express";
import * as userService from "@domains/user/users.service";

export async function create(req: Request, res: Response) {
  const { userName, email, firstName, lastName, password } = req.body;
  try {
    const newUser = await userService.create({
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

export async function findOne(req: Request, res: Response) {
  const { userId } = req.params;

  try {
    const user = await userService.findById(userId);

    if (user) {
      res.status(200).json(user);
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

export async function update(req: Request, res: Response) {
  const { userId } = req.params;
  const { userName, email, firstName, lastName } = req.body;

  try {
    const user = await userService.update(userId, { 
      userName,
      email,
      firstName,
      lastName 
    });

    if (!!user) {
      res.status(200).json(user);
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};