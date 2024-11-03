import { hashSync } from 'bcrypt';
import { DataTypes, Sequelize } from 'sequelize';

export const UserModel = (database: Sequelize) => database.define(
  'User',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV1,
      primaryKey: true
    },
    userName: {
      type: DataTypes.STRING,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    firstName: {
      type: DataTypes.STRING,
    },
    lastName: {
      type: DataTypes.STRING,
    }
  },
  {
    tableName: 'USERS',
    defaultScope: {
      attributes: {
        exclude: ['password']
      }
    },
    scopes: {
      auth: {
        attributes: {
          include: ['password']
        }
      }
    },
    hooks: {
      afterSave: (user) => {
        delete user.dataValues.password;
      },
      beforeCreate: (user) => {
        if (!user.dataValues.userName) {
          user.dataValues.userName = user.dataValues.email.split('@').at(0);
        }
        user.dataValues.password = hashSync(user.dataValues.password, 10);
      },
      beforeUpdate: (user) => {
        if(user.dataValues.password) {
          user.dataValues.password = hashSync(user.dataValues.password, 10);
        }
      }
    },
  },
);