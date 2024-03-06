"use client";

import { signOut } from "next-auth/react";
import Image from "next/image";
import React from "react";

interface HeaderProps {
  email?: string | null;
  image?: string | null;
}

const Header: React.FC<HeaderProps> = ({ email, image }) => {
  return (
    <div className="flex justify-between items-center">
      <div className="flex items-center justify-between gap-[3vw] text-gray-700">
        {email && image && (
          <>
            <div className="w-[124px] h-[124px] rounded-full overflow-hidden">
              <Image src={image} alt={"avatar"} width={200} height={200} />
            </div>
            <p className="text-[36px]">{email}</p>
          </>
        )}
      </div>
      <button
        className="bg-custom-blue text-white py-[26px] px-[52px] text-[36px] rounded-3xl"
        onClick={async () => {
          await signOut();
          localStorage.removeItem("accessToken");
        }}
      >
        Sign Out
      </button>
    </div>
  );
};

export default Header;
