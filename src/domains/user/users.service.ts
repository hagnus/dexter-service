import { User } from "@data/models";
import { compare } from 'bcrypt';
import { identity, pickBy } from 'lodash';

export async function findUser(email: string) {
  try {
    const user = await User.scope('auth').findOne({ where: { email: email } });

    return user?.dataValues;
  } catch (error) {
    throw Error('Not able to collect User information');
  }
}

export async function create(userRegistration: any) {
  try {
    const passwordMatch = await compare(
      userRegistration.password,
      userRegistration.passwordConfirmation
    );

    if (!passwordMatch) {
      throw Error('Invalid password');
    }

    const newUser = await User.create(userRegistration);

    return newUser.dataValues;
  } catch {
    throw Error('User creation failure');
  }
}

export async function verify(email: string, password: string) {
  const user = await findUser(email);

  if (!user) {
    throw Error('User not found');
  }

  const passwordMatch = await compare(password, user.password);
  if (!passwordMatch) {
    throw Error('Invalid user credentials')
  }

  return user;
}

export async function findById(id: string) {
  const user = await User.findByPk(id);

  return user?.dataValues;
}

export async function filterBy(query: any) {
  const filters = pickBy(query, identity);

  try {
    const users = await User.findAll({
      where: { ...filters }
    })

    return users
  } catch (error) {
    throw new Error('Not able to get Users information');
  }
}

export async function update(id: string, fields: any) {
  const { userName, email, firstName, lastName } = fields;
  const user = await User.findByPk(id);

  if (!user){
    return null;
  }

  user.setDataValue('userName', userName ?? user.getDataValue('userName'));
  user.setDataValue('email', email ?? user.getDataValue('email'));
  user.setDataValue('firstName', firstName ?? user.getDataValue('firstName'));
  user.setDataValue('lastName', lastName ?? user.getDataValue('lastName'));

  return (await user.save()).dataValues;
};
