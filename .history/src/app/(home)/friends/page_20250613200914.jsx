import { Button } from '@/components/ui/button';
import Avatar from '@/components/ui-components/Avatar';
import { User } from '@/types/user';

interface FriendCardProps {
  user: User;
  isFriend?: boolean;
  isBlocked?: boolean;
  onAddFriend?: () => void;
  onUnfriend?: () => void;
  onUnblock?: () => void;
}

export default function FriendCard({
  user,
  isFriend = false,
  isBlocked = false,
  onAddFriend,
  onUnfriend,
  onUnblock,
}: FriendCardProps) {
  return (
    <div className="border rounded-lg p-4 flex flex-col items-center gap-3">
      <Avatar 
        src={user.profilePictureUrl} 
        size="lg" 
        className="w-20 h-20"
      />
      <div className="text-center">
        <h3 className="font-semibold">{user.username}</h3>
        <p className="text-sm text-gray-500">{user.bio || 'Không có tiểu sử'}</p>
      </div>
      
      <div className="flex gap-2 mt-2">
        {isFriend ? (
          <Button 
            variant="outline" 
            onClick={onUnfriend}
            className="text-red-600"
          >
            Hủy kết bạn
          </Button>
        ) : isBlocked ? (
          <Button 
            variant="outline" 
            onClick={onUnblock}
          >
            Bỏ chặn
          </Button>
        ) : (
          <Button onClick={onAddFriend}>
            Thêm bạn
          </Button>
        )}
      </div>
    </div>
  );
}