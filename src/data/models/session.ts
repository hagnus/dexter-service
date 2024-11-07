import { DataTypes, Sequelize } from 'sequelize';

export const SessionModel = (database: Sequelize) => database.define(
  'Session',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV1,
      primaryKey: true
    },
    token: {
      type: DataTypes.STRING
    }
  },
  {
    tableName: 'SESSION',
  },
);