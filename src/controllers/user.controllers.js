import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import { User} from "../models/user.models.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import {ApiResponse} from "../utils/ApiResponse.js"

const registerUser = asyncHandler(async (req, res) => {

  // get user details from frontend

  const { fullName, email, username, password } = req.body;
  console.log("email:", email);

  // validation not-empty

  if (
    [fullName, email, username, password].some((field) => 
    field?.trim() === "")
  ) {
    throw new ApiError (400, "All fields are required")
  }

  // check if user already exist username, email

  const existUser = await User.findOne({
    $or: [{ username }, { email }]
  })

  if (existUser) {
    throw new ApiError(409, "User with email or username already exist")
  }

  // check for images , check for avatar

  const avatarLocalPath = req.files?.avatar[0]?.path
  const CoverImageLocalPath = req.files?.CoverImage[0]?.path

  if (!avatarLocalPath) {
    throw new ApiError(400,"Avatar file is required");
    
  }

  // upload them to cloudinary, avatar

  const avatar = await uploadOnCloudinary(avatarLocalPath)
  const CoverImage = await uploadOnCloudinary(CoverImageLocalPath)

  if (!avatar) {
    throw new ApiError(400,"Avatar file is required");
    
  }

  // create user object - create entry in db

  const user = await User.create({
    fullName,
    avatar: avatar.url,
    CoverImage: CoverImage?.url || "",
    email,
    password,
    username: username.toLowerCase()
  })

  // remove password and refersh token field from response

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  )

  // check for user creation

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user")
  }

  // return response - res

  return res.status(201).json(
    new ApiResponse(200, createdUser, "User registered Successfully")
  )

});

export { registerUser };