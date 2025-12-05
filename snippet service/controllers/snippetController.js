const snippet = require("../models/snippet");
const folder = require("../models/folder");

exports.addSnippet = async (req, res) => {
  try {
    const id = req.params.id;
    const { folderName, folderType, language } = req.body;
    const newSnippet = await snippet.create({
      ...(id !== "root" ? { parentId: id } : {}),
      owner: req.userId,
      folderName,
      folderType,
      language,
    });

    // Add to parent folder's children array if not root
    if (id !== "root") {
      const parentFolder = await folder.findById(id);
      if (!parentFolder) {
        return res.status(404).json({ message: "Parent folder not found" });
      }
      if (parentFolder.owner.toString() !== req.userId) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      parentFolder.children.push(newSnippet._id);
      parentFolder.childrenModel.push("Snippet");
      await parentFolder.save();
    }

    return res.status(201).json(newSnippet);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// exports.addCode = async(req ,res) => {
//   const snipId = req.params.id;
//   const {code} = req.body;
//   if(code.trim() === "" || code === null) return res.status(401).json({message : "Inavlid Code"})
//   return res.status(201).json({message : "Code Saved"});
// }

exports.deleteSnippet = async (req, res) => {
  try {
    const id = req.params.id;
    const deletingSnippet = await snippet.findById(id);

    if (!deletingSnippet) {
      return res.status(404).json({ message: "Snippet not found" });
    }

    if (deletingSnippet.owner.toString() !== req.userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    if (deletingSnippet.parentId) {
      const parent = await folder.findById(deletingSnippet.parentId);
      if (parent) {
        const childIndex = parent.children.indexOf(deletingSnippet._id);
        if (childIndex > -1) {
          parent.children.splice(childIndex, 1);
          parent.childrenModel.splice(childIndex, 1);
        }
        await parent.save();
      }
    }
    await snippet.deleteOne({ _id: deletingSnippet._id });
    return res.status(200).json({ message: "Snippet deleted successfully" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.updateSnippet = async (req, res) => {
  try {
    const id = req.params.id;
    const { code , language } = req.body;
    const updatingSnippet = await snippet.findById(id);

    if (!updatingSnippet) {
      return res.status(404).json({ message: "Snippet not found" });
    }

    if (updatingSnippet.owner.toString() !== req.userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    updatingSnippet.code = code;
    updatingSnippet.language = language;
    await updatingSnippet.save();
    return res.status(200).json(updatingSnippet);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.getSnippet = async (req, res) => {
  try {
    const id = req.params.id;
    const codeSnippet = await snippet.findById(id);

    if (!codeSnippet) {
      return res.status(404).json({ message: "Snippet not found" });
    }

    if (codeSnippet.owner.toString() !== req.userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    return res.status(200).json({
      code : codeSnippet.code,
      language : codeSnippet.language
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.getrootsnippets = async (req, res) => {
  try {
    const userId = req.userId;
    console.log("Fetching root snippets for user:", userId);
    const rootContains = [];

    const extractNameandId = (items) => {
      return items.map((item) => ({
        id: item._id,
        name: item.folderName,
        type: item.folderType,
      }));
    };

    const getStruct = async (fid, childrenModelArray, index) => {
      const modelType = childrenModelArray
        ? childrenModelArray[index]
        : "Folder";

      if (modelType === "Snippet") {
        // This is a snippet, not a folder
        let s = await snippet.findById(fid);
        if (!s) {
          console.log("Snippet not found for id:", fid);
          return null;
        }
        return {
          id: s._id,
          name: s.folderName,
          type: s.folderType,
        };
      } else {
        // This is a folder
        let f = await folder.findById(fid);
        if (!f) {
          console.log("Folder not found for id:", fid);
          return null;
        }

        if (f.folderType != "snippet" && f.children && f.children.length > 0) {
          const children = await Promise.all(
            f.children.map(async (item, idx) => {
              return await getStruct(item, f.childrenModel, idx);
            })
          );
          return {
            id: f._id,
            name: f.folderName,
            type: f.folderType,
            children: children.filter((child) => child !== null), // Filter out any null results
          };
        } else {
          return {
            id: f._id,
            name: f.folderName,
            type: f.folderType,
          };
        }
      }
    };

    // Find all root folders (those with parentId: null)
    const rootFolderArr = await folder.find({
      parentId: null,
      owner: userId,
    });
    const rootSnippetsArr = await snippet.find({
      parentId: null,
      owner: userId,
    });

    // Process all root folders with their complete structure
    const folderStructures = await Promise.all(
      rootFolderArr.map(async (element, index) => {
        return await getStruct(element._id, null, index);
      })
    );

    rootContains.push(...folderStructures);
    extractNameandId(rootSnippetsArr).forEach((element) => {
      rootContains.push(element);
    });

    console.log("Root snippets for user:", userId, rootContains);
    res.status(200).json(rootContains);
  } catch (error) {
    console.log("Error fetching root snippets:", error);
    return res.status(500).json({ message: error.message });
  }
};
