import { useNavigate } from "react-router-dom";
import { useForm, SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormField,
} from "../components/ui/form";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../components/ui/card";
import { toast } from "react-hot-toast";
import { Link } from "react-router-dom";

const loginSchema = z.object({
  email: z.string().email("Email is required"),
  password: z.string().min(1, "Password is required"),
});

type LoginSchema = z.infer<typeof loginSchema>;

export default function Login() {
  const navigate = useNavigate();
  const form = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit: SubmitHandler<LoginSchema> = async (data) => {
    toast.loading("Logging in...");
    try {
      const response = await fetch("http://localhost:3000/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
        credentials: "include",
      });

      const result = await response.json();

      if (!response.ok) {
        toast.dismiss();
        toast.error(
          result.message || "Login failed. Please check your credentials.",
        );
        return;
      }

      toast.dismiss();
      toast.success(`Welcome back!`);
      navigate("/");
    } catch (error) {
      toast.dismiss();
      toast.error(
        "An error occurred while logging in. Please try again later.",
      );
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-wbd-background text-wbd-text">
      <Card className="max-w-md w-full bg-wbd-secondary shadow-md">
        <CardHeader className="text-center border-b border-wbd-highlight">
          <CardTitle className="text-wbd-primary text-2xl font-bold">
            Login
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-wbd-tertiary">Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="Email"
                        {...field}
                        className="border-wbd-tertiary focus:ring-wbd-highlight focus:border-wbd-highlight"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-wbd-tertiary">
                      Password
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Password"
                        {...field}
                        className="border-wbd-tertiary focus:ring-wbd-highlight focus:border-wbd-highlight"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full mt-8 bg-wbd-primary text-white hover:bg-wbd-tertiary"
              >
                Login
              </Button>

              <div className="text-center mt-4">
                <p className="text-wbd-tertiary">
                  Don't have an account?{" "}
                  <Link
                    to="/register"
                    className="font-medium text-wbd-primary hover:underline"
                  >
                    Register here
                  </Link>
                </p>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
