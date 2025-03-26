const { Sequelize, DataTypes } = require("sequelize");
const sequelize = new Sequelize({
  database: "hire",
  username: "root",
  password: "Varsha@SQL123",
  host: "host.docker.internal",
  dialect: "mysql",
});
sequelize
  .authenticate()
  .then((data) => {
    console.log("CONNECTED AND AUTHENTICATED");
  })
  .catch((e) => {
    console.log(e);
    console.log("ERROR HAPPENED");
  });
sequelize.sync({ alter: true }).then(() => {
  console.log("Models synchronized.");
});
module.exports = sequelize;
