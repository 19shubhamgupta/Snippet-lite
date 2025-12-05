const mongoose = require("mongoose");

const folderSchema = new mongoose.Schema({
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Folder",
  },
  folderName: {
    type: String,
    required: true,
    maxlength: 20,
  },

  children: [
    {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "childrenModel", // <-- dynamic reference
    },
  ],

  childrenModel: [
    {
      type: String,
      required: true,
      enum: ["Folder", "Snippet"], // <-- allowed models
    },
  ],

  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  folderType: {
    type: String,
    required: true,
    enum: ["folder", "snippet"],
  },
});

// Fix Issue 4: Allow same folder names for different users/parents
folderSchema.index({ folderName: 1, parentId: 1, owner: 1 }, { unique: true });

module.exports = mongoose.model("Folder", folderSchema);
