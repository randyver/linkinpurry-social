import { ProfilePicture } from "./profile-picture";

type ProfileCardProps = {
  username: string;
  email: string;
  fullName: string;
  profilePhotoPath: string;
  connections: number;
};

export const ProfileCard = ({
  fullName,
  profilePhotoPath,
  connections,
}: ProfileCardProps) => {
  return (
    <div className="bg-white rounded-lg shadow mb-4">
      <img
        src="https://img.freepik.com/premium-photo/yellow-blue-abstract-creative-background-blue-abstract-background-geometric-background_481527-28134.jpg?semt=ais_hybrid"
        className="h-24 w-full rounded-t-lg object-cover"
        alt="Background"
      />
      <div className="px-4 pb-4">
        <div className="relative -mt-12 mb-4">
          <ProfilePicture size="lg" src={profilePhotoPath} />
        </div>
        <div className="mb-4">
          <h2 className="text-gray-900 text-xl font-bold">{fullName}</h2>
        </div>
        <div className="border-t border-b py-2 mb-4">
          <div className="text-sm">
            <p className="text-blue-600 hover:underline cursor-pointer">
              {connections} connections
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
