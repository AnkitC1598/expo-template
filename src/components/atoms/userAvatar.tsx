import useAppStore from "@/store";
import Avatar, { AvatarFallback, AvatarImage } from "@/ui/avatar";

interface UserAvatarProps {
	size?: number;
	isSelf?: boolean;
	source?: string;
	alt?: string;
	squared?: boolean;
	borderLess?: boolean;
	containerClassName?: string;
}

const UserAvatar: React.FC<UserAvatarProps> = ({
	size = 48,
	isSelf = false,
	source = null,
	alt = null,
	squared = false,
	borderLess = false,
	containerClassName = "",
}) => {
	const avatarSource = useAppStore(
		(store) => source ?? (isSelf ? store.user?.profileImageUrl : null),
	);
	const avatarAlt = useAppStore(
		(store) =>
			alt ?? (isSelf ? store.user?.profileImageUrl : null) ?? "Unknown",
	) as string;

	return (
		<Avatar
			style={{ width: size, height: size }}
			{...{
				squared,
				borderLess,
				className: containerClassName,
			}}
		>
			<AvatarImage source={avatarSource} squared={squared} />
			<AvatarFallback alt={avatarAlt} squared={squared} />
		</Avatar>
	);
};

export default UserAvatar;
