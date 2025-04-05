import { useChatStore } from "../store/useChatStore";

import Sidebar from "../components/Sidebar";
import NoChatSelected from "../components/NoChatSelected";
import ChatContainer from "../components/ChatContainer";
import GroupChatContainer from "../components/GroupChatContainer";
import SidebarControls from "../components/SidebarControls";

const HomePage = () => {
  const { selectedUser, selectedGroup } = useChatStore();
  const isChatSelected = selectedUser || selectedGroup;

  return (
    <div className="h-screen bg-base-200">
      <div className="flex items-center justify-center pt-20 lg:px-4 h-full">
        <div className="bg-base-100 rounded-lg shadow-cl w-full max-w-6xl h-full flex flex-col lg:flex-row overflow-hidden">
          <SidebarControls className="lg:hidden flex flex-col p-4 border-b border-base-300" />

          <div className="flex h-full w-full lg:overflow-hidden">
            <div
              className={`lg:flex ${
                isChatSelected ? "hidden" : "flex"
              } lg:w-72 w-full h-full`}
            >
              <Sidebar />
            </div>

            <div
              className={`flex-1 ${
                isChatSelected ? "flex" : "hidden"
              } lg:flex flex-col h-full`}
            >
              {!selectedUser && !selectedGroup ? (
                <NoChatSelected />
              ) : selectedGroup ? (
                <GroupChatContainer />
              ) : (
                <ChatContainer />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default HomePage;
