const mongoose = require("mongoose");

const snippetSchema = new mongoose.Schema({
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Folder",
  },
  folderName: {
    type: String,
    required: true,
    maxlength: 20,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  code: {
    type: String,
  },
  language : {
    type: String,
    default: "javascript",
  },
  folderType: {
    type: String,
    default: "snippet",
    enum: ["folder", "snippet"],
  },
});

module.exports = mongoose.model("Snippet", snippetSchema);
