import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      default: null
    },
    // OAuth fields
    provider: {
      type: String,
      enum: ["local", "google"],
      default: "local"
    },
    providerId: {
      type: String,
      default: null
    },
    avatar: {
      type: String,
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Password is only required for local users
userSchema.pre("validate", function (next) {
  if (this.provider === "local" && !this.password) {
    this.invalidate("password", "Password is required for local accounts.");
  }
  next();
});

export default mongoose.model("User", userSchema);
