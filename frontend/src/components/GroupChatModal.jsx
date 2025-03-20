import { useState, useEffect } from "react";
import { X, Users, Check, Search, Image } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import toast from "react-hot-toast";

const GroupChatModal = ({ isOpen, onClose, users }) => {
  const [groupName, setGroupName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [groupPic, setGroupPic] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const { authUser } = useAuthStore();

  // We need to add createGroup method in the store
  // Assuming it's already been added
  const { createGroup } = useChatStore();

  // Reset all states when modal is closed
  useEffect(() => {
    if (!isOpen) {
      setGroupName("");
      setSelectedUsers([]);
      setSearchTerm("");
      setGroupPic(null);
    }
  }, [isOpen]);

  // Filter users: exclude self and apply search term
  const filteredUsers = users.filter(
    (user) =>
      user._id !== authUser._id &&
      user.fullName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle user selection/deselection
  const handleUserToggle = (user) => {
    if (selectedUsers.find((u) => u._id === user._id)) {
      setSelectedUsers(selectedUsers.filter((u) => u._id !== user._id));
    } else {
      setSelectedUsers([...selectedUsers, user]);
    }
  };

  // Handle image upload preview
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setGroupPic(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // Create group chat
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (groupName.trim() === "") {
      toast.error("Please enter a group name");
      return;
    }

    if (selectedUsers.length === 0) {
      toast.error("Please select at least one member");
      return;
    }

    setIsUploading(true);

    try {
      // Get IDs of selected users
      const memberIds = selectedUsers.map((user) => user._id);

      // Create group chat
      await createGroup({
        name: groupName,
        members: memberIds,
        groupPic: groupPic,
      });

      toast.success("Group created successfully");
      onClose();
    } catch (error) {
      console.error("Failed to create group:", error);
      toast.error("Failed to create group");
    } finally {
      setIsUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-base-100 rounded-lg shadow-xl w-[90%] max-w-md max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-base-300">
          <h2 className="text-lg font-medium flex items-center gap-2">
            <Users className="size-5" />
            Create Group
          </h2>
          <button onClick={onClose} className="btn btn-ghost btn-sm btn-circle">
            <X className="size-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-auto p-4">
          {/* Group name input */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Group Name</label>
            <input
              type="text"
              className="input input-bordered w-full"
              placeholder="Enter group name"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              required
            />
          </div>

          {/* Group avatar upload */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">
              Group Avatar
            </label>
            <div className="flex items-center gap-3">
              <div className="size-16 rounded-full bg-base-300 flex items-center justify-center overflow-hidden border border-base-300">
                {groupPic ? (
                  <img
                    src={groupPic}
                    alt="Group avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Users className="size-8 text-zinc-500" />
                )}
              </div>
              <label className="btn btn-sm btn-outline">
                <Image className="size-4 mr-1" />
                Select Image
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </label>
              {groupPic && (
                <button
                  type="button"
                  className="btn btn-sm btn-ghost"
                  onClick={() => setGroupPic(null)}
                >
                  Delete
                </button>
              )}
            </div>
          </div>

          {/* Search users */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">
              Add Members
            </label>
            <div className="relative">
              <input
                type="text"
                className="input input-bordered w-full pl-9"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="size-5 absolute left-2 top-[50%] transform -translate-y-[50%] text-zinc-500" />
            </div>
          </div>

          {/* Selected members */}
          {selectedUsers.length > 0 && (
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">
                Selected Members ({selectedUsers.length})
              </label>
              <div className="flex flex-wrap gap-2">
                {selectedUsers.map((user) => (
                  <div key={user._id} className="badge badge-lg gap-1 py-3">
                    <img
                      src={user.profilePic || "/avatar.png"}
                      alt={user.fullName}
                      className="size-5 rounded-full mr-1"
                    />
                    {user.fullName}
                    <button
                      type="button"
                      onClick={() => handleUserToggle(user)}
                      className="btn btn-xs btn-ghost btn-circle ml-1"
                    >
                      <X className="size-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* User list */}
          <div className="border rounded-lg overflow-hidden mb-4">
            <div className="max-h-48 overflow-y-auto">
              {filteredUsers.length === 0 ? (
                <div className="p-3 text-center text-zinc-500">
                  No users found
                </div>
              ) : (
                filteredUsers.map((user) => (
                  <button
                    key={user._id}
                    type="button"
                    className="flex items-center gap-3 w-full p-3 hover:bg-base-200 transition"
                    onClick={() => handleUserToggle(user)}
                  >
                    <div className="relative">
                      <img
                        src={user.profilePic || "/avatar.png"}
                        alt={user.fullName}
                        className="size-10 rounded-full object-cover"
                      />
                    </div>
                    <span className="flex-1 text-left font-medium">
                      {user.fullName}
                    </span>
                    <div
                      className={`size-6 rounded-full flex items-center justify-center transition-colors ${
                        selectedUsers.find((u) => u._id === user._id)
                          ? "bg-blue-500 text-white"
                          : "bg-base-300"
                      }`}
                    >
                      {selectedUsers.find((u) => u._id === user._id) && (
                        <Check className="size-4" />
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </form>

        <div className="p-4 border-t border-base-300 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="btn btn-ghost">
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            className="btn btn-primary"
            disabled={
              isUploading ||
              groupName.trim() === "" ||
              selectedUsers.length === 0
            }
          >
            {isUploading ? "Creating..." : "Create Group"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GroupChatModal;
