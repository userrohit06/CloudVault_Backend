import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
      maxLength: 50,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      minLength: 8,
      maxLength: 200,
    },
    profilePicture: {
      path: {
        type: String,
      },
      originalname: {
        type: String,
      },
      size: {
        type: Number,
      },
      mimetype: {
        type: String,
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    refreshToken: {
      type: String,
    },
    resetPasswordToken: {
      type: String,
    },
    resetPasswordExpires: {
      type: Date,
    },
    otp: {
      type: String,
    },
    otpExpires: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.pre("findOneAndUpdate", async function () {
  const update = this.getUpdate();

  if (update.$set?.password) {
    update.$set.password = await bcrypt.hash(update.$set.password, 10);
  } else if (update.password) {
    update.password = await bcrypt.hash(update.password, 10);
  }
});

const User = mongoose.model("User", userSchema);
export default User;
