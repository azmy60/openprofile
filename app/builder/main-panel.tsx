"use client";

import { useState } from "react";
import WelcomeCard from "../welcome-card";
import Form from "./form";
import PageSettings from "./page-settings";
import PillsTab, { Tab } from "@ui/PillsTab";

type TabOptions = "resume" | "settings";

const tabs: Tab<TabOptions>[] = [
  { id: "resume", label: "Resume form" },
  { id: "settings", label: "Page settings" },
];

const MainPanel: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState<TabOptions>("resume");

  return (
    <div className="w-full flex flex-col px-8 pt-4 pb-8">
      <div className="sm:-mx-2">
        <PillsTab
          tabs={tabs}
          onSelect={(id) => setSelectedTab(id)}
          selected={selectedTab}
        />
      </div>
      <div className="flex flex-col gap-12 pt-8">
        {selectedTab === "resume" ? (
          <>
            <WelcomeCard />
            <Form />
          </>
        ) : (
          <PageSettings />
        )}
      </div>
    </div>
  );
};

export default MainPanel;
