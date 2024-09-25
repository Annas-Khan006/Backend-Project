import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "Something went wrong while generating refresh and access token");
  }
};

const registerUser = asyncHandler(async (req, res) => {
  const { fullName, email, username, password } = req.body;

  // Validate input fields
  if ([fullName, email, username, password].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "All fields are required");
  }

  // Check if user already exists
  const existedUser = await User.findOne({ $or: [{ username }, { email }] });
  if (existedUser) {
    throw new ApiError(409, "User with email or username already exists");
  }

  // Check for avatar file
  const avatarLocalPath = req.files?.avatar?.[0]?.path; // Safely access avatar path
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  }

  // Handle cover image
  let coverImageLocalPath;
  if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }

  // Upload avatar to Cloudinary
  let avatar = null
  if (avatarLocalPath) {
  try {
    avatar = await uploadOnCloudinary(avatarLocalPath);




    if (!avatar || !avatar.url) {



      throw new ApiError(400, "Avatar upload failed: No URL returned");
    }

    
  } catch (error) {
    throw new ApiError(400, `Avatar upload: ${error.message}`);
  }
}

  // Upload cover image to Cloudinary if exists
  let coverImage = null;
  if (coverImageLocalPath) {
    try {
      coverImage = await uploadOnCloudinary(coverImageLocalPath);
      if (!coverImage || !coverImage.url) {
        throw new ApiError(400, "Cover image upload failed: No URL returned");
      }
    } catch (error) {
      throw new ApiError(400, `Cover image upload failed: ${error.message}`);
    }
  }

  // Create user in database
  let user;
  try {
    user = await User.create({
      fullName,
      avatar: avatar.url,
      coverImage: coverImage?.url || "",
      email,
      password,
      username: username.toLowerCase()
    });
  } catch (error) {
    throw new ApiError(500, "Something went wrong while registering the user: " + error.message);
  }

  const createdUser = await User.findById(user._id).select("-password -refreshToken");
  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while retrieving the created user");
  }

  return res.status(201).json(new ApiResponse(200, createdUser, "User registered successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Validate email and password
  if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
  }

  // Check if user exists
  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.correctPassword(password, user.password))) {
    throw new ApiError(401, "Incorrect email or password");
  }

  // Generate tokens
  const tokens = await generateAccessAndRefreshTokens(user._id);

  return res.status(200).json(new ApiResponse(200, { user, tokens }, "User logged in successfully"));
});

// Exporting functions
export { registerUser, loginUser };
