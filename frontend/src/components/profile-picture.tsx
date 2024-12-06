type ProfilePictureProps = {
  src: string
}

export const ProfilePicture = ({ src }: ProfilePictureProps) => {
  return (
    <div className='lg rounded-full overflow-hidden border-4 border-white w-24 h-24'>
      <img
        src={src}
        alt="Profile"
        className="w-full h-full object-cover"
      />
    </div>
  );
};