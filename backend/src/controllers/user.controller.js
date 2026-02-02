import User from "../models/user.model.js";

export const getUsers = async (req, res) => {
  console.log("LOGGED USER:", req.user);

  const users = await User.find({
    _id: { $ne: req.user._id },
  }).select("_id name email");

  res.json(users);
};
