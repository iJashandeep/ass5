require('dotenv').config();
const Sequelize = require('sequelize');
require('pg'); // Explicitly require the 'pg' module

const sequelize = new Sequelize(
  process.env.database,
  process.env.user,
  process.env.password,
  {
    host: process.env.host,
    dialect: "postgres",
    port: 5432,
    dialectOptions: {
      ssl: { rejectUnauthorized: false },
    },
  }
);

const Theme = sequelize.define('Theme', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: Sequelize.STRING,
}, {
  createdAt: false,
  updatedAt: false,
});

const Set = sequelize.define('Set', {
  set_num: {
    type: Sequelize.STRING,
    primaryKey: true,
  },
  name: Sequelize.STRING,
  year: Sequelize.INTEGER,
  num_parts: Sequelize.INTEGER,
  theme_id: Sequelize.INTEGER,
  img_url: Sequelize.STRING,
}, {
  createdAt: false,
  updatedAt: false,
});

Set.belongsTo(Theme, { foreignKey: 'theme_id' });

function initialize() {
  return sequelize.sync()
    .then(() => 'Database synced successfully')
    .catch((err) => {
      console.error('Unable to sync the database:', err);
      throw new Error('Unable to sync the database');
    });
}

function getAllSets() {
  return Set.findAll({ include: [Theme] })
    .catch((err) => {
      console.error('Error getting all sets:', err);
      throw new Error('Error getting all sets');
    });
}

function getSetByNum(setNum) {
  return Set.findAll({
    where: { set_num: setNum },
    include: [Theme],
  }).then((sets) => {
    if (sets.length > 0) {
      return sets[0];
    } else {
      throw new Error('Unable to find requested set');
    }
  }).catch((err) => {
    console.error('Error getting set by number:', err);
    throw new Error('Error getting set by number');
  });
}

function getSetsByTheme(theme) {
  return Set.findAll({
    include: [Theme],
    where: {
      '$Theme.name$': {
        [Sequelize.Op.iLike]: `%${theme}%`,
      },
    },
  }).then((sets) => {
    if (sets.length > 0) {
      return sets;
    } else {
      throw new Error('Unable to find requested sets');
    }
  }).catch((err) => {
    console.error('Error getting sets by theme:', err);
    throw new Error('Error getting sets by theme');
  });
}

function addSet(setData) {
  return Set.create(setData)
    .catch((err) => {
      console.error('Error adding set:', err);
      throw new Error(err.errors[0]?.message || 'Error adding set');
    });
}

function getAllThemes() {
  return Theme.findAll()
    .catch((err) => {
      console.error('Error getting all themes:', err);
      throw new Error('Error getting all themes');
    });
}

function editSet(set_num, setData) {
  return Set.update(setData, { where: { set_num } })
    .then((result) => {
      if (result[0] === 0) {
        throw new Error('Cannot find the set');
      }
    })
    .catch((err) => {
      console.error('Error editing set:', err);
      throw new Error(err.errors[0]?.message || 'Error editing set');
    });
}

function deleteSet(set_num) {
  return Set.destroy({
    where: {
      set_num: set_num
    }
  }).catch((err) => {
    console.error('Error deleting set:', err);
    throw new Error(err.errors[0]?.message || 'Error deleting set');
  });
}

module.exports = { initialize, getAllSets, getSetByNum, getSetsByTheme, addSet, getAllThemes, editSet, deleteSet };
