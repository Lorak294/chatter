"use client";

import { ButtonHTMLAttributes, FC, useState } from "react";
import Button from "./Button";
import { signOut } from "next-auth/react";
import toast from "react-hot-toast";
import { Loader2, LogOut } from "lucide-react";
interface SignOutButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {}

const SignOutButton: FC<SignOutButtonProps> = ({ ...props }) => {
  const [isSigningOut, setIsSigningOut] = useState<boolean>(false);

  async function clickHandler() {
    setIsSigningOut(true);
    try {
      await signOut();
    } catch (error) {
      toast.error("Signing out unsuccessful");
    } finally {
      setIsSigningOut(false);
    }
  }

  return (
    <Button {...props} variant="ghost" onClick={clickHandler}>
      {isSigningOut ? (
        <Loader2 className="animate-spin h-4, w-4" />
      ) : (
        <LogOut className="w-4 h-4" />
      )}
    </Button>
  );
};

export default SignOutButton;
