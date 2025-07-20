'use client'

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react";
import { toast } from 'sonner';
import { Toaster } from 'sonner';
import { useAuth } from "@/context/AuthContext";

export function LoginForm({ className, ...props }) {
  const { login, register } = useAuth();
  const [currState, setCurrState] = useState("Login");
  const [data, setData] = useState({
    name: "",
    email: "",
    password: ""
  });

  const onChangeHandler = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    setData(data => ({ ...data, [name]: value }));
  }

  const onLogin = async (event) => {
    event.preventDefault();
    let response;

    if (currState === "Login") {
      response = await login(data);
      if (response.success) {
        toast.success("ログイン成功");
      } else {
        toast.error(response.message || "ログイン失敗");
      }
    } else {
      response = await register(data);
      if (response.success) {
        toast.success("登録完了");
        setCurrState("Login");
        setData(prev => ({ ...prev, password: "" }));
      } else {
        toast.error(response.message || "登録失敗");
      }
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">
            {currState === "Login" ? "Login" : "Register"}
          </CardTitle>
          <CardDescription>
            {currState === "Login"
              ? "Enter your email below to sign in to your account"
              : "Enter your details below to create your account"
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onLogin}>
            <div className="flex flex-col gap-6">
              {currState === "Sign Up" && (
                <div className="grid gap-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    value={data.name}
                    onChange={onChangeHandler}
                    placeholder="Your name"
                    required
                  />
                </div>
              )}
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={data.email}
                  onChange={onChangeHandler}
                  placeholder="m@example.com"
                  required
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  <span
                    href="#"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  >
                    Forgot your password?
                  </span>
                </div>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={data.password}
                  onChange={onChangeHandler}
                  required />
              </div>
              <Button type="submit" className="w-full">
                {currState === "Login" ? "Sign in" : "Create account"}
              </Button>
            </div>
            <div className="mt-4 text-center text-sm">
              {currState === "Login" ? (
                <>
                  Don&apos;t have an account?{" "}
                  <button
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setCurrState("Sign Up");
                    }}
                    className="underline underline-offset-4"
                  >
                    Sign up
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <button
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setCurrState("Login");
                    }}
                    className="underline underline-offset-4"
                  >
                    Sign in
                  </button>
                </>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
      <Toaster />
    </div>
  )
}
