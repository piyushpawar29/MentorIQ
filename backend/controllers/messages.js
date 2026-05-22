const Message = require('../models/Message');
const User = require('../models/User');

// @desc    Get all conversations for a user
// @route   GET /api/messages/conversations
// @access  Private
exports.getConversations = async (req, res) => {
  try {
    // Find all messages where the user is either sender or receiver
    const messages = await Message.find({
      $or: [
        { sender: req.user.id },
        { receiver: req.user.id }
      ]
    }).sort({ createdAt: -1 });

    // Extract unique conversation partners with accurate unread counts
    const conversationPartners = new Set();
    const conversations = [];

    // Build a map of unread counts per partner first
    const unreadByPartner = {};
    messages.forEach(message => {
      const isIncoming = message.sender.toString() !== req.user.id && !message.isRead;
      const partnerId = message.sender.toString() === req.user.id
        ? message.receiver.toString()
        : message.sender.toString();
      if (isIncoming) {
        unreadByPartner[partnerId] = (unreadByPartner[partnerId] || 0) + 1;
      }
    });

    messages.forEach(message => {
      const partnerId = message.sender.toString() === req.user.id
        ? message.receiver.toString()
        : message.sender.toString();

      if (!conversationPartners.has(partnerId)) {
        conversationPartners.add(partnerId);
        conversations.push({
          partnerId,
          lastMessage: message.text,
          lastMessageDate: message.createdAt,
          unread: unreadByPartner[partnerId] || 0
        });
      }
    });

    // Get user details for each conversation partner
    const conversationsWithDetails = await Promise.all(
      conversations.map(async (conv) => {
        const partner = await User.findById(conv.partnerId).select('name avatar role');
        return {
          ...conv,
          partner
        };
      })
    );

    res.status(200).json({
      success: true,
      count: conversationsWithDetails.length,
      data: conversationsWithDetails
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get messages between two users
// @route   GET /api/messages/:userId
// @access  Private
exports.getMessages = async (req, res) => {
  try {
    // Find all messages between the two users
    const messages = await Message.find({
      $or: [
        { sender: req.user.id, receiver: req.params.userId },
        { sender: req.params.userId, receiver: req.user.id }
      ]
    })
    .sort({ createdAt: 1 })
    .populate({
      path: 'sender',
      select: 'name avatar'
    })
    .populate({
      path: 'receiver',
      select: 'name avatar'
    });

    // Mark all messages as read
    await Message.updateMany(
      { sender: req.params.userId, receiver: req.user.id, isRead: false },
      { isRead: true }
    );

    res.status(200).json({
      success: true,
      count: messages.length,
      data: messages
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Send a message
// @route   POST /api/messages
// @access  Private
exports.sendMessage = async (req, res) => {
  try {
    const { receiver, text, attachment, attachmentType } = req.body;

    // Check if receiver exists
    const receiverUser = await User.findById(receiver);
    if (!receiverUser) {
      return res.status(404).json({
        success: false,
        message: 'Receiver not found'
      });
    }

    // Create message
    const message = await Message.create({
      sender: req.user.id,
      receiver,
      text,
      attachment,
      attachmentType: attachmentType || 'none'
    });

    // Populate sender and receiver details for response
    const populatedMessage = await Message.findById(message._id)
      .populate({
        path: 'sender',
        select: 'name avatar'
      })
      .populate({
        path: 'receiver',
        select: 'name avatar'
      });

    res.status(201).json({
      success: true,
      data: populatedMessage
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete a message
// @route   DELETE /api/messages/:id
// @access  Private
exports.deleteMessage = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Check if user is the sender
    if (message.sender.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this message'
      });
    }

    await Message.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get unread message count
// @route   GET /api/messages/unread
// @access  Private
exports.getUnreadCount = async (req, res) => {
  try {
    const count = await Message.countDocuments({
      receiver: req.user.id,
      isRead: false
    });

    res.status(200).json({
      success: true,
      data: { count }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}; 