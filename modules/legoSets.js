require('dotenv').config();

const Sequelize = require('sequelize');

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
},
{
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
},
{
  createdAt: false,
  updatedAt: false,
});

Set.belongsTo(Theme, { foreignKey: 'theme_id' });

function initialize() {
  return sequelize.sync()
    .then(() => {
      console.log('Database synchronized successfully');
    })
    .catch((err) => {
      console.error('Error synchronizing database:', err);
      throw new Error("Unable to sync the database");
    });
}

function getAllSets() {
  return Set.findAll({ include: [Theme] })
    .catch(err => {
      console.error('Error fetching all sets:', err);
      throw new Error('Unable to fetch sets');
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
  }).catch(err => {
    console.error('Error fetching set by number:', err);
    throw new Error('Unable to find requested set');
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
  }).catch(err => {
    console.error('Error fetching sets by theme:', err);
    throw new Error('Unable to find requested sets');
  });
}

function addSet(setData) {
  return Set.create(setData)
    .then(() => {
      console.log('Set added successfully');
    })
    .catch((err) => {
      console.error('Error adding set:', err);
      throw new Error(err.errors[0].message);
    });
}

function getAllThemes() {
  return Theme.findAll()
    .catch((err) => {
      console.error('Error fetching themes:', err);
      throw new Error('Unable to fetch themes');
    });
}

function editSet(set_num, setData) {
  return Set.update(setData, { where: { set_num } })
    .then((result) => {
      if (result[0] === 0) {
        throw new Error("Cannot find the set");
      }
      console.log('Set updated successfully');
    })
    .catch((err) => {
      console.error('Error updating set:', err);
      throw new Error(err.errors[0].message);
    });
}

function deleteSet(set_num) {
  return Set.destroy({
    where: {
      set_num: set_num
    }
  }).then(() => {
    console.log('Set deleted successfully');
  }).catch((err) => {
    console.error('Error deleting set:', err);
    throw new Error(err.errors[0].message);
  });
}

module.exports = { initialize, getAllSets, getSetByNum, getSetsByTheme, addSet, getAllThemes, editSet, deleteSet }
