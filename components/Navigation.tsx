import Link from "next/link";
import { FC } from "react";

export const Navigation: FC = () => {
  return (
    <nav className="bg-gray-800 z-50 py-3 lg:p-6 fixed bottom-0 w-full lg:relative">
      <ul className="flex items-center justify-between flex-wrap lg:px-2 w-full h-fit">
        <li className="m-auto">
          <Link
            href="/"
            className="text-base lg:text-lg tracking-wide text-slate-200 hover:border-b-pink-600 border-b-2 border-b-transparent"
          >
            Dashboard
          </Link>
        </li>
        <li className="m-auto">
          <Link
            href="/add"
            className="text-base lg:text-lg tracking-wide text-slate-200 hover:border-b-pink-600 border-b-2 border-b-transparent"
          >
            Add Bot
          </Link>
        </li>
      </ul>
    </nav>
  );
};
