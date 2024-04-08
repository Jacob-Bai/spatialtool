module.exports = (sequelize, Sequelize) => {
  const Sessions = sequelize.define("sessions", {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    session_id: {
        type: Sequelize.STRING(20),
        allowNull: false,
        unique: true
    },
    created_at: {
        type: 'TIMESTAMP',
        // defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        allowNull: false
    },
    updated_at: {
        type: 'TIMESTAMP',
        // defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        allowNull: false
    },
    status: Sequelize.STRING(20)
  },
  {
    indexes: [
        { unique: true, fields: ["session_id"] }
    ]
  });

  return Sessions;
};
