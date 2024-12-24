const { User } = require("../utils/InitializeModels");
async function findU() {
  const user = await User.findOne({
    where: { email: "varsha@sudarsan" },
  });
  console.log(user);
}
findU();
