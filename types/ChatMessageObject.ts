export default interface ChatMessage {
  userDisplayName: string;
  userProfilePicture: string;
  userRole: string | null;
  userUUID: string;
  messageContent: string;
  messageImageUrl: string;
  messageTime: number;
  messageId: number;
  isEdited: boolean;
}
