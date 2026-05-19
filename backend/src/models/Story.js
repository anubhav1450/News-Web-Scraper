import mongoose from "mongoose";

const storySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },

    url: {
      type: String,
    },

    points: {
      type: Number,
      default: 0,
    },

    author: {
      type: String,
    },

    postedAt: {
      type: String,
    },
    minutesAgo: {
    type: Number,
  },

    bookmarks: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Story = mongoose.model(
  "Story",
  storySchema
);

export default Story;