import { Button } from "../components/ui/button";

export default function Test() {
  return (
    <div className="bg-blue-100 p-4">
      <h1 className="text-2xl font-bold text-blue-600">Hello World!</h1>
      <p className="text-blue-800">Welcome to Hono!</p>
      <Button>Click me!</Button>
    </div>
  );
}
