import { ProfilePicture } from "./profile-picture";

type ProfileCardProps = {
  username: string;
  email: string;
  fullName: string;
  profilePhotoPath: string;
};

export const ProfileCard = ({
  fullName,
  profilePhotoPath,
}: ProfileCardProps) => {
  return (
    <div className="bg-white rounded-lg shadow mb-4">
      <div className="bg-gradient-to-r from-wbd-primary to-wbd-tertiary h-20 relative rounded-tr-lg rounded-tl-lg"></div>
      <div className="px-4 pb-4">
        <div className="relative -mt-12 mb-4">
          <ProfilePicture src={profilePhotoPath} />
        </div>
        <div className="mb-4">
          <h2 className="text-gray-900 text-xl font-bold">{fullName}</h2>
        </div>
      </div>
    </div>
  );
};
