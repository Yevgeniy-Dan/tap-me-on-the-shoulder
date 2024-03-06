"use client";

import { signIn, useSession } from "next-auth/react";
import Header from "./components/Header";

import CalendarEventCard from "./components/CalendarEventCard";
import { useState } from "react";
import Overlay from "./components/Overlay";

export default function Home() {
  const { data: session, status } = useSession();
  const [modal, setModal] = useState(true);

  if (status === "loading") {
    return (
      <div className="w-screen h-screen flex items-center justify-center p-[80px]">
        <p className="text-5xl text-custom-blue text-center leading-normal">
          Hang on there...
        </p>
      </div>
    );
  }

  if (session) {
    return (
      <div className="w-screen h-screen flex items-center justify-center p-[80px]">
        <main className="w-full h-full flex flex-col justify-between gap-[3vh] container">
          {modal && <Overlay setModal={setModal} />}
          <Header email={session.user?.email} image={session.user?.image} />
          <CalendarEventCard />
        </main>
      </div>
    );
  }

  return (
    <div className="w-screen h-screen flex items-center justify-center p-[80px]">
      <div className="p-[5vw] w-[30vw] border-[0.2vw] border-custom-gray rounded-[1.4vw]">
        <button
          className="bg-custom-blue text-white py-[2vw] w-full text-[2vw] rounded-[1.4vw]"
          onClick={() => signIn("google")}
        >
          Sign In
        </button>
      </div>
    </div>
  );
}
