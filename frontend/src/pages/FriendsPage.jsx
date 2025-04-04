import { useEffect, useState } from "react";
import { useFriendStore } from "../store/useFriendStore";
import { useAuthStore } from "../store/useAuthStore";

// 默认头像URL
const DEFAULT_AVATAR = "/avatar.png"; // 假设这是系统默认头像的路径

const FriendsPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("friends"); // friends, search, sent, received
  const authUser = useAuthStore((state) => state.authUser);
  const {
    friends,
    searchResults,
    sentRequests,
    receivedRequests,
    isSearching,
    isLoadingFriends,
    isLoadingRequests,
    searchForUsers,
    loadFriends,
    loadFriendRequests,
    sendRequest,
    acceptRequest,
    cancelRequest,
    clearSearchResults,
  } = useFriendStore();

  // 加载初始数据
  useEffect(() => {
    if (activeTab === "friends") {
      loadFriends();
    } else if (activeTab === "sent") {
      loadFriendRequests("sent");
    } else if (activeTab === "received") {
      loadFriendRequests("received");
    }
  }, [activeTab, loadFriends, loadFriendRequests]);

  // 处理搜索
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      searchForUsers(searchQuery);
    }
  };

  // 切换标签时清除搜索结果
  useEffect(() => {
    if (activeTab !== "search") {
      clearSearchResults();
      setSearchQuery("");
    }
  }, [activeTab, clearSearchResults]);

  // 处理图片加载错误，使用默认头像
  const handleImageError = (e) => {
    e.target.src = DEFAULT_AVATAR;
  };

  // 确保receivedRequests始终是数组
  const safeReceivedRequests = Array.isArray(receivedRequests)
    ? receivedRequests
    : [];
  const safeSentRequests = Array.isArray(sentRequests) ? sentRequests : [];
  const safeFriends = Array.isArray(friends) ? friends : [];
  const safeSearchResults = Array.isArray(searchResults) ? searchResults : [];

  return (
    <div className="h-screen bg-base-200">
      <div className="flex items-center justify-center pt-20 px-4">
        <div className="bg-base-100 rounded-lg shadow-cl w-full max-w-4xl h-[calc(100vh-8rem)]">
          <div className="flex flex-col h-full rounded-lg overflow-hidden">
            {/* 标签导航 */}
            <div className="tabs tabs-boxed bg-base-200 p-2">
              <button
                className={`tab ${activeTab === "friends" ? "tab-active" : ""}`}
                onClick={() => setActiveTab("friends")}
              >
                我的好友
              </button>
              <button
                className={`tab ${activeTab === "search" ? "tab-active" : ""}`}
                onClick={() => setActiveTab("search")}
              >
                搜索用户
              </button>
              <button
                className={`tab ${
                  activeTab === "received" ? "tab-active" : ""
                }`}
                onClick={() => setActiveTab("received")}
              >
                收到的请求
                {safeReceivedRequests.length > 0 && (
                  <span className="badge badge-sm badge-primary ml-1">
                    {safeReceivedRequests.length}
                  </span>
                )}
              </button>
              <button
                className={`tab ${activeTab === "sent" ? "tab-active" : ""}`}
                onClick={() => setActiveTab("sent")}
              >
                发送的请求
              </button>
            </div>

            {/* 搜索栏 - 仅在搜索标签显示 */}
            {activeTab === "search" && (
              <div className="p-4 bg-base-100">
                <form onSubmit={handleSearch} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="搜索用户名或邮箱..."
                    className="input input-bordered w-full"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isSearching || !searchQuery.trim()}
                  >
                    {isSearching ? (
                      <span className="loading loading-spinner"></span>
                    ) : (
                      "搜索"
                    )}
                  </button>
                </form>
              </div>
            )}

            {/* 内容区域 */}
            <div className="flex-1 overflow-y-auto p-4">
              {/* 我的好友列表 */}
              {activeTab === "friends" && (
                <div className="space-y-4">
                  <h2 className="text-xl font-bold">我的好友</h2>
                  {isLoadingFriends ? (
                    <div className="flex justify-center">
                      <span className="loading loading-spinner loading-lg"></span>
                    </div>
                  ) : safeFriends.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      你还没有添加任何好友
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {safeFriends.map((friend) => (
                        <div
                          key={friend._id}
                          className="card bg-base-200 shadow-sm"
                        >
                          <div className="card-body p-4 flex flex-row items-center">
                            <div className="avatar">
                              <div className="w-12 rounded-full">
                                <img
                                  src={friend.profilePic || DEFAULT_AVATAR}
                                  alt={friend.fullName}
                                  onError={handleImageError}
                                />
                              </div>
                            </div>
                            <div className="ml-4 flex-1">
                              <h3 className="font-bold">{friend.fullName}</h3>
                              <p className="text-sm opacity-70">
                                {friend.email}
                              </p>
                            </div>
                            <button
                              className="btn btn-sm btn-error"
                              onClick={() =>
                                cancelRequest(friend._id, "friend")
                              }
                            >
                              移除
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* 搜索结果 */}
              {activeTab === "search" && (
                <div className="space-y-4">
                  <h2 className="text-xl font-bold">搜索结果</h2>
                  {isSearching ? (
                    <div className="flex justify-center">
                      <span className="loading loading-spinner loading-lg"></span>
                    </div>
                  ) : safeSearchResults.length === 0 ? (
                    searchQuery ? (
                      <div className="text-center py-8 text-gray-500">
                        未找到匹配的用户
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        输入用户名或邮箱进行搜索
                      </div>
                    )
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {safeSearchResults.map((user) => (
                        <div
                          key={user._id}
                          className="card bg-base-200 shadow-sm"
                        >
                          <div className="card-body p-4 flex flex-row items-center">
                            <div className="avatar">
                              <div className="w-12 rounded-full">
                                <img
                                  src={user.profilePic || DEFAULT_AVATAR}
                                  alt={user.fullName}
                                  onError={handleImageError}
                                />
                              </div>
                            </div>
                            <div className="ml-4 flex-1">
                              <h3 className="font-bold">{user.fullName}</h3>
                              <p className="text-sm opacity-70">{user.email}</p>
                            </div>
                            {user._id !== authUser._id && (
                              <>
                                {user.isFriend ? (
                                  <span className="badge badge-success">
                                    已是好友
                                  </span>
                                ) : user.requestSent ? (
                                  <button
                                    className="btn btn-sm btn-outline"
                                    onClick={() =>
                                      cancelRequest(user._id, "sent")
                                    }
                                  >
                                    取消请求
                                  </button>
                                ) : user.requestReceived ? (
                                  <button
                                    className="btn btn-sm btn-primary"
                                    onClick={() => acceptRequest(user._id)}
                                  >
                                    接受请求
                                  </button>
                                ) : (
                                  <button
                                    className="btn btn-sm btn-primary"
                                    onClick={() => sendRequest(user._id)}
                                  >
                                    添加好友
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* 收到的好友请求 */}
              {activeTab === "received" && (
                <div className="space-y-4">
                  <h2 className="text-xl font-bold">收到的好友请求</h2>
                  {isLoadingRequests ? (
                    <div className="flex justify-center">
                      <span className="loading loading-spinner loading-lg"></span>
                    </div>
                  ) : safeReceivedRequests.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      没有收到的好友请求
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {safeReceivedRequests.map((request) => (
                        <div
                          key={request._id}
                          className="card bg-base-200 shadow-sm"
                        >
                          <div className="card-body p-4 flex flex-row items-center">
                            <div className="avatar">
                              <div className="w-12 rounded-full">
                                <img
                                  src={request.profilePic || DEFAULT_AVATAR}
                                  alt={request.fullName}
                                  onError={handleImageError}
                                />
                              </div>
                            </div>
                            <div className="ml-4 flex-1">
                              <h3 className="font-bold">{request.fullName}</h3>
                              <p className="text-sm opacity-70">
                                {request.email}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <button
                                className="btn btn-sm btn-primary"
                                onClick={() => acceptRequest(request._id)}
                              >
                                接受
                              </button>
                              <button
                                className="btn btn-sm btn-outline"
                                onClick={() =>
                                  cancelRequest(request._id, "received")
                                }
                              >
                                拒绝
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* 发送的好友请求 */}
              {activeTab === "sent" && (
                <div className="space-y-4">
                  <h2 className="text-xl font-bold">发送的好友请求</h2>
                  {isLoadingRequests ? (
                    <div className="flex justify-center">
                      <span className="loading loading-spinner loading-lg"></span>
                    </div>
                  ) : safeSentRequests.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      没有发送的好友请求
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {safeSentRequests.map((request) => (
                        <div
                          key={request._id}
                          className="card bg-base-200 shadow-sm"
                        >
                          <div className="card-body p-4 flex flex-row items-center">
                            <div className="avatar">
                              <div className="w-12 rounded-full">
                                <img
                                  src={request.profilePic || DEFAULT_AVATAR}
                                  alt={request.fullName}
                                  onError={handleImageError}
                                />
                              </div>
                            </div>
                            <div className="ml-4 flex-1">
                              <h3 className="font-bold">{request.fullName}</h3>
                              <p className="text-sm opacity-70">
                                {request.email}
                              </p>
                            </div>
                            <button
                              className="btn btn-sm btn-outline"
                              onClick={() => cancelRequest(request._id, "sent")}
                            >
                              取消请求
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FriendsPage;
