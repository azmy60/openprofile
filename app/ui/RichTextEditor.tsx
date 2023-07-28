import { EditorContent, useEditor, JSONContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { twMerge } from "tailwind-merge";
import { useId, useRef, useState } from "react";
import { Color } from "@tiptap/extension-color";
import ListItem from "@tiptap/extension-list-item";
import TextStyle from "@tiptap/extension-text-style";
import FormControl from "./FormControl";
import BoldIcon from "./icons/BoldIcon";
import StrikeIcon from "./icons/StrikeIcon";
import ListIcon from "./icons/ListIcon";
import OrderedListIcon from "./icons/OrderedListIcon";
import Link from "@tiptap/extension-link";
import { LinkIcon } from "@heroicons/react/24/outline";
import SimpleButton from "./SimpleButton";
import SimpleBorderButton from "./SimpleBorderButton";
import SimpleInput from "./SimpleInput";
import { useClickAway } from "../helpers";

const activeClass = "text-indigo-600";

export type RichTextValue = JSONContent | JSONContent[] | undefined;

const RichTextEditor: React.FC<{
  label?: string;
  value: RichTextValue;
  onUpdate: (value: RichTextValue) => void;
}> = (props) => {
  const id = useId();
  const linkModal = useRef<HTMLDivElement>(null);
  const [openLinkModal, setOpenLinkModal] = useState(false);
  const [modalUrl, setModalUrl] = useState("");
  const [editingUrl, setEditingUrl] = useState(false);
  const editor = useEditor({
    extensions: [
      Color.configure({ types: [TextStyle.name, ListItem.name] }),
      TextStyle.configure({
        // @ts-expect-error
        types: [ListItem.name],
      }),
      StarterKit.configure({
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
        },
      }),
      Link.configure({
        openOnClick: false,
      }),
    ],
    content: props.value,
    editorProps: {
      attributes: {
        id,
        class:
          "prose prose-sm w-full px-3 py-2 sm:text-sm sm:leading-relaxed focus:outline-none",
      },
    },
    onUpdate: ({ editor }) => props.onUpdate(editor.getJSON()),
  });

  function handleOpenLinkModal() {
    const previousUrl = editor!.getAttributes("link").href;
    setEditingUrl(!!previousUrl);
    setModalUrl(previousUrl);
    setOpenLinkModal(true);
  }

  function handleAddOrEditLink(url: string) {
    const href =
      !url.startsWith("http://") && !url.startsWith("https://")
        ? `https://${url}`
        : url;
    editor!.chain().focus().extendMarkRange("link").setLink({ href }).run();
    setOpenLinkModal(false);
  }

  function handleDeleteLink() {
    editor!.chain().focus().extendMarkRange("link").unsetLink().run();
    setOpenLinkModal(false);
  }

  useClickAway(linkModal, () => setOpenLinkModal(false));

  if (!editor) return null;

  return (
    <FormControl id={id} label={props.label}>
      <div className="relative mt-1 rounded-md bg-gray-100">
        <div className="ml-1">
          <ToolButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            disabled={!editor.can().chain().focus().toggleBold().run()}
            className={editor.isActive("bold") && activeClass}
          >
            <BoldIcon className="w-4 h-4" />
          </ToolButton>
          {/*
          <ToolButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            disabled={!editor.can().chain().focus().toggleItalic().run()}
            className={editor.isActive("italic") && activeClass}
          >
            <ItalicIcon className="w-4 h-4" />
          </ToolButton>
          */}
          <ToolButton
            onClick={() => editor.chain().focus().toggleStrike().run()}
            disabled={!editor.can().chain().focus().toggleStrike().run()}
            className={editor.isActive("strike") && activeClass}
          >
            <StrikeIcon className="w-4 h-4" />
          </ToolButton>
          <ToolButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={editor.isActive("bulletList") && activeClass}
          >
            <ListIcon className="w-4 h-4" />
          </ToolButton>
          <ToolButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={editor.isActive("orderedList") && activeClass}
          >
            <OrderedListIcon className="w-4 h-4" />
          </ToolButton>
          <ToolButton
            onClick={handleOpenLinkModal}
            className={editor.isActive("link") && activeClass}
          >
            <LinkIcon className="w-4 h-4" />
          </ToolButton>
        </div>
        <EditorContent editor={editor} />
        {openLinkModal && (
          <div
            className="absolute left-32 top-8 z-10 rounded-md bg-white shadow-lg p-4"
            ref={linkModal}
          >
            {editingUrl ? "Edit link" : "Add link"}
            <SimpleInput
              FormControlProps={{ containerProps: { className: "mt-2 mb-4" } }}
              inputProps={{
                placeholder: "https://example.com",
                onKeyUp(e) {
                  if (e.key === "Enter")
                    handleAddOrEditLink(e.currentTarget.value);
                },
                value: modalUrl,
                onChange: (e) => setModalUrl(e.currentTarget.value),
              }}
            />
            <div className="flex gap-2">
              {editingUrl && (
                <SimpleBorderButton
                  className="px-3 py-2"
                  onClick={handleDeleteLink}
                  color="danger"
                >
                  Delete
                </SimpleBorderButton>
              )}
              <SimpleButton
                className="px-3 py-2"
                onClick={() => handleAddOrEditLink(modalUrl)}
                disabled={!modalUrl}
              >
                {editingUrl ? "Save" : "Add"}
              </SimpleButton>
            </div>
          </div>
        )}
      </div>
    </FormControl>
  );
};

export default RichTextEditor;

const ToolButton: React.FC<
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "className"> & {
    className: Parameters<typeof twMerge>[0];
  }
> = ({ className, ...props }) => (
  <button {...props} className={twMerge("p-2 hover:bg-gray-200", className)} />
);
