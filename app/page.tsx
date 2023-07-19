import Builder from "./builder";
import { GithubIcon } from "./icons";

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
      <Builder />
    </main>
  );
}
