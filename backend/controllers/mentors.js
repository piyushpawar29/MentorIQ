const User = require('../models/User');
const MentorProfile = require('../models/MentorProfile');
const Review = require('../models/Review');

// @desc    Get all mentors
// @route   GET /api/mentors
// @access  Public
exports.getMentors = async (req, res) => {
  try {
    // Copy req.query
    const reqQuery = { ...req.query };

    // Fields to exclude
    const removeFields = ['select', 'sort', 'page', 'limit', 'query'];

    // Loop over removeFields and delete them from reqQuery
    removeFields.forEach(param => delete reqQuery[param]);

    // Create query string
    let queryStr = JSON.stringify(reqQuery);

    // Create operators ($gt, $gte, etc)
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

    // Find mentor users
    const mentorUsers = await User.find({ role: 'mentor' });
    const mentorIds = mentorUsers.map(user => user._id);

    // Finding resource
    let query = MentorProfile.find({ user: { $in: mentorIds } })
      .populate({
        path: 'user',
        select: 'name email avatar'
      });

    // Filter by text search
    if (req.query.query) {
      const searchRegex = new RegExp(req.query.query, 'i');
      
      // Find users matching the query
      const matchingUsers = await User.find({
        role: 'mentor',
        $or: [
          { name: searchRegex }
        ]
      });
      
      const matchingUserIds = matchingUsers.map(user => user._id);
      
      // Add to query
      query = query.find({
        $or: [
          { user: { $in: matchingUserIds } },
          { 'expertise': { $in: [searchRegex] } },
          { 'company': searchRegex },
          { 'category': searchRegex }
        ]
      });
    }

    // Select Fields
    if (req.query.select) {
      const fields = req.query.select.split(',').join(' ');
      query = query.select(fields);
    }

    // Sort
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-rating');
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 25;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await MentorProfile.countDocuments();

    query = query.skip(startIndex).limit(limit);

    // Executing query
    const mentors = await query;

    // Pagination result
    const pagination = {};

    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit
      };
    }

    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit
      };
    }

    res.status(200).json({
      success: true,
      count: mentors.length,
      pagination,
      data: mentors
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single mentor
// @route   GET /api/mentors/:id
// @access  Public
exports.getMentor = async (req, res) => {
  try {
    // Try to find mentor by ID (handles both ObjectId and string ID)
    let mentor;
    
    try {
      // First try to find by MongoDB _id
      mentor = await MentorProfile.findById(req.params.id).populate({
        path: 'user',
        select: 'name email avatar bio'
      });
    } catch (err) {
      // If that fails, it might not be a valid ObjectId
      console.log('Error finding mentor by ID:', err.message);
    }

    // If not found by ID, try to find by user field
    if (!mentor) {
      mentor = await MentorProfile.findOne({ user: req.params.id }).populate({
        path: 'user',
        select: 'name email avatar bio'
      });
    }

    if (!mentor) {
      return res.status(404).json({
        success: false,
        message: `Mentor not found with id of ${req.params.id}`
      });
    }

    // Get reviews for this mentor
    const reviews = await Review.find({ mentor: mentor.user._id })
      .populate({
        path: 'mentee',
        select: 'name avatar'
      });

    res.status(200).json({
      success: true,
      data: { mentor, reviews }
    });
  } catch (error) {
    console.error('Error in getMentor:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update mentor profile
// @route   PUT /api/mentors/profile
// @access  Private (Mentor only)
exports.updateMentorProfile = async (req, res) => {
  try {
    const mentorProfile = await MentorProfile.findOne({ user: req.user.id });

    if (!mentorProfile) {
      return res.status(404).json({
        success: false,
        message: 'Mentor profile not found'
      });
    }

    // Fields to update
    const fieldsToUpdate = {
      company: req.body.company || mentorProfile.company,
      hourlyRate: req.body.hourlyRate || mentorProfile.hourlyRate,
      expertise: req.body.expertise || mentorProfile.expertise,
      languages: req.body.languages || mentorProfile.languages,
      experience: req.body.experience || mentorProfile.experience,
      availability: req.body.availability || mentorProfile.availability,
      category: req.body.category || mentorProfile.category,
      communicationPreference: req.body.communicationPreference || mentorProfile.communicationPreference,
      socials: req.body.socials || mentorProfile.socials
    };

    // Update user bio if provided
    if (req.body.bio) {
      await User.findByIdAndUpdate(req.user.id, { bio: req.body.bio });
    }

    const updatedProfile = await MentorProfile.findOneAndUpdate(
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

// @desc    Get mentor profile for logged in user
// @route   GET /api/mentors/profile
// @access  Private (Mentor only)
exports.getMentorProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const mentorProfile = await MentorProfile.findOne({ user: req.user.id });

    if (!mentorProfile) {
      return res.status(404).json({
        success: false,
        message: 'Mentor profile not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          bio: user.bio
        },
        profile: mentorProfile
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get recommended mentors for a mentee
// @route   GET /api/mentors/recommended/:menteeId
// @access  Private
exports.getRecommendedMentors = async (req, res) => {
  try {
    const menteeId = req.params.menteeId;
    
    // Get mentee profile to find interests and preferences
    const menteeUser = await User.findById(menteeId);
    
    if (!menteeUser) {
      return res.status(404).json({
        success: false,
        message: 'Mentee not found'
      });
    }
    
    const MenteeProfile = require('../models/MenteeProfile');
    const menteeProfile = await MenteeProfile.findOne({ user: menteeId });
    
    if (!menteeProfile) {
      return res.status(404).json({
        success: false,
        message: 'Mentee profile not found'
      });
    }
    
    // Find mentor users
    const mentorUsers = await User.find({ role: 'mentor' });
    const mentorIds = mentorUsers.map(user => user._id);
    
    // Get all mentor profiles
    let mentorProfiles = await MentorProfile.find({ user: { $in: mentorIds } })
      .populate({
        path: 'user',
        select: 'name email avatar bio'
      });
    
    // Calculate match scores based on interests and expertise
    const menteeInterests = menteeProfile.interests || [];
    const menteeLanguages = menteeProfile.preferredLanguages || [];
    
    // Add match score to each mentor
    const recommendedMentors = mentorProfiles.map(mentor => {
      const mentorExpertise = mentor.expertise || [];
      const mentorLanguages = mentor.languages || [];
      
      // Calculate match score based on overlapping interests/expertise
      let matchScore = 0;
      
      // Match based on expertise/interests overlap
      menteeInterests.forEach(interest => {
        if (mentorExpertise.some(exp => exp.toLowerCase().includes(interest.toLowerCase()) || 
                               interest.toLowerCase().includes(exp.toLowerCase()))) {
          matchScore += 15; // Higher weight for direct expertise match
        }
      });
      
      // Match based on language preferences
      menteeLanguages.forEach(language => {
        if (mentorLanguages.includes(language)) {
          matchScore += 10;
        }
      });
      
      // Add some weight for rating
      matchScore += (mentor.rating || 4.5) * 5;
      
      // Normalize score to be between 70-100
      matchScore = Math.min(100, Math.max(70, 70 + matchScore));
      
      // Return mentor with match score
      return {
        ...mentor.toObject(),
        matchScore: Math.round(matchScore)
      };
    });
    
    // Sort by match score (highest first)
    recommendedMentors.sort((a, b) => b.matchScore - a.matchScore);
    
    // Return top 5 recommended mentors
    res.status(200).json({
      success: true,
      data: recommendedMentors.slice(0, 5)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}; 