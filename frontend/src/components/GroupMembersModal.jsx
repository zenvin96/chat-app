import { useState } from "react";
import { X, Search, Check } from "lucide-react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import toast from "react-hot-toast";

const GroupMembersModal = ({ isOpen, onClose, group }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const { users, addGroupMembers } = useChatStore();
  const { authUser } = useAuthStore();

  // Get list of current member IDs for filtering
  const currentMemberIds = group.members.map((member) =>
    typeof member === "object" ? member._id : member
  );

  // Filter users: exclude self, current members, and apply search term
  const filteredUsers = users.filter(
    (user) =>
      user._id !== authUser._id &&
      !currentMemberIds.includes(user._id) &&
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

  // Handle adding members
  const handleAddMembers = async () => {
    if (selectedUsers.length === 0) {
      toast.error("Please select at least one member");
      return;
    }

    setIsLoading(true);

    try {
      // Get IDs of selected users
      const memberIds = selectedUsers.map((user) => user._id);

      // Add members to the group
      await addGroupMembers(group._id, memberIds);

      toast.success("Members added successfully");
      onClose();
    } catch (error) {
      console.error("Failed to add group members:", error);
      toast.error("Failed to add members");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-base-100 rounded-lg shadow-xl w-[90%] max-w-md max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-base-300">
          <h2 className="text-lg font-medium">Group Members</h2>
          <button onClick={onClose} className="btn btn-ghost btn-sm btn-circle">
            <X className="size-5" />
          </button>
        </div>

        <div className="p-4 flex-1 overflow-auto">
          {/* Current members list */}
          <div className="mb-4">
            <h3 className="font-medium mb-2">
              Current Members ({currentMemberIds.length})
            </h3>
            <div className="space-y-2">
              {group.members.map((member) => {
                // Handle member as either ID string or object
                const memberId =
                  typeof member === "object" ? member._id : member;
                const memberObject =
                  typeof member === "object"
                    ? member
                    : users.find((u) => u._id === memberId) || {
                        _id: memberId,
                      };

                return (
                  <div
                    key={memberId}
                    className="flex items-center gap-3 p-2 rounded-lg"
                  >
                    <div className="avatar">
                      <div className="size-10 rounded-full">
                        <img
                          src={memberObject.profilePic || "/avatar.png"}
                          alt={memberObject.fullName || "Group Member"}
                        />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">
                        {memberObject.fullName || "Unknown User"}
                        {memberId === authUser._id && (
                          <span className="ml-1 text-green-500">(You)</span>
                        )}
                        {memberId === group.creator && (
                          <span className="ml-1 text-blue-500">(Creator)</span>
                        )}
                      </div>
                      {memberObject.email && (
                        <div className="text-sm text-zinc-400">
                          {memberObject.email}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Add new members section */}
          <div className="border-t border-base-300 pt-4 mt-4">
            <h3 className="font-medium mb-2">Add Members</h3>

            {/* Search input */}
            <div className="relative mb-3">
              <input
                type="text"
                className="input input-bordered w-full pl-9"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="size-5 absolute left-2 top-[50%] transform -translate-y-[50%] text-zinc-500" />
            </div>

            {/* Selected users */}
            {selectedUsers.length > 0 && (
              <div className="mb-3">
                <h4 className="text-sm font-medium mb-2">
                  Selected ({selectedUsers.length})
                </h4>
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

            {/* Available users list */}
            <div className="border rounded-lg overflow-hidden">
              <div className="max-h-48 overflow-y-auto">
                {filteredUsers.length === 0 ? (
                  <div className="p-3 text-center text-zinc-500">
                    No more users to add
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
                      <span className="flex-1 text-left">
                        <div className="font-medium">{user.fullName}</div>
                        <div className="text-sm text-zinc-400">
                          {user.email}
                        </div>
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
          </div>
        </div>

        <div className="p-4 border-t border-base-300 flex justify-between">
          <button onClick={onClose} className="btn btn-ghost">
            Cancel
          </button>
          <button
            onClick={handleAddMembers}
            className="btn btn-primary"
            disabled={isLoading || selectedUsers.length === 0}
          >
            {isLoading ? "Adding..." : "Add Members"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GroupMembersModal;
