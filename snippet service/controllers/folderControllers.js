const folder = require("../models/folder");

exports.addFolder = async (req, res) => {
  try {
    const parentId = req.params.id;
    const { folderName, folderType } = req.body;
    if (parentId === "root") {
      const newFolder = await folder.create({
        folderName,
        folderType,
        owner: req.userId,
      });
      return res.status(200).json(newFolder);
    }
    const newFolder = await folder.create({
      parentId,
      folderName,
      folderType,
      owner: req.userId,
    });
    const parentFolder = await folder.findById(parentId);
    if (!parentFolder)
      return res.status(400).json({ message: "Illegal Folder" });

    // Check if user owns the parent folder
    if (parentFolder.owner.toString() !== req.userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    parentFolder.children.push(newFolder._id);
    parentFolder.childrenModel.push("Folder");
    await parentFolder.save();
    return res.status(200).json(newFolder);
  } catch (error) {
    return res.status(400).json({ message: "Illegal Folder" });
  }
};

exports.deleteFolder = async (req, res) => {
  //todo: orphange children should also be deleted
  try {
    const folderId = req.params.id;
    if (!folderId) {
      return res.status(400).json({ message: "Invalid Request" });
    }
    const deletingFolder = await folder.findById(folderId);

    if (!deletingFolder) {
      return res.status(404).json({ message: "Folder not found" });
    }

    if (deletingFolder.owner.toString() !== req.userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    if (deletingFolder.parentId) {
      const parent = await folder.findById(deletingFolder.parentId);
      const childIndex = parent.children.indexOf(deletingFolder._id);
      if (childIndex > -1) {
        parent.children.splice(childIndex, 1);
        parent.childrenModel.splice(childIndex, 1);
      }
      await parent.save();
    }

    await folder.deleteOne({ _id: deletingFolder._id });
    return res.status(200).json({ message: "Folder deleted successfully" });
  } catch (error) {
    return res.status(400).json({ message: "Invalid Request" });
  }
};
