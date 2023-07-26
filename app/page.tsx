import dynamic from "next/dynamic";
import Form from "./builder/form";
import { GithubIcon } from "./icons";
import WelcomeCard from "./welcome-card";

export default function Home() {
  return (
    <main className="flex flex-col h-screen">
      <div className="flex px-4 py-2 shadow-sm">
        <h1 className="text-gray-800 text-xl font-bold">OpenProfile</h1>
        <div className="ml-auto">
          <a href="https://github.com/azmy60/openprofile" target="_blank">
            <GithubIcon className="w-6 h-6 text-gray-800" />
          </a>
        </div>
      </div>
      <div className="relative min-h-0 flex w-full overflow-y-scroll bg-gray-300">
        <div className="flex w-1/2 flex-col gap-12 p-8 bg-white h-fit">
          <WelcomeCard />
          <Form />
          <div className="pt-[1px] -mt-6" />
        </div>
        <DynamicViewArea />
      </div>
    </main>
  );
}

const DynamicViewArea = dynamic(() => import("./builder/view-area"), {
  ssr: false,
});
