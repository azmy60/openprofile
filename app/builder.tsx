"use client";

import {
  type ChangeEvent,
  createContext,
  memo,
  useId,
  useEffect,
  useRef,
  useState,
  MutableRefObject,
} from "react";
import { CustomDynamicPDFViewer } from "./custom-react-pdf";
import ReactPDF, {
  Document,
  Link as ReactPDFLink,
  Page,
  Text,
  View,
  PDFDownloadLink,
  Svg,
  Path,
} from "@react-pdf/renderer";
import { marked } from "marked";
import { useAtom, useAtomValue } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { produce } from "immer";
import dynamic from "next/dynamic";
import {
  TrashIcon as Trash20Icon,
  ArrowDownIcon,
  ArrowUpIcon,
  ListBulletIcon,
  LinkIcon,
} from "@heroicons/react/20/solid";
import {
  TrashIcon as Trash24OutlineIcon,
  PencilSquareIcon,
  XMarkIcon,
  CheckIcon,
  MapPinIcon,
  EnvelopeIcon,
  PhoneIcon,
} from "@heroicons/react/24/outline";
import { moveArrayElement } from "./helpers";

const DynamicPDFDownloadLink = dynamic(() => Promise.resolve(PDFDownloadLink), {
  ssr: false,
});

function resizeElement(
  targetContainer: HTMLElement,
  container: HTMLElement,
  content: HTMLElement
) {
  const containerStyles = getComputedStyle(targetContainer);
  const containerHeight =
    targetContainer.clientHeight -
    parseFloat(containerStyles.paddingTop) -
    parseFloat(containerStyles.paddingBottom);
  const contentHeight = content.clientHeight;
  const contentWidth = content.clientWidth;

  const ratio = containerHeight / contentHeight;
  content.style.transform = `scale(${ratio})`;

  container.style.width = `${contentWidth * ratio}px`;
  container.style.height = `${contentHeight * ratio}px`;
}

export default function Builder() {
  const { onChange, content, addSection } = useContent();
  const pdfViewerTargetContainer = useRef<HTMLElement | null>(null);
  const pdfViewerContainer = useRef<HTMLElement | null>(null);
  const pdfViewer = useRef<HTMLIFrameElement | null>(null);

  function updateScale<T>(el: T, ref: MutableRefObject<T>) {
    ref.current = el;
    if (!pdfViewerTargetContainer.current) return;
    if (!pdfViewerContainer.current) return;
    if (!pdfViewer.current) return;
    resizeElement(
      pdfViewerTargetContainer.current,
      pdfViewerContainer.current,
      pdfViewer.current
    );
  }

  return (
    <div className="relative min-h-0 flex w-full overflow-y-scroll">
      <div className="flex w-1/2 flex-col gap-10 p-8">
        <div>
          <div className="text-lg font-bold">Personal</div>
          <div className="grid grid-cols-2 pt-2 gap-4 rounded-md bg-white">
            <SimpleInput
              label="Name"
              name="name"
              value={content.name}
              onChange={onChange}
            />
            <SimpleInput
              label="Location"
              name="location"
              value={content.location}
              onChange={onChange}
            />
            <SimpleInput
              label="Email"
              name="email"
              value={content.email}
              onChange={onChange}
            />
            <SimpleInput
              label="Telephone"
              name="tel"
              value={content.tel}
              onChange={onChange}
            />
          </div>
        </div>
        {content.sections.map((section, index) => (
          <SectionInputGroup key={index} index={index} section={section} />
        ))}
        <div className="border-t border-gray-100" />
        <SimpleBorderButton onClick={addSection}>
          Add New Section
        </SimpleBorderButton>
        <div className="pt-[1px]" />
      </div>
      <div className="sticky left-1/2 top-0 w-1/2 h-full px-4 py-4 bg-gray-300 flex flex-col">
        <div
          className="grow h-[calc(100%_-_2.5rem)] pb-4"
          ref={(el) => updateScale(el, pdfViewerTargetContainer)}
        >
          <div
            className="mx-auto shadow"
            ref={(el) => updateScale(el, pdfViewerContainer)}
          >
            <CustomDynamicPDFViewer
              iframeRef={(el) => updateScale(el, pdfViewer)}
              className="origin-top-left"
            >
              <Doc usingCustomPDFViewer />
            </CustomDynamicPDFViewer>
          </div>
        </div>
        <div className="h-10">
          <DynamicPDFDownloadLink
            document={<Doc />}
            className="w-full inline-block text-center rounded border border-indigo-600 bg-indigo-600 px-12 py-3 text-sm font-medium text-white hover:bg-transparent hover:text-indigo-600 focus:outline-none focus:ring active:text-indigo-500"
          >
            {({ loading, error }) => {
              if (loading) return "Loading...";
              if (error) return "Error: " + error;
              return "Download as PDF";
            }}
          </DynamicPDFDownloadLink>
        </div>
      </div>
    </div>
  );
}

export const ContentContext = createContext({
  name: "",
  email: "",
  tel: "",
  location: "",
  summary: "",
  sections: [],
});

function useContent() {
  const [content, setContent] = useAtom(contentAtom);

  function onChange(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const name = e.currentTarget.name;
    const value = e.currentTarget.value;

    setContent(
      produce((draft: typeof content) => {
        let walker: any = draft;
        const steps = generateWalkSteps(name);
        steps.forEach((step, idx) => {
          if (idx === steps.length - 1) walker[step] = value;
          else walker = walker[step];
        });
      })
    );
  }

  function addSection() {
    setContent(
      produce((draft: typeof content) => {
        draft.sections.push(buildDetailedSection());
      })
    );
  }

  function removeSection(sectionIndex: number) {
    setContent(
      produce((draft: typeof content) => {
        draft.sections.splice(sectionIndex, 1);
      })
    );
  }

  function editSectionName(sectionIndex: number, name: string) {
    setContent(
      produce((draft: typeof content) => {
        draft.sections[sectionIndex].name = name;
      })
    );
  }

  function addSectionGroup(sectionIndex: number) {
    setContent(
      produce((draft: typeof content) => {
        (draft.sections[sectionIndex] as DetailedSection).groups.push(
          buildGroup()
        );
      })
    );
  }

  function removeSectionGroup(sectionIndex: number, groupIndex: number) {
    setContent(
      produce((draft: typeof content) => {
        (draft.sections[sectionIndex] as DetailedSection).groups.splice(
          groupIndex,
          1
        );
      })
    );
  }

  function move(sectionIndex: number, groupIndex: number, targetIndex: number) {
    setContent(
      produce((draft: typeof content) => {
        moveArrayElement(
          (draft.sections[sectionIndex] as DetailedSection).groups,
          groupIndex,
          targetIndex
        );
      })
    );
  }

  function moveUp(sectionIndex: number, groupIndex: number) {
    move(sectionIndex, groupIndex, groupIndex - 1);
  }

  function moveDown(sectionIndex: number, groupIndex: number) {
    move(sectionIndex, groupIndex, groupIndex + 1);
  }

  return {
    onChange,
    content,
    addSection,
    removeSection,
    editSectionName,
    addSectionGroup,
    removeSectionGroup,
    moveUp,
    moveDown,
  };
}

const SimpleInput: React.FC<{
  name?: string;
  label?: string;
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
        type="text"
        className="mt-1 w-full rounded-md border-none bg-gray-100 sm:text-sm"
        value={props.value}
        onChange={(e) => props.onChange?.(e, e.currentTarget.value)}
        {...props.inputProps}
      />
    </FormControl>
  );
};

const TextArea: React.FC<{
  name?: string;
  label?: string;
  textareaProps?: React.HTMLProps<HTMLTextAreaElement>;
  value?: React.HTMLProps<HTMLTextAreaElement>["value"];
  onChange?: (e: ChangeEvent<HTMLTextAreaElement>, value: string) => void;
  formControlProps?: Partial<React.ComponentProps<typeof FormControl>>;
}> = (props) => {
  const id = useId();
  const ref = useRef<HTMLTextAreaElement>(null);

  useAutosizeTextArea(ref.current, props.value as string);

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
          className="w-full resize-none border-none bg-transparent sm:text-sm"
          onChange={(e) => props.onChange?.(e, e.currentTarget.value)}
          value={props.value}
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
    {props.label && (
      <label
        htmlFor={props.id}
        className="block text-xs font-medium text-gray-700"
      >
        {props.label}
      </label>
    )}
    {props.children}
  </div>
);

function useAutosizeTextArea(
  textAreaRef: HTMLTextAreaElement | null,
  value: string
) {
  useEffect(() => {
    if (textAreaRef) {
      // We need to reset the height momentarily to get the correct scrollHeight for the textarea
      textAreaRef.style.height = "0px";
      // Add a little bit room so it wouldn't show the scrollbar
      const scrollHeight = textAreaRef.scrollHeight + 4;

      // We then set the height directly, outside of the render loop
      // Trying to set this with state or a ref will product an incorrect value.
      textAreaRef.style.height = scrollHeight + "px";
    }
  }, [textAreaRef, value]);
}

const SimpleBorderButton: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement>
> = (props) => (
  <button
    className="inline-block w-full rounded border border-indigo-600 px-12 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-600 hover:text-white focus:outline-none focus:ring active:bg-indigo-500"
    type="button"
    {...props}
  />
);

const SmallIconButton: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement>
> = (props) => (
  <button
    className="relative inline-block p-1.5 text-gray-400 disabled:before:hidden before:absolute before:left-1/2 before:top-1/2 before:-z-10 before:-translate-x-1/2 before:-translate-y-1/2 before:rounded-full hover:before:bg-gray-100 before:p-3 before:content-[''] enabled:hover:text-gray-600 focus:outline-none focus:ring"
    type="button"
    {...props}
  />
);

const contentAtom = atomWithStorage<{
  name: string;
  email: string;
  tel: string;
  location: string;
  sections: Section[];
}>("openprofile-content", {
  name: "John Doe",
  location: "Cupertino, California, United States",
  email: "example@email.com",
  tel: "(555) 123-4567",
  sections: [
    buildSimpleSection(
      "Summary",
      "Experienced web developer with 2 years of expertise in HTML, CSS, JavaScript, and responsive design. Skilled in translating client requirements into visually appealing web applications. Proficient in React, Angular, and Git. Strong problem-solving and attention to detail. Seeking a dynamic team to deliver high-quality web solutions."
    ),
    buildDetailedSection("Experience", [
      {
        title: "Junior Software Engineer",
        description:
          'Company X\n\nJun 2021 - Jul 2023 (2 year 1 month)\n\nContributed to the development of web applications with React and Angular as the main technologies. Collaborated with cross-functional teams to troubleshoot and resolve technical issues.\n\n- "You may also make a list here"\n- ....',
      },
    ]),
    buildDetailedSection("Education", [
      {
        title: "Bachelor of Science in Computer Science",
        description: "XYZ University, Anytown, USA\n\nGraduated: May 2021",
      },
    ]),
    buildSimpleSection(
      "Skills",
      "Web Development - Web Services - Security - Cloud Computing - Mobile Development"
    ),
  ],
});

const WALK_STEPS_MATCHER = /(\w+)/g;

function generateWalkSteps(str: string): string[] {
  return str.match(WALK_STEPS_MATCHER) || [];
}

const SectionInputGroup: React.FC<{ index: number; section: Section }> = (
  props
) => {
  const {
    onChange,
    removeSection,
    editSectionName,
    addSectionGroup,
    removeSectionGroup,
    moveUp,
    moveDown,
  } = useContent();

  const [draft, setDraft] = useState("");
  const [editing, setEditing] = useState(false);

  function onClickRenameSection() {
    setEditing(true);
    setDraft(props.section.name);
  }

  function onSectionDraftChange(e: ChangeEvent<HTMLInputElement>) {
    setDraft(e.currentTarget.value);
  }

  function saveSectionDraft() {
    editSectionName(props.index, draft);
    setEditing(false);
  }

  function cancelSectionDraft() {
    setEditing(false);
  }

  function onClickRemoveSection() {
    removeSection(props.index);
  }

  function canMoveUp(groupIndex: number) {
    return groupIndex > 0;
  }

  function canMoveDown(groupIndex: number) {
    return groupIndex < (props.section as DetailedSection).groups.length - 1;
  }

  return (
    <div>
      <div className="group/heading flex gap-4">
        {editing ? (
          <>
            <input
              type="text"
              className="mt-1 w-full rounded-md border-gray-200 shadow-sm sm:text-sm"
              value={draft}
              onChange={onSectionDraftChange}
            />
            <div className="flex gap-2">
              <button
                key="save"
                className="inline-block text-gray-400 hover:text-gray-600 focus:outline-none focus:ring"
                type="button"
                onClick={saveSectionDraft}
              >
                <span className="sr-only">Save</span>
                <CheckIcon className="h-5 w-5" />
              </button>
              <button
                key="cancel"
                className="inline-block text-gray-400 hover:text-red-600 focus:outline-none focus:ring focus:ring-red-200"
                type="button"
                onClick={cancelSectionDraft}
              >
                <span className="sr-only">Cancel</span>
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="text-lg font-bold">{props.section.name}</div>
            <div className="invisible flex gap-2 group-hover/heading:visible">
              <button
                className="inline-block rounded-full text-gray-400 hover:text-gray-600 focus:outline-none focus:ring"
                type="button"
                onClick={onClickRenameSection}
                title="Rename"
              >
                <span className="sr-only">Edit {props.section.name}</span>
                <PencilSquareIcon className="h-5 w-5" />
              </button>
              <button
                className="inline-block text-gray-400 hover:text-red-600 focus:outline-none focus:ring focus:ring-red-200"
                type="button"
                onClick={onClickRemoveSection}
                title="Remove"
              >
                <span className="sr-only">Remove {props.section.name}</span>
                <Trash24OutlineIcon className="h-5 w-5" />
              </button>
            </div>
          </>
        )}
      </div>
      {props.section.type === "simple" ? (
        <TextArea
          name={`sections-${props.index}-description`}
          value={props.section.description}
          onChange={onChange}
          formControlProps={{ containerProps: { className: "pt-2" } }}
        />
      ) : (
        <>
          <div className="divide-y divide-dashed">
            {props.section.groups.map((group, groupIndex) => (
              <div
                key={groupIndex}
                className="group/group relative flex flex-col gap-4 pb-4 pt-6"
              >
                <div className="invisible absolute right-0 top-2 z-10 group-hover/group:visible">
                  <SmallIconButton
                    disabled={!canMoveUp(groupIndex)}
                    onClick={() => moveUp(props.index, groupIndex)}
                    title="Move up"
                  >
                    <span className="sr-only">Move up</span>
                    <ArrowUpIcon className="w-4 h-4" />
                  </SmallIconButton>
                  <SmallIconButton
                    disabled={!canMoveDown(groupIndex)}
                    onClick={() => moveDown(props.index, groupIndex)}
                    title="Move down"
                  >
                    <span className="sr-only">Move down</span>
                    <ArrowDownIcon className="w-4 h-4" />
                  </SmallIconButton>
                  <SmallIconButton
                    onClick={() => removeSectionGroup(props.index, groupIndex)}
                    title="Remove"
                  >
                    <span className="sr-only">
                      Remove group {groupIndex + 1}
                    </span>
                    <Trash20Icon className="w-4 h-4" />
                  </SmallIconButton>
                </div>
                <SimpleInput
                  label="Title"
                  name={`sections-${props.index}-groups-${groupIndex}-title`}
                  value={group.title}
                  onChange={onChange}
                />
                <TextArea
                  label="Description"
                  name={`sections-${props.index}-groups-${groupIndex}-description`}
                  value={group.description}
                  onChange={onChange}
                />
              </div>
            ))}
          </div>
          <SimpleBorderButton onClick={() => addSectionGroup(props.index)}>
            Add {props.section.name}
          </SimpleBorderButton>
        </>
      )}
    </div>
  );
};

interface SimpleSection {
  type: "simple";
  name: string;
  description: string;
}

interface DetailedSection {
  type: "detailed";
  name: string;
  groups: Group[];
}

type Section = SimpleSection | DetailedSection;

interface Group {
  title: string;
  description: string;
}

function buildDetailedSection(
  name: string = "Untitled section",
  groups: Group[] = [buildGroup()]
): DetailedSection {
  return { type: "detailed", name, groups };
}

function buildSimpleSection(
  name: string = "Untitled section",
  description: string = ""
): SimpleSection {
  return { type: "simple", name, description };
}

function buildGroup(): Group {
  return { title: "", description: "" };
}

const Link: React.FC<React.PropsWithChildren<ReactPDF.LinkProps>> = (props) => (
  <ReactPDFLink {...props} style={{ display: "flex", ...props.style }} />
);

const Doc: React.FC<{ usingCustomPDFViewer?: boolean }> = (props) => {
  const { name, email, tel, location, sections } = useAtomValue(contentAtom);
  return (
    <Document>
      <Page
        size="A4"
        style={{
          display: "flex",
          flexDirection: "column",
          fontFamily: "Inter",
          backgroundColor: "#FFFFFF",
          fontSize: "9pt",
        }}
      >
        <View
          style={{
            padding: "36px 34px 62px",
          }}
        >
          <View
            style={{
              display: "flex",
              flexDirection: "column",
              marginBottom: 16,
            }}
          >
            <Text
              style={{ fontWeight: "bold", fontSize: "21pt", paddingBottom: 4 }}
            >
              {name}
            </Text>
            <View style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {location && (
                <View
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    gap: "4pt",
                  }}
                >
                  {props.usingCustomPDFViewer ? (
                    <MapPinIcon style={{ width: "12pt", height: "12pt" }} />
                  ) : (
                    <Svg
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      style={{ width: "12pt", height: "12pt" }}
                    >
                      <Path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <Path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
                      />
                    </Svg>
                  )}
                  <Text>{location}</Text>
                </View>
              )}
              {email && (
                <View
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    gap: "4pt",
                  }}
                >
                  {props.usingCustomPDFViewer ? (
                    <EnvelopeIcon style={{ width: "12pt", height: "12pt" }} />
                  ) : (
                    <Svg
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      style={{ width: "12pt", height: "12pt" }}
                    >
                      <Path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                      />
                    </Svg>
                  )}
                  <Link src={`mailto:${email}`} style={{ display: "flex" }}>
                    {email}
                  </Link>
                </View>
              )}
              {tel && (
                <View
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    gap: "4pt",
                  }}
                >
                  {props.usingCustomPDFViewer ? (
                    <PhoneIcon style={{ width: "12pt", height: "12pt" }} />
                  ) : (
                    <Svg
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      style={{ width: "12pt", height: "12pt" }}
                    >
                      <Path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"
                      />
                    </Svg>
                  )}
                  <Text>{tel}</Text>
                </View>
              )}
            </View>
          </View>
          {sections.map((section, sectionIndex) => (
            <View
              key={sectionIndex}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 6,
                marginBottom: 16,
              }}
            >
              <Text
                style={{
                  fontWeight: "bold",
                  fontSize: "12pt",
                }}
              >
                {section.name}
              </Text>
              {section.type === "simple"
                ? section.description && (
                    <MarkdownView raw={section.description} />
                  )
                : section.groups.map((group, groupIndex) => (
                    <View
                      key={groupIndex}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        marginBottom: 8,
                        gap: 6,
                      }}
                    >
                      {group.title && (
                        <Text style={{ fontWeight: "bold" }}>
                          {group.title}
                        </Text>
                      )}
                      {group.description && (
                        <MarkdownView raw={group.description} />
                      )}
                    </View>
                  ))}
            </View>
          ))}
        </View>
      </Page>
    </Document>
  );
};

const MarkdownView: React.FC<ReactPDF.ViewProps & { raw: string }> = memo(
  function (props) {
    const { raw, ...viewProps } = props;
    return (
      <View {...viewProps}>
        {marked.lexer(raw).map((token, idx) => (
          <MarkdownResolver key={idx} token={token} />
        ))}
      </View>
    );
  }
);

const MarkdownResolver: React.FC<{ token: marked.Token }> = (props) => {
  switch (props.token.type) {
    case "paragraph":
      return props.token.tokens.map((token2, idx) => {
        if (token2.type === "link") {
          return (
            <Link key={idx} src={token2.href}>
              {token2.text}
            </Link>
          );
        }
        return (
          <Text key={idx} style={{ flexShrink: 1 }}>
            {token2.raw}
          </Text>
        );
      });
    case "space":
      return <View style={{ display: "flex", height: 6 }} />;
    case "list":
      return (
        <View
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 4,
          }}
        >
          {props.token.items.map((token2, index) => (
            <Text key={index}>• {token2.text}</Text>
          ))}
        </View>
      );
    default:
      return <Text>{props.token.raw}</Text>;
  }
};
