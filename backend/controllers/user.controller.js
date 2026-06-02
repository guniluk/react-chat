import User from '../models/user.model.js';

export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;

    const users = await User.find({ _id: { $ne: loggedInUserId } }).select(
      '-password',
    );

    if (!users) {
      return res.status(404).json({ error: 'No users found' });
    }
    res.status(200).json(users);
  } catch (error) {
    console.log('Error in getUsersForSidebar controller:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
