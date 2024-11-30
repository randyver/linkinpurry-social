import { Card, CardContent, CardHeader } from "./ui/card";

interface FeedCardProps {
  profilePhoto: string;
  fullname: string;
  date: string;
  content: string;
}

export const FeedCard = ({ profilePhoto, fullname, date, content }: FeedCardProps) => {
  return (
    <Card className="border border-gray-200 rounded-lg shadow-sm">
      <CardHeader className="flex items-center space-x-4 p-4 border-b border-gray-200">
        <img
          src={profilePhoto}
          alt={`${fullname}'s profile`}
          className="w-12 h-12 rounded-full"
        />
        <div>
          <h3 className="text-lg font-semibold text-gray-800">{fullname}</h3>
          <p className="text-sm text-gray-500">{date}</p>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <p className="text-gray-600 text-sm">{content}</p>
      </CardContent>
    </Card>
  );
};