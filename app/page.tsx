import dynamic from "next/dynamic";
import MainPanel from "@builder/main-panel";
import GithubIcon from "@ui/icons/GithubIcon";
import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-col h-screen">
      <div className="flex px-8 py-2 shadow-sm z-10 items-center">
        <h1 className="text-gray-800 text-xl font-bold">OpenProfile</h1>
        <Link
          href="/faq"
          className="ml-2 px-2 py-1 hover:bg-gray-100 rounded-md"
        >
          FAQ
        </Link>
        <div className="ml-auto">
          <a href="https://github.com/azmy60/openprofile" target="_blank">
            <GithubIcon className="w-6 h-6 text-gray-800" />
          </a>
        </div>
      </div>
      <div className="relative min-h-0 flex w-full overflow-y-scroll bg-gray-300">
        <div className="w-1/2 bg-white h-fit min-h-full">
          <MainPanel />
        </div>
        <DynamicViewPanel />
      </div>
    </main>
  );
}

const DynamicViewPanel = dynamic(() => import("@builder/view-panel"), {
  ssr: false,
});
