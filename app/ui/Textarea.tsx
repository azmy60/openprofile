import { ChangeEvent, useEffect, useId, useRef } from "react";
import { ListBulletIcon, LinkIcon } from "@heroicons/react/20/solid";
import FormControl from "./FormControl";

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
      "value",
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

function useAutosizeTextArea(
  textAreaRef: HTMLTextAreaElement | null,
  value: string,
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
