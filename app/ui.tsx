"use client";

import { ChangeEvent, useEffect, useId, useRef } from "react";
import { ListBulletIcon, LinkIcon } from "@heroicons/react/20/solid";
import { twMerge } from "tailwind-merge";

export const SimpleInput: React.FC<{
  name?: string;
  label?: string;
  type?: React.HTMLProps<HTMLInputElement>["type"];
  inputProps?: React.HTMLProps<HTMLInputElement>;
  value?: React.HTMLProps<HTMLInputElement>["value"];
  onChange?: (e: ChangeEvent<HTMLInputElement>, value: string) => void;
}> = (props) => {
  const id = useId();
  return (
    <FormControl id={id} label={props.label || ""}>
      <input
        id={id}
        name={props.name}
        type={props.type || "text"}
        className={twMerge(
          "w-full rounded-md border-none bg-gray-100 py-2.5 sm:text-sm",
          props.inputProps?.className
        )}
        value={props.value}
        onChange={(e) => props.onChange?.(e, e.currentTarget.value)}
        {...props.inputProps}
      />
    </FormControl>
  );
};

export const TextArea: React.FC<{
  name?: string;
  label?: string;
  textareaProps?: React.HTMLProps<HTMLTextAreaElement>;
  value?: React.HTMLProps<HTMLTextAreaElement>["value"];
  onChange?: (e: ChangeEvent<HTMLTextAreaElement>, value: string) => void;
  formControlProps?: Partial<React.ComponentProps<typeof FormControl>>;
}> = (props) => {
  const id = useId();
  const ref = useRef<HTMLTextAreaElement>(null);

  const resize = useAutosizeTextArea(ref.current, props.value as string);

  function setValue(str: string) {
    const nativeSetter = Object.getOwnPropertyDescriptor(
      window.HTMLTextAreaElement.prototype,
      "value"
    )!.set!;
    nativeSetter.call(ref.current!, str);
    ref.current!.dispatchEvent(new Event("change", { bubbles: true }));
  }

  function addBulletedList() {
    setValue(ref.current!.value + "\n\n- ");
  }

  function addLink() {
    setValue(ref.current!.value + " [my website](https://example.com)");
  }

  return (
    <FormControl id={id} label={props.label} {...props.formControlProps}>
      <div className="mt-1 rounded-md bg-gray-100">
        <div className="flex">
          <div className="ml-2">
            <button
              className="p-1.5 hover:bg-gray-200"
              title="Add a bulleted list"
              onClick={addBulletedList}
            >
              <ListBulletIcon className="w-4 h-4" />
            </button>
            <button
              className="p-1.5 hover:bg-gray-200"
              title="Add a link"
              onClick={addLink}
            >
              <LinkIcon className="w-4 h-4" />
            </button>
          </div>
          <div className="group/md relative select-none ml-auto mt-0.5 mr-2 text-sm">
            <span className="text-xs font-bold text-gray-400 tracking-wider">
              MD
            </span>
            <div
              role="tooltip"
              className="group-hover/md:visible invisible absolute z-10 top-full right-0 w-64 text-black bg-white shadow-lg rounded-md p-2"
            >
              You can use Markdown syntax to format your text. Currently, it
              only supports paragraphs, links and lists.
            </div>
          </div>
        </div>
        <textarea
          id={id}
          name={props.name}
          ref={ref}
          cols={2}
          className="w-full resize-none border-none bg-transparent sm:text-sm sm:leading-relaxed"
          onChange={(e) => props.onChange?.(e, e.currentTarget.value)}
          value={props.value}
          onFocus={resize}
          {...props.textareaProps}
        />
      </div>
    </FormControl>
  );
};

const FormControl: React.FC<{
  id: string;
  label?: string;
  containerProps?: JSX.IntrinsicElements["div"];
  children: React.ReactNode;
}> = (props) => (
  <div {...props.containerProps}>
    <label
      htmlFor={props.id}
      className="peer block text-xs font-medium text-gray-700 [&:not(:empty)]:mb-2"
    >
      {props.label}
    </label>
    {props.children}
  </div>
);

function useAutosizeTextArea(
  textAreaRef: HTMLTextAreaElement | null,
  value: string
) {
  function resize() {
    if (!textAreaRef) return;
    // We need to reset the height momentarily to get the correct scrollHeight for the textarea
    textAreaRef.style.height = "0px";
    // Add a little bit room so it wouldn't show the scrollbar
    const scrollHeight = textAreaRef.scrollHeight + 4;

    // We then set the height directly, outside of the render loop
    // Trying to set this with state or a ref will product an incorrect value.
    textAreaRef.style.height = scrollHeight + "px";
  }

  useEffect(() => resize(), [textAreaRef, value]);

  return resize;
}

export const SimpleButton: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement>
> = ({ className, ...props }) => (
  <button
    className={twMerge(
      "inline-block rounded border border-indigo-600 bg-indigo-600 px-12 py-3 text-sm font-medium text-white hover:bg-transparent hover:text-indigo-600 focus:outline-none focus:ring active:text-indigo-500",
      className
    )}
    type="button"
    {...props}
  />
);

export const SimpleBorderButton: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement>
> = ({ className, ...props }) => (
  <button
    className={twMerge(
      "inline-block rounded border border-indigo-600 px-12 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-600 hover:text-white focus:outline-none focus:ring active:bg-indigo-500",
      className
    )}
    type="button"
    {...props}
  />
);

export const SmallIconButton: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement>
> = ({ className, ...props }) => (
  <button
    className={twMerge(
      "relative inline-block p-1.5 text-gray-400 disabled:before:hidden before:absolute before:left-1/2 before:top-1/2 before:-z-10 before:-translate-x-1/2 before:-translate-y-1/2 before:rounded-full hover:before:bg-gray-100 before:p-3 before:content-[''] enabled:hover:text-gray-600 focus:outline-none focus:ring",
      className
    )}
    type="button"
    {...props}
  />
);

export interface Tab<T> {
  id: T;
  label: string;
}

export function PillsTab<T extends string>(props: {
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
            )
          )}
        </nav>
      </div>
    </div>
  );
}

export function ContainedButtonGroupTab<T extends string>(props: {
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
        )
      )}
    </div>
  );
}
