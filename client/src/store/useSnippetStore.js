import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

export const useSnippetStore = create((set, get) => ({
  fetchingRootSnippets: false,
  isCreatingNewFile: false,
  isSelectedSnippet: null,
  selectedSnippetCode:
    '// Welcome to the code editor\nconsole.log("Hello, World!");',
  selectedSnippetLanguage: "javascript",
  rootSnippets: [],
  getSnippet: async (snippetId) => {
    try {
      console.log("Fetching snippet with ID:", snippetId);
      const res = await axiosInstance.get(
        `/snippet/snipp/get-snippet/${snippetId}`
      );
      set({
        selectedSnippetCode: res.data.code,
        selectedSnippetLanguage: res.data.language,
      });
    } catch (error) {
      toast.error("Failed to fetch snippet");
    }
  },

  getOutput: async (language, code) => {
    let sid = useSnippetStore.getState().isSelectedSnippet;
    if (sid === null) {
      toast.error("No snippet selected to save");
      return;
    }
    try {
      if (
        get().selectedSnippetLanguage === language &&
        get().selectedSnippetCode === code
      ) {
        const res = await axiosInstance.post(
          `/execution/execute/${sid}`
        );
        console.log("execution result : ",res.data)
        return res.data;
      } else {
        await get().saveSnippet(language, code);
        const res = await axiosInstance.post(`/execution/execute/${sid}`);
        console.log("execution result : ",res.data)
        return res.data;
      }
      
    } catch (err) {
      if (err.response) {
        toast.error(err.response.data?.message || "Failed to create");
      } else {
        console.log(err);
        toast.error("Network error — please try again");
      }
    }
  },
  saveSnippet: async (language, code) => {
    try {
      if (useSnippetStore.getState().isSelectedSnippet === null) {
        toast.error("No snippet selected to save");
        return;
      }
      const res = await axiosInstance.post(
        `/snippet/snipp/update-snippet/${
          useSnippetStore.getState().isSelectedSnippet
        }`,
        {
          code,
          language,
        }
      );
    } catch (err) {
      if (err.response) {
        toast.error(err.response.data?.message || "Failed to create");
      } else {
        toast.error("Network error — please try again");
      }
    }
  },
  fetchRootSnippets: async () => {
    set({ fetchingRootSnippets: true });
    try {
      console.log("Fetching root snippets...");
      const res = await axiosInstance.get("/snippet/snipp/getrootsnippets");
      set({ rootSnippets: res.data });
      console.log("Root snippets fetched successfully.", res.data);
    } catch (error) {
      toast.error("Failed to fetch root snippets");
    } finally {
      set({ fetchingRootSnippets: false });
    }
  },

  createNewFolder: async (parentId, folderName) => {
    try {
      set({ isCreatingNewFile: true });
      await axiosInstance.post(`/snippet/folder/add-folder/${parentId}`, {
        folderName: folderName,
        folderType: "folder",
      });
    } catch (err) {
      if (err.response) {
        toast.error(err.response.data?.message || "Failed to create");
      } else {
        toast.error("Network error — please try again");
      }
    } finally {
      set({ isCreatingNewFile: false });
    }
  },

  createNewSnippet: async (parentId, folderName, language) => {
    try {
      set({ isCreatingNewFile: true });
      await axiosInstance.post(`/snippet/snipp/add-snippet/${parentId}`, {
        folderName,
        folderType: "snippet",
        language,
      });
    } catch (err) {
      if (err.response) {
        toast.error(err.response.data?.message || "Failed to create");
      } else {
        toast.error("Network error — please try again");
      }
    } finally {
      set({ isCreatingNewFile: false });
    }
  },
}));
