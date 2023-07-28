export interface Tab<T> {
  id: T;
  label: string;
}

export default function ContainedButtonGroupTab<T extends string>(props: {
  tabs: Tab<T>[];
  onSelect: (id: T) => void;
  selected: T;
}) {
  return (
    <div className="inline-flex rounded-lg border border-gray-100 bg-gray-100 p-1">
      {props.tabs.map((tab) =>
        tab.id === props.selected ? (
          <button
            key={tab.id}
            className="inline-block rounded-md bg-white px-4 py-2 text-sm text-blue-500 shadow-sm focus:relative"
            onClick={() => props.onSelect(tab.id)}
          >
            {tab.label}
          </button>
        ) : (
          <button
            key={tab.id}
            className="inline-block rounded-md px-4 py-2 text-sm text-gray-500 hover:text-gray-700 focus:relative"
            onClick={() => props.onSelect(tab.id)}
          >
            {tab.label}
          </button>
        ),
      )}
    </div>
  );
}
