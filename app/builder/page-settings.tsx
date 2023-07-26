import { StandardPageSize } from "@react-pdf/types";
import { ContainedButtonGroupTab, Tab } from "../ui";
import { useAtom } from "jotai";
import { pageSizeAtom } from "./state";

const pageSizes: Tab<StandardPageSize>[] = [
  { id: "A4", label: "A4" },
  { id: "LETTER", label: "Letter" },
];

const PageSettings: React.FC = () => {
  const [pageSize, setPageSize] = useAtom(pageSizeAtom);
  return (
    <>
      <div className="flex items-center justify-between max-w-xs">
        <span className="font-bold">Page size</span>
        <ContainedButtonGroupTab
          tabs={pageSizes}
          selected={pageSize}
          onSelect={setPageSize}
        />
      </div>
    </>
  );
};

export default PageSettings;
