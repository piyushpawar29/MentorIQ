const Review = require('../models/Review');
const User = require('../models/User');
const MentorProfile = require('../models/MentorProfile');
const Session = require('../models/Session');

// @desc    Get reviews for a mentor
// @route   GET /api/mentors/:mentorId/reviews
// @access  Public
exports.getReviews = async (req, res) => {
  try {
    const mentor = await User.findById(req.params.mentorId);

    if (!mentor || mentor.role !== 'mentor') {
      return res.status(404).json({
        success: false,
        message: 'Mentor not found'
      });
    }

    const reviews = await Review.find({ mentor: req.params.mentorId })
      .populate({
        path: 'mentee',
        select: 'name avatar'
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Add review for a mentor
// @route   POST /api/mentors/:mentorId/reviews
// @access  Private (mentees only)
exports.addReview = async (req, res) => {
  try {
    // Add mentee and mentor to body
    req.body.mentee = req.user.id;
    req.body.mentor = req.params.mentorId;

    // Check if mentor exists
    const mentor = await User.findById(req.params.mentorId);

    if (!mentor || mentor.role !== 'mentor') {
      return res.status(404).json({
        success: false,
        message: 'Mentor not found'
      });
    }

    // Session completion check removed as per requirement
    // Users can now submit reviews without completing a session

    // Check if the review already exists
    const existingReview = await Review.findOne({
      mentor: req.params.mentorId,
      mentee: req.user.id
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this mentor'
      });
    }

    // Create review without session reference
    const review = await Review.create({
      ...req.body
      // session reference removed as session completion check was removed
    });

    // Update mentor's rating
    const allReviews = await Review.find({ mentor: req.params.mentorId });
    const totalRating = allReviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / allReviews.length;

    await MentorProfile.findOneAndUpdate(
      { user: req.params.mentorId },
      { 
        rating: averageRating.toFixed(1),
        reviews: allReviews.length
      }
    );

    res.status(201).json({
      success: true,
      data: review
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update review
// @route   PUT /api/reviews/:id
// @access  Private (owner of review)
exports.updateReview = async (req, res) => {
  try {
    let review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: `Review not found with id of ${req.params.id}`
      });
    }

    // Make sure review belongs to user
    if (review.mentee.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this review'
      });
    }

    // Update review
    review = await Review.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    // Update mentor's rating
    const allReviews = await Review.find({ mentor: review.mentor });
    const totalRating = allReviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / allReviews.length;

    await MentorProfile.findOneAndUpdate(
      { user: review.mentor },
      { rating: averageRating.toFixed(1) }
    );

    res.status(200).json({
      success: true,
      data: review
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete review
// @route   DELETE /api/reviews/:id
// @access  Private (owner of review or admin)
exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: `Review not found with id of ${req.params.id}`
      });
    }

    // Make sure review belongs to user or user is admin
    if (review.mentee.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this review'
      });
    }

    await Review.findByIdAndDelete(req.params.id);

    // Update mentor's rating
    const allReviews = await Review.find({ mentor: review.mentor });
    
    if (allReviews.length > 0) {
      const totalRating = allReviews.reduce((sum, review) => sum + review.rating, 0);
      const averageRating = totalRating / allReviews.length;

      await MentorProfile.findOneAndUpdate(
        { user: review.mentor },
        { 
          rating: averageRating.toFixed(1),
          reviews: allReviews.length
        }
      );
    } else {
      await MentorProfile.findOneAndUpdate(
        { user: review.mentor },
        { 
          rating: 0,
          reviews: 0
        }
      );
    }

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