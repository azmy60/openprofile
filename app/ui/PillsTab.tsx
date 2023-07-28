import { Tab } from "./ContainedButtonGroupTab";

export type { Tab };

export default function PillsTab<T extends string>(props: {
  tabs: Tab<T>[];
  onSelect: (id: T) => void;
  selected: T;
}) {
  return (
    <div>
      <div className="sm:hidden">
        <label htmlFor="Tab" className="sr-only">
          Tab
        </label>

        <select
          id="Tab"
          className="w-full rounded-md border-gray-200"
          value={props.selected}
          onChange={(e) => props.onSelect(e.currentTarget.value as T)}
        >
          {props.tabs.map((tab) => (
            <option key={tab.id} value={tab.id}>
              {tab.label}
            </option>
          ))}
        </select>
      </div>

      <div className="hidden sm:block">
        <nav className="flex gap-2" aria-label="Tabs">
          {props.tabs.map((tab) =>
            tab.id === props.selected ? (
              <button
                key={tab.id}
                className="shrink-0 rounded-lg bg-gray-100 p-2 text-sm font-medium text-gray-700"
                aria-current="page"
              >
                {tab.label}
              </button>
            ) : (
              <button
                key={tab.id}
                className="shrink-0 rounded-lg p-2 text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                onClick={() => props.onSelect(tab.id)}
              >
                {tab.label}
              </button>
            ),
          )}
        </nav>
      </div>
    </div>
  );
}
