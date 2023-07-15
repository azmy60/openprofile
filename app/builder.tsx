"use client";

import {
  type ChangeEvent,
  createContext,
  memo,
  useId,
  useEffect,
  useRef,
  useState,
} from "react";
import { CustomDynamicPDFViewer } from "./custom-react-pdf";
import ReactPDF, {
  Document,
  Link as ReactPDFLink,
  Page,
  Text,
  View,
  PDFDownloadLink,
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
} from "@heroicons/react/20/solid";
import {
  TrashIcon as Trash24OutlineIcon,
  PencilSquareIcon,
  XMarkIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";
import { moveArrayElement } from "./helpers";

const DynamicPDFDownloadLink = dynamic(() => Promise.resolve(PDFDownloadLink), {
  ssr: false,
});

export default function Builder() {
  const { onChange, content, addSection } = useContent();
  return (
    <>
      <div className="flex w-1/2 flex-col gap-4 p-4">
        <div className="relative flex flex-col gap-4 rounded-md p-4 pt-6 shadow">
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
            label="Tel"
            name="tel"
            value={content.tel}
            onChange={onChange}
          />
        </div>
        {content.sections.map((section, index) => (
          <SectionInputGroup key={index} index={index} section={section} />
        ))}
        <div className="border-t border-gray-100" />
        <SimpleBorderButton onClick={addSection}>
          Add New Section
        </SimpleBorderButton>
      </div>
      <div className="w-1/2 p-4">
        <CustomDynamicPDFViewer>
          <Doc />
        </CustomDynamicPDFViewer>
        <DynamicPDFDownloadLink
          document={<Doc />}
          className="mt-6 inline-block w-full text-center rounded border border-indigo-600 px-12 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-600 hover:text-white focus:outline-none focus:ring active:bg-indigo-500"
        >
          {({ loading, error }) => {
            if (loading) return "Loading...";
            if (error) return "Error: " + error;
            return "Download as PDF";
          }}
        </DynamicPDFDownloadLink>
      </div>
    </>
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
        className="mt-1 w-full rounded-md border-gray-200 sm:text-sm"
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
}> = (props) => {
  const id = useId();
  const ref = useRef<HTMLTextAreaElement>(null);
  useAutosizeTextArea(ref.current, props.value as string);
  return (
    <FormControl id={id} label={props.label}>
      <span className="absolute right-1 top-2 peer-only-of-type:top-6 whitespace-nowrap rounded bg-gray-50 px-1 py-0.5 text-xs text-gray-300 font-bold">
        MD
      </span>
      <textarea
        id={id}
        name={props.name}
        ref={ref}
        cols={2}
        className="mt-1 w-full resize-none rounded-md border-gray-200 sm:text-sm"
        onChange={(e) => props.onChange?.(e, e.currentTarget.value)}
        value={props.value}
        {...props.textareaProps}
      />
    </FormControl>
  );
};

const FormControl: React.FC<{
  id: string;
  label?: string;
  children: React.ReactNode;
}> = (props) => (
  <div className="relative">
    {props.label && (
      <label
        htmlFor={props.id}
        className="peer block text-xs font-medium text-gray-700"
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
    className="relative inline-block p-2 text-gray-400 before:absolute before:left-1/2 before:top-1/2 before:-z-10 before:-translate-x-1/2 before:-translate-y-1/2 before:rounded-full hover:before:bg-gray-100 before:p-4 before:content-[''] hover:text-gray-600 focus:outline-none focus:ring"
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

  function onClickEditSection() {
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
    <div className="relative flex flex-col gap-4 rounded-md p-4 pt-6 shadow">
      <div key={props.index} className="flex flex-col gap-4">
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
                  key="edit"
                  className="inline-block rounded-full text-gray-400 hover:text-gray-600 focus:outline-none focus:ring"
                  type="button"
                  onClick={onClickEditSection}
                >
                  <span className="sr-only">Edit {props.section.name}</span>
                  <PencilSquareIcon className="h-5 w-5" />
                </button>
                <button
                  key="remove"
                  className="inline-block text-gray-400 hover:text-red-600 focus:outline-none focus:ring focus:ring-red-200"
                  type="button"
                  onClick={onClickRemoveSection}
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
          />
        ) : (
          <>
            <div className="divide-y">
              {props.section.groups.map((group, groupIndex) => (
                <div
                  key={groupIndex}
                  className="group/group relative flex flex-col gap-4 pb-4 pt-6"
                >
                  <div className="invisible absolute right-0 top-2 z-10 group-hover/group:visible">
                    <SmallIconButton
                      disabled={!canMoveUp(groupIndex)}
                      onClick={() => moveUp(props.index, groupIndex)}
                    >
                      <span className="sr-only">Move up</span>
                      <ArrowUpIcon className="w-4 h-4" />
                    </SmallIconButton>
                    <SmallIconButton
                      disabled={!canMoveDown(groupIndex)}
                      onClick={() => moveDown(props.index, groupIndex)}
                    >
                      <span className="sr-only">Move down</span>
                      <ArrowDownIcon className="w-4 h-4" />
                    </SmallIconButton>
                    <SmallIconButton
                      onClick={() =>
                        removeSectionGroup(props.index, groupIndex)
                      }
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

const Doc: React.FC = () => {
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
              <Text>{location}</Text>
              <Link src={`mailto:${email}`} style={{ display: "flex" }}>
                {email}
              </Link>
              <Text>{tel}</Text>
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
            <Link key={idx} src={token2.href} style={{ display: "flex" }}>
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
