import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const loginHistorySchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  ipAddress: { type: String },
  userAgent: { type: String }
}, { _id: false });

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Please provide your full name"],
      trim: true
    },
    email: {
      type: String,
      required: [true, "Please provide your email address"],
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },
    passwordHash: {
      type: String,
      required: [true, "Password is required"]
    },
    avatar: {
      type: String,
      default: ""
    },
    role: {
      type: String,
      enum: ["Recruiter", "Admin", "Candidate"],
      default: "Recruiter"
    },
    emailVerified: {
      type: Boolean,
      default: false
    },
    resumeCredits: {
      type: Number,
      default: 5
    },
    subscriptionPlan: {
      type: String,
      enum: ["Free", "Pro", "Enterprise"],
      default: "Free"
    },
    activeRefreshTokens: {
      type: [
        {
          tokenHash: { type: String, required: true },
          createdAt: { type: Date, default: Date.now },
          expiresAt: { type: Date, required: true }
        }
      ],
      default: []
    },
    emailVerificationToken: { type: String },
    emailVerificationExpires: { type: Date },
    passwordResetToken: { type: String },
    passwordResetExpires: { type: Date },
    loginHistory: {
      type: [loginHistorySchema],
      default: []
    },
    lastLogin: { type: Date }
  },
  {
    timestamps: true // Auto creates createdAt and updatedAt fields
  }
);

// Mongoose pre-save hook to hash password automatically if modified
userSchema.pre("save", async function (next) {
  if (!this.isModified("passwordHash")) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Instance method to check password match
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.passwordHash);
};

export const User = mongoose.model("User", userSchema);
export default User;
