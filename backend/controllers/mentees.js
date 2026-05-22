const User = require('../models/User');
const MenteeProfile = require('../models/MenteeProfile');

// @desc    Get mentee profile for logged in user
// @route   GET /api/mentees/profile
// @access  Private (Mentee only)
exports.getMenteeProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const menteeProfile = await MenteeProfile.findOne({ user: req.user.id });

    if (!menteeProfile) {
      return res.status(404).json({
        success: false,
        message: 'Mentee profile not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar
        },
        profile: menteeProfile
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update mentee profile
// @route   PUT /api/mentees/profile
// @access  Private (Mentee only)
exports.updateMenteeProfile = async (req, res) => {
  try {
    const menteeProfile = await MenteeProfile.findOne({ user: req.user.id });

    if (!menteeProfile) {
      return res.status(404).json({
        success: false,
        message: 'Mentee profile not found'
      });
    }

    // Fields to update
    const fieldsToUpdate = {
      interests: req.body.interests || menteeProfile.interests,
      goals: req.body.goals || menteeProfile.goals,
      preferredLanguages: req.body.preferredLanguages || menteeProfile.preferredLanguages,
      educationLevel: req.body.educationLevel || menteeProfile.educationLevel,
      currentOccupation: req.body.currentOccupation || menteeProfile.currentOccupation,
      learningStyle: req.body.learningStyle || menteeProfile.learningStyle,
      availableHours: req.body.availableHours || menteeProfile.availableHours,
      preferredCommunication: req.body.preferredCommunication || menteeProfile.preferredCommunication
    };

    const updatedProfile = await MenteeProfile.findOneAndUpdate(
      { user: req.user.id },
      fieldsToUpdate,
      {
        new: true,
        runValidators: true
      }
    );

    res.status(200).json({
      success: true,
      data: updatedProfile
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Connect with a mentor
// @route   POST /api/mentees/connect/:mentorId
// @access  Private (Mentee only)
exports.connectWithMentor = async (req, res) => {
  try {
    const menteeProfile = await MenteeProfile.findOne({ user: req.user.id });
    const mentorUser = await User.findById(req.params.mentorId);

    if (!menteeProfile) {
      return res.status(404).json({
        success: false,
        message: 'Mentee profile not found'
      });
    }

    if (!mentorUser || mentorUser.role !== 'mentor') {
      return res.status(404).json({
        success: false,
        message: 'Mentor not found'
      });
    }

    // Check if already connected
    if (menteeProfile.mentorsConnected.includes(mentorUser._id)) {
      return res.status(400).json({
        success: false,
        message: 'Already connected with this mentor'
      });
    }

    // Add mentor to connected mentors
    menteeProfile.mentorsConnected.push(mentorUser._id);
    await menteeProfile.save();

    res.status(200).json({
      success: true,
      data: menteeProfile
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Disconnect from a mentor
// @route   DELETE /api/mentees/disconnect/:mentorId
// @access  Private (Mentee only)
exports.disconnectFromMentor = async (req, res) => {
  try {
    const menteeProfile = await MenteeProfile.findOne({ user: req.user.id });

    if (!menteeProfile) {
      return res.status(404).json({
        success: false,
        message: 'Mentee profile not found'
      });
    }

    // Remove mentor from connected mentors
    menteeProfile.mentorsConnected = menteeProfile.mentorsConnected.filter(
      mentor => mentor.toString() !== req.params.mentorId
    );
    
    await menteeProfile.save();

    res.status(200).json({
      success: true,
      data: menteeProfile
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all connected mentors
// @route   GET /api/mentees/mentors
// @access  Private (Mentee only)
exports.getConnectedMentors = async (req, res) => {
  try {
    const MentorProfile = require('../models/MentorProfile');
    const menteeProfile = await MenteeProfile.findOne({ user: req.user.id });

    if (!menteeProfile) {
      return res.status(404).json({
        success: false,
        message: 'Mentee profile not found'
      });
    }

    const ids = menteeProfile.mentorsConnected;

    // Single batch query instead of N+1
    const [mentorUsers, mentorProfiles] = await Promise.all([
      User.find({ _id: { $in: ids } }).select('name email avatar bio'),
      MentorProfile.find({ user: { $in: ids } })
    ]);

    const profileMap = {};
    mentorProfiles.forEach(p => { profileMap[p.user.toString()] = p; });

    const mentors = mentorUsers.map(u => ({
      user: u,
      profile: profileMap[u._id.toString()] || null
    }));

    res.status(200).json({
      success: true,
      count: mentors.length,
      data: mentors
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}; 