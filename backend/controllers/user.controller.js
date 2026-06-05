import User from '../models/user.model.js';
import Message from '../models/message.model.js';

export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;

    const users = await User.find({ _id: { $ne: loggedInUserId } }).select(
      '-password',
    );

    if (!users) {
      return res.status(404).json({ error: 'No users found' });
    }

    const usersWithStatus = await Promise.all(
      users.map(async (user) => {
        // 이 유저가 나에게 보낸 메시지 중 안 읽은 개수
        const unreadCount = await Message.countDocuments({
          senderId: user._id,
          receiverId: loggedInUserId,
          isRead: { $ne: true },
        });

        // 내가 이 유저에게 보낸 마지막 메시지
        const lastSentMessage = await Message.findOne({
          senderId: loggedInUserId,
          receiverId: user._id,
        }).sort({ createdAt: -1 });

        let lastMessageStatus = 'none';
        if (lastSentMessage) {
          lastMessageStatus = lastSentMessage.isRead ? 'read' : 'unread';
        }

        return {
          ...user.toObject(),
          unreadCount,
          lastMessageStatus,
        };
      })
    );

    res.status(200).json(usersWithStatus);
  } catch (error) {
    console.log('Error in getUsersForSidebar controller:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
