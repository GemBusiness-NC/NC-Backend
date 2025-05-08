import userModel from "../models/userModel.js"; 

export const getUserData = async (req, res) => {
  try {
    const { userId } = req.body; // Extract the userId from the request body

    // Validate if userId is provided
    if (!userId) {
      return res.json({
        success: false,
        message: "User ID is required",
      });
    }

    // Find the user by their ID in the database
    const user = await userModel.findById(userId);

    // Check if the user exists
    if (!user) {
      return res.json({
        success: false,
        message: "User not found",
      });
    }

    // Respond with user data (limiting to specific fields for security and privacy)
    return res.json({
      success: true,
      userData: {
        name: user.name,
        email: user.email,
        isAccountVerified: user.isAccountVerified,
      },
    });
  } catch (error) {
    // Handle server errors
    return res.json({
      success: false,
      message: `Server error: ${error.message}`,
    });
  }
};

// Get all users
export const getAllUsers = async (req, res) => {
  try {
    const users = await userModel.find({}, 'name email isAccountVerified isAdmin');

    // Map over users to convert isAdmin boolean to 'admin' or 'user'
    const mappedUsers = users.map(user => ({
      ...user.toObject(), // Convert Mongoose object to plain object
      role: user.isAdmin ? 'admin' : 'user', // Add role field based on isAdmin value
    }));

    return res.json({
      success: true,
      users: mappedUsers,
    });
  } catch (error) {
    return res.json({
      success: false,
      message: `Server error: ${error.message}`,
    });
  }
};


