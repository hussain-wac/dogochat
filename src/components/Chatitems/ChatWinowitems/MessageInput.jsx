import React from "react";
import ImageEditorModal from "../../common/ImageEditorModal";
import useMessageinput from "../../../hooks/useMessageinput";
import ImagePreview from "./InputItems/ImagePreview";
import ActionButtons from "./InputItems/ActionButtons";
import MessageInputField from "./InputItems/MessageInputField";
import SendButton from "./InputItems/SendButton";

const MessageInput = ({ newMessage, setNewMessage, sendMessage, chatId }) => {
  const {
    editingIndex,
    setEditingIndex,
    isSendingImages,
    fileInputRef,
    handleStartRecording,
    handleStopRecording,
    handleSend,
    handleFileChange,
    handleEditComplete,
    removeImage,
    status,
    error,
    selectedImages,
    setShowEmojiPicker,
    handleEmojiClick,
    handleTyping,
    showEmojiPicker,
  } = useMessageinput(newMessage, setNewMessage, sendMessage, chatId);

  return (
    <>
      <ImageEditorModal
        open={editingIndex !== null}
        image={selectedImages[editingIndex]}
        onClose={() => setEditingIndex(null)}
        onComplete={handleEditComplete}
      />

      <div className="p-3 z-10 border-t dark:border-neutral-700 bg-white  dark:bg-neutral-900 left-0 bottom-0 w-full">
        <div className="max-w-3xl mx-auto">
          <ImagePreview
            selectedImages={selectedImages}
            removeImage={removeImage}
            setEditingIndex={setEditingIndex}
          />

          <div className="flex items-center space-x-2">
            <ActionButtons
              fileInputRef={fileInputRef}
              handleFileChange={handleFileChange}
              showEmojiPicker={showEmojiPicker}
              setShowEmojiPicker={setShowEmojiPicker}
              handleEmojiClick={handleEmojiClick}
            />

            <MessageInputField
              newMessage={newMessage}
              setNewMessage={setNewMessage}
              handleTyping={handleTyping}
              handleSend={handleSend}
              isSendingImages={isSendingImages}
            />

            <SendButton
              newMessage={newMessage}
              selectedImages={selectedImages}
              handleSend={handleSend}
              isSendingImages={isSendingImages}
              handleStartRecording={handleStartRecording}
              handleStopRecording={handleStopRecording}
              status={status}
              error={error}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default MessageInput;