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

const registerSchema = z
  .object({
    username: z.string().min(1, "Username is required"),
    name: z.string(),
    email: z.string().email("Invalid email format"),
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

    const response = await fetch("http://localhost:3000/api/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      alert("User registered successfully");
    } else {
      const errorData = await response.json();
      alert(`Failed to register user: ${errorData.error}`);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 text-wbd-text">
      <div className="bg-white p-8 rounded shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-gray-700">Register User</h2>
        <Form {...methods}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <FormField
              name="username"
              control={methods.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="username">Username</FormLabel>
                  <FormControl>
                    <Input id="username" {...field} placeholder="Username" />
                  </FormControl>
                  <FormMessage>{errors.username?.message}</FormMessage>
                </FormItem>
              )}
            />
            <FormField
              name="name"
              control={methods.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="name">Name</FormLabel>
                  <FormControl>
                    <Input id="name" {...field} placeholder="Name" />
                  </FormControl>
                  <FormMessage>{errors.name?.message}</FormMessage>
                </FormItem>
              )}
            />
            <FormField
              name="email"
              control={methods.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="email">Email</FormLabel>
                  <FormControl>
                    <Input id="email" {...field} placeholder="Email" />
                  </FormControl>
                  <FormMessage>{errors.email?.message}</FormMessage>
                </FormItem>
              )}
            />
            <FormField
              name="password"
              control={methods.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="password">Password</FormLabel>
                  <FormControl>
                    <Input id="password" type="password" {...field} placeholder="Password" />
                  </FormControl>
                  <FormMessage>{errors.password?.message}</FormMessage>
                </FormItem>
              )}
            />
            <FormField
              name="confirmPassword"
              control={methods.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="confirmPassword">Confirm Password</FormLabel>
                  <FormControl>
                    <Input
                      id="confirmPassword"
                      type="password"
                      {...field}
                      placeholder="Confirm Password"
                    />
                  </FormControl>
                  <FormMessage>{errors.confirmPassword?.message}</FormMessage>
                </FormItem>
              )}
            />
            <Button type="submit">Register</Button>
          </form>
        </Form>
      </div>
    </div>
  );
}