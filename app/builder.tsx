"use client";

import {
  type ChangeEvent,
  type KeyboardEvent,
  memo,
  useEffect,
  useRef,
  useState,
} from "react";
import { Link, CustomPDFViewer } from "./custom-react-pdf";
import ReactPDF, {
  Document,
  Page,
  Text,
  View,
  Svg,
  Path,
  usePDF,
} from "@react-pdf/renderer";
import { marked } from "marked";
import { atom, useAtom, useAtomValue } from "jotai";
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
  MapPinIcon,
  EnvelopeIcon,
  PhoneIcon,
  GlobeAltIcon,
  PlusSmallIcon,
  EllipsisVerticalIcon,
  ArrowUpOnSquareIcon,
} from "@heroicons/react/24/outline";
import { moveArrayElement, setValueByPath, useClickAway } from "./helpers";
import {
  GithubIcon,
  NativeIconProps,
  PDFGithubIcon,
  PDFGlobeAltIcon,
  PDFIconProps,
  PDFYoutubeIcon,
  YoutubeIcon,
} from "./icons";
import {
  SimpleBorderButton,
  SimpleInput,
  SmallIconButton,
  TextArea,
} from "./ui";

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

// Iframe can't be server side rendered, so we use dynamic import to load it only on client side
export const DynamicCustomPDFViewer = dynamic(
  () => Promise.resolve(CustomPDFViewer),
  { ssr: false }
);

export default function Builder() {
  const content = useAtomValue(contentAtom);
  const { onChange, addSection } = useContent();
  const { viewerTargetContainer, viewerContainer, viewer } =
    useAutoResizeViewer();

  return (
    <div className="relative min-h-0 flex w-full overflow-y-scroll">
      <div className="flex w-1/2 flex-col gap-12 p-8">
        <WelcomeCard />
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
              label="Telephone"
              name="tel"
              value={content.tel}
              onChange={onChange}
            />
            <SimpleInput
              label="Email"
              name="email"
              value={content.email}
              onChange={onChange}
            />
            <SimpleInput
              label="Link"
              name="link"
              value={content.link}
              onChange={onChange}
            />
            <SimpleInput
              label="Link 2"
              name="link2"
              value={content.link2}
              onChange={onChange}
            />
            <SimpleInput
              label="Link 3"
              name="link3"
              value={content.link3}
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
        <div className="pt-[1px] -mt-6" />
      </div>
      <div className="sticky left-1/2 top-0 w-1/2 h-full px-4 py-4 bg-gray-300 flex flex-col">
        <div
          className="grow h-[calc(100%_-_2.5rem)] pb-4"
          ref={viewerTargetContainer}
        >
          <div className="mx-auto shadow" ref={viewerContainer}>
            <DynamicCustomPDFViewer iframeRef={viewer} className="origin-top-left">
              <Doc usingCustomPDFViewer />
            </DynamicCustomPDFViewer>
          </div>
        </div>
        <DynamicBottomBar />
      </div>
    </div>
  );
}

const WelcomeCard: React.FC = () => {
  const [welcome, setWelcome] = useAtom(welcomeAtom);
  return (
    welcome && (
      <div className="relative border rounded-md py-8 px-10 border-indigo-100">
        <h2 className="font-bold text-2xl pb-4 flex items-end leading-none">
          Hello there!
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 36 36"
            className="ml-4 w-8 h-8"
          >
            <path
              fill="#EF9645"
              d="M4.861 9.147c.94-.657 2.357-.531 3.201.166l-.968-1.407c-.779-1.111-.5-2.313.612-3.093 1.112-.777 4.263 1.312 4.263 1.312-.786-1.122-.639-2.544.483-3.331 1.122-.784 2.67-.513 3.456.611l10.42 14.72L25 31l-11.083-4.042L4.25 12.625c-.793-1.129-.519-2.686.611-3.478z"
            />
            <path
              fill="#FFDC5D"
              d="M2.695 17.336s-1.132-1.65.519-2.781c1.649-1.131 2.78.518 2.78.518l5.251 7.658c.181-.302.379-.6.6-.894L4.557 11.21s-1.131-1.649.519-2.78c1.649-1.131 2.78.518 2.78.518l6.855 9.997c.255-.208.516-.417.785-.622L7.549 6.732s-1.131-1.649.519-2.78c1.649-1.131 2.78.518 2.78.518l7.947 11.589c.292-.179.581-.334.871-.498L12.238 4.729s-1.131-1.649.518-2.78c1.649-1.131 2.78.518 2.78.518l7.854 11.454 1.194 1.742c-4.948 3.394-5.419 9.779-2.592 13.902.565.825 1.39.26 1.39.26-3.393-4.949-2.357-10.51 2.592-13.903L24.515 8.62s-.545-1.924 1.378-2.47c1.924-.545 2.47 1.379 2.47 1.379l1.685 5.004c.668 1.984 1.379 3.961 2.32 5.831 2.657 5.28 1.07 11.842-3.94 15.279-5.465 3.747-12.936 2.354-16.684-3.11L2.695 17.336z"
            />
            <g fill="#5DADEC">
              <path d="M12 32.042C8 32.042 3.958 28 3.958 24c0-.553-.405-1-.958-1s-1.042.447-1.042 1C1.958 30 6 34.042 12 34.042c.553 0 1-.489 1-1.042s-.447-.958-1-.958z" />
              <path d="M7 34c-3 0-5-2-5-5 0-.553-.447-1-1-1s-1 .447-1 1c0 4 3 7 7 7 .553 0 1-.447 1-1s-.447-1-1-1zM24 2c-.552 0-1 .448-1 1s.448 1 1 1c4 0 8 3.589 8 8 0 .552.448 1 1 1s1-.448 1-1c0-5.514-4-10-10-10z" />
              <path d="M29 .042c-.552 0-1 .406-1 .958s.448 1.042 1 1.042c3 0 4.958 2.225 4.958 4.958 0 .552.489 1 1.042 1s.958-.448.958-1C35.958 3.163 33 .042 29 .042z" />
            </g>
          </svg>
        </h2>
        <p className="leading-relaxed">
          OpenProfile is a free and open source resume builder made with
          simplicity in mind. All your information is stored in your browser.
          Feel free to use it for any purpose and share it with your colleagues!
        </p>
        <br />
        <p>
          If you have any suggestions or bug reports, please open an issue{" "}
          <a
            href="https://github.com/azmy60/openprofile"
            target="_blank"
            className="underline font-bold"
          >
            here
          </a>
          .
        </p>
        <br />
        <p>
          Thank you for using OpenProfile!{" "}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 36 36"
            className="inline w-5 h-5"
          >
            <circle fill="#FFCC4D" cx="18" cy="18" r="18" />
            <path
              fill="#664500"
              d="M27.335 22.629c-.178-.161-.444-.171-.635-.029-.039.029-3.922 2.9-8.7 2.9-4.766 0-8.662-2.871-8.7-2.9-.191-.142-.457-.13-.635.029-.177.16-.217.424-.094.628C8.7 23.472 11.788 28.5 18 28.5s9.301-5.028 9.429-5.243c.123-.205.084-.468-.094-.628zM26 19c-.419 0-.809-.265-.948-.684C24.849 17.717 24.033 16 23 16c-1.062 0-1.889 1.827-2.052 2.316-.175.523-.736.808-1.265.632-.523-.174-.807-.74-.632-1.265C19.177 17.307 20.355 14 23 14s3.823 3.307 3.948 3.684c.175.524-.108 1.091-.632 1.265-.105.034-.212.051-.316.051zm-10 0c-.419 0-.809-.265-.949-.684C14.848 17.717 14.034 16 13 16c-1.062 0-1.888 1.827-2.051 2.316-.175.523-.738.808-1.265.632-.524-.174-.807-.74-.632-1.265C9.177 17.307 10.355 14 13 14s3.823 3.307 3.949 3.684c.175.524-.108 1.091-.632 1.265-.106.034-.213.051-.317.051z"
            />
            <path
              fill="#FFAC33"
              d="M33.175 8.316s-9.042.161-15.175.161c-3.905 0-15.206-.118-15.206-.118l-.521.876c3.043 1.856 9.064 2.917 15.727 2.917 6.596 0 12.576-1.04 15.652-2.86l.078-.047s-.374-.664-.555-.929z"
            />
            <path
              fill="#5DADEC"
              d="M23.777.345c-1.212-.094-2.473-.159-3.773-.19C19.343.139 18.676.129 18 .129c-.672 0-1.336.01-1.993.025-1.302.031-2.564.096-3.777.19C5.34.88.169 2.451.169 5.287c0 3.588 8.264 5.771 17.831 5.771s17.831-2.183 17.831-5.771c0-2.835-5.168-4.405-12.054-4.942zM18 7.383c-6.861 0-12.91-.833-12.91-2.736 0-.536.494-1.023 1.339-1.449 1.153-.581 2.978-1.044 5.189-1.349 1.911-.262 4.098-.41 6.382-.41 2.291 0 4.485.148 6.4.413 2.242.31 4.086.783 5.232 1.377.807.418 1.278.894 1.278 1.418 0 1.903-6.049 2.736-12.91 2.736z"
            />
            <path
              fill="#3B94D9"
              d="M24.4 1.853c2.242.31 4.086.783 5.232 1.377l.062.017c-2.285-1.674-4.57-2.56-5.917-2.902-1.212-.094-2.473-.159-3.773-.19l.018.007L24.4 1.853zM6.429 3.199c1.153-.581 2.978-1.044 5.189-1.349L15.984.162l.023-.008c-1.302.031-2.564.096-3.777.19-1.347.342-3.633 1.227-5.919 2.902l.118-.047z"
            />
            <path
              fill="#FFCC4D"
              d="M28.472 3.375c-.66-.443-1.346-.91-2.001-1.26C23.947.765 21.063 0 18 0c-2.929 0-5.695.7-8.14 1.941-1.089.553-1.881.999-2.17 1.434h20.782z"
            />
          </svg>
        </p>
        <button
          className="absolute right-4 top-4"
          onClick={() => setWelcome(false)}
        >
          <XMarkIcon className="w-6 h-6 text-gray-600" />
        </button>
      </div>
    )
  );
};

const DynamicBottomBar = dynamic(() => Promise.resolve(BottomBar), { ssr: false });

const BottomBar: React.FC = () => {
  const [openMenu, setOpenMenu] = useState(false);
  const [instance] = usePDF({ document: <Doc /> });
  const menu = useRef<HTMLDivElement>(null);
  useClickAway(menu, () => setOpenMenu(false));

  return (
    <div className="h-10 flex gap-2">
      <a
        href={instance.url!}
        className="h-full w-full inline-flex items-center justify-center rounded border border-indigo-600 bg-indigo-600 px-12 text-sm font-medium text-white hover:bg-transparent hover:text-indigo-600 focus:outline-none focus:ring active:text-indigo-500"
        download="resume.pdf"
      >
        Download as PDF
      </a>
      <div className="relative" ref={menu}>
        <button
          className="flex items-center justify-center rounded-md h-full w-10 border border-indigo-600 text-indigo-600 hover:bg-indigo-600 hover:text-white focus:outline-none focus:ring active:bg-indigo-500"
          onClick={() => setOpenMenu((b) => !b)}
        >
          <span className="sr-only">Menu</span>
          <EllipsisVerticalIcon className="h-6 w-6" />
        </button>

        {openMenu && (
          <div
            className="absolute end-0 bottom-full mb-2 z-10 w-56 rounded-md border border-gray-100 bg-white shadow-lg"
            role="menu"
          >
            <div className="p-2">
              <a
                href={instance.url!}
                target="_blank"
                className="flex gap-2 items-center rounded-lg px-4 py-2 text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                role="menuitem"
              >
                <ArrowUpOnSquareIcon className="h-5 w-5" />
                Preview in new tab
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

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
  const editingNameArea = useRef<HTMLDivElement>(null);

  useClickAway(editingNameArea, cancelSectionDraft);

  function onClickRenameSection() {
    setEditing(true);
    setDraft(props.section.name);
  }

  function onSectionDraftChange(e: ChangeEvent<HTMLInputElement>) {
    setDraft(e.currentTarget.value);
  }

  function onSectionKeyUp(e: KeyboardEvent) {
    if (e.key === "Enter") saveSectionDraft();
    else if (e.key === "Escape") cancelSectionDraft();
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
          <div className="flex gap-4 w-full" ref={editingNameArea}>
            <input
              type="text"
              className="mt-1 w-full rounded-md border-gray-200 shadow-sm sm:text-sm"
              value={draft}
              onChange={onSectionDraftChange}
              onKeyUp={onSectionKeyUp}
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
          </div>
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
          <button
            className="inline-flex items-center rounded py-2 px-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50 focus:outline-none focus:ring"
            type="button"
            onClick={() => addSectionGroup(props.index)}
          >
            <PlusSmallIcon className="w-6 h-6" />
            Add group
          </button>
        </>
      )}
    </div>
  );
};

const IconLinkResolver: React.FC<NativeIconProps & { url: string }> = memo(
  function (props) {
    const { url, ...rest } = props;
    try {
      const hostname = new URL(url).hostname;
      if (hostname.endsWith("github.com")) return <GithubIcon {...rest} />;
      if (hostname.endsWith("youtube.com")) return <YoutubeIcon {...rest} />;
    } catch (e) {}
    return <GlobeAltIcon {...rest} />;
  },
  (prev, next) => prev.url === next.url
);

const PDFIconLinkResolver: React.FC<PDFIconProps & { url: string }> = memo(
  function (props) {
    const { url, ...rest } = props;
    try {
      const hostname = new URL(url).hostname;
      if (hostname.endsWith("github.com")) return <PDFGithubIcon {...rest} />;
      if (hostname.endsWith("youtube.com")) return <PDFYoutubeIcon {...rest} />;
    } catch (e) {}
    return <PDFGlobeAltIcon {...rest} />;
  },
  (prev, next) => prev.url === next.url
);

const Doc: React.FC<{ usingCustomPDFViewer?: boolean }> = (props) => {
  const { name, email, tel, location, link, link2, link3, sections } =
    useAtomValue(contentAtom);
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
          paddingTop: 36,
          paddingBottom: 62,
        }}
      >
        <View
          style={{
            paddingLeft: 34,
            paddingRight: 34,
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
              style={{
                fontWeight: "bold",
                fontSize: "21pt",
                paddingBottom: "12pt",
              }}
            >
              {name}
            </Text>
            <View style={{ display: "flex", flexDirection: "row", gap: 24 }}>
              <View
                style={{ display: "flex", flexDirection: "column", gap: "6pt" }}
              >
                {!!location && (
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
                        // Ignoring these until this PR https://github.com/diegomura/react-pdf/pull/2363 merged.
                        // @ts-expect-error
                        strokeWidth={1.5}
                        stroke="currentColor"
                        style={{ width: "12pt", height: "12pt" }}
                      >
                        <Path
                          // @ts-expect-error
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <Path
                          // @ts-expect-error
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
                        />
                      </Svg>
                    )}
                    <Text>{location}</Text>
                  </View>
                )}
                {!!email && (
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
                        // @ts-expect-error
                        strokeWidth={1.5}
                        stroke="currentColor"
                        style={{ width: "12pt", height: "12pt" }}
                      >
                        <Path
                          // @ts-expect-error
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
              </View>
              <View
                style={{ display: "flex", flexDirection: "column", gap: "6pt" }}
              >
                {!!tel && (
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
                        // @ts-expect-error
                        strokeWidth={1.5}
                        stroke="currentColor"
                        style={{ width: "12pt", height: "12pt" }}
                      >
                        <Path
                          // @ts-expect-error
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"
                        />
                      </Svg>
                    )}
                    <Text>{tel}</Text>
                  </View>
                )}
                {!!link && (
                  <View
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      gap: "4pt",
                    }}
                  >
                    {props.usingCustomPDFViewer ? (
                      <IconLinkResolver
                        url={link}
                        style={{ width: "12pt", height: "12pt" }}
                      />
                    ) : (
                      <PDFIconLinkResolver
                        url={link}
                        style={{ width: "12pt", height: "12pt" }}
                      />
                    )}
                    <Link src={link} style={{ display: "flex" }}>
                      {link}
                    </Link>
                  </View>
                )}
              </View>
              <View
                style={{ display: "flex", flexDirection: "column", gap: "6pt" }}
              >
                {!!link2 && (
                  <View
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      gap: "4pt",
                    }}
                  >
                    {props.usingCustomPDFViewer ? (
                      <IconLinkResolver
                        url={link2}
                        style={{ width: "12pt", height: "12pt" }}
                      />
                    ) : (
                      <PDFIconLinkResolver
                        url={link2}
                        style={{ width: "12pt", height: "12pt" }}
                      />
                    )}
                    <Link src={link2} style={{ display: "flex" }}>
                      {link2}
                    </Link>
                  </View>
                )}
                {!!link3 && (
                  <View
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      gap: "4pt",
                    }}
                  >
                    {props.usingCustomPDFViewer ? (
                      <IconLinkResolver
                        url={link3}
                        style={{ width: "12pt", height: "12pt" }}
                      />
                    ) : (
                      <PDFIconLinkResolver
                        url={link3}
                        style={{ width: "12pt", height: "12pt" }}
                      />
                    )}
                    <Link src={link3} style={{ display: "flex" }}>
                      {link3}
                    </Link>
                  </View>
                )}
              </View>
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
                      <Text style={{ fontWeight: "bold" }}>{group.title}</Text>
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

function useContent() {
  const [content, setContent] = useAtom(contentAtom);

  function onChange(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setContent(
      produce((draft) =>
        setValueByPath(draft, e.currentTarget.name, e.currentTarget.value)
      )
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
    addSection,
    removeSection,
    editSectionName,
    addSectionGroup,
    removeSectionGroup,
    moveUp,
    moveDown,
  };
}

const contentAtom = atomWithStorage<{
  welcome: boolean;
  name: string;
  email: string;
  tel: string;
  location: string;
  link: string;
  link2: string;
  link3: string;
  sections: Section[];
}>("openprofile-content", {
  welcome: true,
  name: "John Doe",
  location: "Cupertino, California, United States",
  email: "example@email.com",
  tel: "(555) 123-4567",
  link: "https://example.com",
  link2: "",
  link3: "",
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

const welcomeAtom = atom(
  (get) => get(contentAtom).welcome,
  (get, set, value: boolean) => {
    set(contentAtom, { ...get(contentAtom), welcome: value });
  }
);

function useAutoResizeViewer() {
  const targetContainerRef = useRef<HTMLElement | null>(null);
  const containerRef = useRef<HTMLElement | null>(null);
  const viewerRef = useRef<HTMLElement | null>(null);
  const observer = useRef<ResizeObserver | null>(null);

  function observe() {
    if (
      !targetContainerRef.current ||
      !containerRef.current ||
      !viewerRef.current
    ) {
      return;
    }

    observer.current = new ResizeObserver((entries) => {
      entries.forEach((entry) => {
        const contentBoxSize = entry.contentBoxSize[0];
        const mainStyle = getComputedStyle(viewerRef.current!);
        const mainInlineSize = parseFloat(mainStyle.inlineSize);
        const mainBlockSize = parseFloat(mainStyle.blockSize);

        const ratio = contentBoxSize.blockSize / mainBlockSize;
        const containerWidth = mainInlineSize * ratio;
        const containerHeight = mainBlockSize * ratio;

        viewerRef.current!.style.transform = `scale(${ratio})`;
        containerRef.current!.style.width = `${containerWidth}px`;
        containerRef.current!.style.height = `${containerHeight}px`;
      });
    });

    observer.current.observe(targetContainerRef.current!);
  }

  useEffect(() => {
    return () => observer.current?.disconnect();
  }, []);

  function viewerTargetContainer(el: HTMLDivElement) {
    targetContainerRef.current = el;
    observe();
  }

  function viewerContainer(el: HTMLDivElement) {
    containerRef.current = el;
    observe();
  }

  function viewer(el: HTMLIFrameElement) {
    viewerRef.current = el;
    observe();
  }

  return { viewerTargetContainer, viewerContainer, viewer };
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
