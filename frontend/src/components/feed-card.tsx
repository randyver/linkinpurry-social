import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";

interface FeedCardProps {
  title: string;
  description: string;
  date: string;
}

export const FeedCard = ({ title, description, date }: FeedCardProps) => {
  return (
    <Card className="border border-gray-200 rounded-lg shadow-sm">
      <CardHeader className="p-4 border-b border-gray-200">
        <CardTitle className="text-lg font-semibold text-gray-800">{title}</CardTitle>
        <CardDescription className="text-sm text-gray-500">{date}</CardDescription>
      </CardHeader>
      <CardContent className="p-4">
        <p className="text-gray-600 text-sm">{description}</p>
      </CardContent>
    </Card>
  );
};