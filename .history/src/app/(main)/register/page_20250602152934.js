"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function RegisterPage() {
  const [mode, setMode] = useState("login");

  return (
    <div className="flex min-h-screen w-full">
      <div className="hidden lg:block w-1/2 bg-muted" />
      <div className="flex flex-col justify-center items-center w-full lg:w-1/2 p-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-sm space-y-6"
        >
          <div className="text-center">
            <h1 className="text-2xl font-bold">
              {mode === "login" ? "Đăng nhập" : "Tạo tài khoản"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {mode === "login"
                ? "Chào mừng bạn quay trở lại"
                : "Tạo tài khoản để bắt đầu sử dụng"}
            </p>
          </div>

          <form className="space-y-4">
            {mode === "register" && (
              <Input placeholder="Tên người dùng" required />
            )}
            <Input type="email" placeholder="Email" required />
            <Input type="password" placeholder="Mật khẩu" required />
            <Button type="submit" className="w-full">
              {mode === "login" ? "Đăng nhập" : "Đăng ký"}
            </Button>
          </form>

          <div className="text-center text-sm">
            {mode === "login" ? (
              <>
                Chưa có tài khoản? {" "}
                <button
                  className="text-blue-600 hover:underline"
                  onClick={() => setMode("register")}
                >
                  Đăng ký
                </button>
              </>
            ) : (
              <>
                Đã có tài khoản? {" "}
                <button
                  className="text-blue-600 hover:underline"
                  onClick={() => setMode("login")}
                >
                  Đăng nhập
                </button>
              </>
            )}
            <br />
            <Link
              href="/forgotpassword"
              className="text-blue-600 hover:underline"
            >
              Quên mật khẩu?
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}