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
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";

import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

const registerSchema = z
  .object({
    username: z.string().min(1, "Username is required"),
    name: z.string(),
    email: z.string().min(1, "Email is required").email("Invalid email format"),
    password: z.string().min(1, "Password is required"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

type FormValues = z.infer<typeof registerSchema>;

export default function Register() {
  const methods = useForm<FormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const {
    handleSubmit,
    formState: { errors },
  } = methods;

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    const { confirmPassword, ...payload } = data;

    const toastId = toast.loading("Registering user...");

    try {
      const response = await fetch("http://localhost:3000/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        toast.success("User registered successfully", { id: toastId });
        navigate("/login");
      } else {
        const errorData = await response.json();
        toast.error(`Failed to register user: ${errorData.error}`, {
          id: toastId,
        });
      }
    } catch (error) {
      toast.error("An error occurred during registration", { id: toastId });
    }
  };

  const navigate = useNavigate();

  return (
    <div className="flex justify-center items-center min-h-screen bg-wbd-background text-wbd-text">
      <Card className="max-w-md w-full bg-wbd-secondary shadow-md">
        <CardHeader className="text-center border-b border-wbd-highlight">
          <CardTitle className="text-wbd-primary text-2xl font-bold">
            Register
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <Form {...methods}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                name="username"
                control={methods.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="username" className="text-wbd-tertiary">
                      Username
                    </FormLabel>
                    <FormControl>
                      <Input
                        id="username"
                        {...field}
                        placeholder="Username"
                        className="bg-white border border-wbd-highlight focus:ring-wbd-highlight"
                      />
                    </FormControl>
                    <FormMessage className="text-wbd-red">
                      {errors.username?.message}
                    </FormMessage>
                  </FormItem>
                )}
              />
              <FormField
                name="name"
                control={methods.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="name" className="text-wbd-tertiary">
                      Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        id="name"
                        {...field}
                        placeholder="Name"
                        className="bg-white border border-wbd-highlight focus:ring-wbd-highlight"
                      />
                    </FormControl>
                    <FormMessage className="text-wbd-red">
                      {errors.name?.message}
                    </FormMessage>
                  </FormItem>
                )}
              />
              <FormField
                name="email"
                control={methods.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="email" className="text-wbd-tertiary">
                      Email
                    </FormLabel>
                    <FormControl>
                      <Input
                        id="email"
                        {...field}
                        placeholder="Email"
                        className="bg-white border border-wbd-highlight focus:ring-wbd-highlight"
                      />
                    </FormControl>
                    <FormMessage className="text-wbd-red">
                      {errors.email?.message}
                    </FormMessage>
                  </FormItem>
                )}
              />
              <FormField
                name="password"
                control={methods.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="password" className="text-wbd-tertiary">
                      Password
                    </FormLabel>
                    <FormControl>
                      <Input
                        id="password"
                        type="password"
                        {...field}
                        placeholder="Password"
                        className="bg-white border border-wbd-highlight focus:ring-wbd-highlight"
                      />
                    </FormControl>
                    <FormMessage className="text-wbd-red">
                      {errors.password?.message}
                    </FormMessage>
                  </FormItem>
                )}
              />
              <FormField
                name="confirmPassword"
                control={methods.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel
                      htmlFor="confirmPassword"
                      className="text-wbd-tertiary"
                    >
                      Confirm Password
                    </FormLabel>
                    <FormControl>
                      <Input
                        id="confirmPassword"
                        type="password"
                        {...field}
                        placeholder="Confirm Password"
                        className="bg-white border border-wbd-highlight focus:ring-wbd-highlight"
                      />
                    </FormControl>
                    <FormMessage className="text-wbd-red">
                      {errors.confirmPassword?.message}
                    </FormMessage>
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full bg-wbd-primary text-white hover:bg-wbd-tertiary"
              >
                Register
              </Button>

              <div className="text-center mt-4">
                <p className="text-wbd-tertiary">
                  Already have an account?{" "}
                  <Link
                    to="/login"
                    className="font-medium text-wbd-primary hover:underline"
                  >
                    Login here
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
