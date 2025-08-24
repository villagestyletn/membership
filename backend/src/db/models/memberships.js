const config = require('../../config');
const providers = config.providers;
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const moment = require('moment');

module.exports = function(sequelize, DataTypes) {
  const memberships = sequelize.define(
    'memberships',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },

name: {
        type: DataTypes.TEXT,

      },

role: {
        type: DataTypes.ENUM,

        values: [

"President",

"VicePresident",

"Secretary",

"JointSecretary",

"Treasurer",

"GeneralBodyMember",

"NormalMember",

"PatronMember",

"AdministrativeMember",

"GeneralMember"

        ],

      },

active: {
        type: DataTypes.BOOLEAN,

        allowNull: false,
        defaultValue: false,

      },

membership_start_date: {
        type: DataTypes.DATE,

      },

membership_end_date: {
        type: DataTypes.DATE,

      },

      importHash: {
        type: DataTypes.STRING(255),
        allowNull: true,
        unique: true,
      },
    },
    {
      timestamps: true,
      paranoid: true,
      freezeTableName: true,
    },
  );

  memberships.associate = (db) => {

    db.memberships.belongsTo(db.users, {
      as: 'createdBy',
    });

    db.memberships.belongsTo(db.users, {
      as: 'updatedBy',
    });
  };

  return memberships;
};

