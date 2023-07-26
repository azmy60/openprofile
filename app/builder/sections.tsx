"use client";

import { type ChangeEvent, type KeyboardEvent, useRef, useState } from "react";
import { useSetAtom } from "jotai";
import { produce } from "immer";
import {
  TrashIcon as Trash20Icon,
  ArrowDownIcon,
  ArrowUpIcon,
  XCircleIcon,
} from "@heroicons/react/20/solid";
import {
  TrashIcon as Trash24OutlineIcon,
  PencilSquareIcon,
  XMarkIcon,
  CheckIcon,
  PlusSmallIcon,
} from "@heroicons/react/24/outline";
import { moveArrayElement, useClickAway } from "../helpers";
import { SimpleButton, SimpleInput, SmallIconButton, TextArea } from "../ui";
import { sectionsAtom } from "../builder/state";

interface SimpleSection {
  type: SimpleSectionType;
  name: string;
  description: string;
}

interface GroupedSection {
  type: GroupedSectionType;
  name: string;
  groups: Group[];
}

interface ChipSection {
  type: ChipSectionType;
  name: string;
  chips: string[];
}

interface Group {
  title: string;
  description: string;
}

export type Section = SimpleSection | GroupedSection | ChipSection;

export type SectionType =
  | SimpleSectionType
  | GroupedSectionType
  | ChipSectionType;

type SimpleSectionType = "simple";

type GroupedSectionType = "grouped";

type ChipSectionType = "chip";

export function buildGroupedSection(
  name: string = "Untitled section",
  groups: Group[] = [buildGroup()]
): GroupedSection {
  return { type: "grouped", name, groups };
}

export function buildSimpleSection(
  name: string = "Untitled section",
  description: string = ""
): SimpleSection {
  return { type: "simple", name, description };
}

export function buildChipSection(
  name: string = "Untitled section",
  chips: string[] = ["Chip 1"]
): ChipSection {
  return { type: "chip", name, chips };
}

export function buildGroup(): Group {
  return { title: "", description: "" };
}

export const SectionForm: React.FC<{ index: number; section: Section }> = (
  props
) => {
  return (
    <div>
      <SectionInputHeading section={props.section} index={props.index} />
      <SectionInput section={props.section} index={props.index} />
    </div>
  );
};

const SectionInputHeading: React.FC<{ index: number; section: Section }> = (
  props
) => {
  const setSections = useSetAtom(sectionsAtom);
  const [draft, setDraft] = useState("");
  const [editing, setEditing] = useState(false);
  const editingNameArea = useRef<HTMLDivElement>(null);

  useClickAway(editingNameArea, cancelSectionDraft);

  function editSectionName(sectionIndex: number, name: string) {
    setSections(
      produce((draft) => {
        draft[sectionIndex].name = name;
      })
    );
  }

  function removeSection(sectionIndex: number) {
    setSections(
      produce((draft) => {
        draft.splice(sectionIndex, 1);
      })
    );
  }

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

  return (
    <div className="group/heading flex gap-4">
      {editing ? (
        <div className="flex gap-4 w-full" ref={editingNameArea}>
          <input
            type="text"
            className="mt-1 w-full rounded-md border-gray-200 sm:text-sm"
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
  );
};

const SectionInput: React.FC<{ index: number; section: Section }> = (props) => {
  const setSections = useSetAtom(sectionsAtom);

  function addGroup() {
    setSections(
      produce((draft) => {
        (draft[props.index] as GroupedSection).groups.push(buildGroup());
      })
    );
  }

  function removeGroup(groupIndex: number) {
    setSections(
      produce((draft) => {
        (draft[props.index] as GroupedSection).groups.splice(groupIndex, 1);
      })
    );
  }

  function moveGroup(groupIndex: number, targetIndex: number) {
    setSections(
      produce((draft) => {
        moveArrayElement(
          (draft[props.index] as GroupedSection).groups,
          groupIndex,
          targetIndex
        );
      })
    );
  }

  function addChip(value: string) {
    setSections(
      produce((draft) => {
        (draft[props.index] as ChipSection).chips.push(value);
      })
    );
  }

  function removeChip(index: number) {
    setSections(
      produce((draft) => {
        (draft[props.index] as ChipSection).chips.splice(index, 1);
      })
    );
  }

  function updateDescription(event: React.ChangeEvent<HTMLTextAreaElement>) {
    setSections(
      produce((draft) => {
        (draft[props.index] as SimpleSection).description = event.target.value;
      })
    );
  }

  function updateGroupTitle(index: number, value: string) {
    setSections(
      produce((draft) => {
        (draft[props.index] as GroupedSection).groups[index].title = value;
      })
    );
  }

  function updateGroupDescription(index: number, value: string) {
    setSections(
      produce((draft) => {
        (draft[props.index] as GroupedSection).groups[index].description =
          value;
      })
    );
  }

  if (props.section.type === "simple") {
    return (
      <SimpleSectionInput
        section={props.section}
        onChange={updateDescription}
      />
    );
  }

  if (props.section.type === "grouped") {
    return (
      <DetailedSectionInput
        section={props.section}
        onAddGroup={addGroup}
        onMoveGroup={moveGroup}
        onRemoveGroup={removeGroup}
        onUpdateGroupTitle={updateGroupTitle}
        onUpdateGroupDescription={updateGroupDescription}
      />
    );
  }

  return (
    <ChipSectionInput
      items={props.section.chips}
      addItem={addChip}
      removeItem={removeChip}
    />
  );
};

const SimpleSectionInput: React.FC<{
  section: SimpleSection;
  onChange: React.ComponentProps<typeof TextArea>["onChange"];
}> = (props) => (
  <TextArea
    value={props.section.description}
    onChange={props.onChange}
    formControlProps={{ containerProps: { className: "pt-2" } }}
  />
);

const DetailedSectionInput: React.FC<{
  section: GroupedSection;
  onAddGroup: () => void;
  onRemoveGroup: (index: number) => void;
  onMoveGroup: (index: number, targetIndex: number) => void;
  onUpdateGroupTitle: (index: number, title: string) => void;
  onUpdateGroupDescription: (index: number, description: string) => void;
}> = (props) => (
  <>
    <div className="divide-y divide-dashed">
      {props.section.groups.map((group, groupIndex) => (
        <div
          key={groupIndex}
          className="group/group relative flex flex-col gap-4 pb-4 pt-6"
        >
          <div className="invisible absolute right-0 top-2 z-10 group-hover/group:visible">
            <SmallIconButton
              disabled={groupIndex === 0}
              onClick={() => props.onMoveGroup(groupIndex, groupIndex - 1)}
              title="Move up"
            >
              <span className="sr-only">Move up</span>
              <ArrowUpIcon className="w-4 h-4" />
            </SmallIconButton>
            <SmallIconButton
              disabled={
                groupIndex ===
                (props.section as GroupedSection).groups.length - 1
              }
              onClick={() => props.onMoveGroup(groupIndex, groupIndex + 1)}
              title="Move down"
            >
              <span className="sr-only">Move down</span>
              <ArrowDownIcon className="w-4 h-4" />
            </SmallIconButton>
            <SmallIconButton
              onClick={() => props.onRemoveGroup(groupIndex)}
              title="Remove"
            >
              <span className="sr-only">Remove group {groupIndex + 1}</span>
              <Trash20Icon className="w-4 h-4" />
            </SmallIconButton>
          </div>
          <SimpleInput
            label="Title"
            value={group.title}
            onChange={(_, value) => props.onUpdateGroupTitle(groupIndex, value)}
          />
          <TextArea
            label="Description"
            value={group.description}
            onChange={(_, value) =>
              props.onUpdateGroupDescription(groupIndex, value)
            }
          />
        </div>
      ))}
    </div>
    <button
      className="inline-flex items-center rounded py-2 px-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50 focus:outline-none focus:ring"
      type="button"
      onClick={props.onAddGroup}
    >
      <PlusSmallIcon className="w-6 h-6" />
      Add group
    </button>
  </>
);

const ChipSectionInput: React.FC<{
  addItem: (value: string) => void;
  removeItem: (index: number) => void;
  items: string[];
}> = (props) => {
  const [value, setValue] = useState("");

  function addItem(value: string) {
    props.addItem(value);
    setValue("");
  }

  return (
    <div>
      <div className="flex gap-2 mb-3 mt-5">
        <SimpleInput
          value={value}
          onChange={(e) => setValue(e.currentTarget.value)}
          inputProps={{
            onKeyUp: (e) => {
              if (e.key === "Enter") addItem(value);
            },
          }}
        />
        <SimpleButton
          className="py-0.5 px-2 disabled:bg-gray-200 disabled:text-gray-400 disabled:border-gray-200"
          onClick={() => addItem(value)}
          disabled={!value}
        >
          Add
        </SimpleButton>
      </div>
      <div className="flex flex-wrap gap-3">
        {props.items.map((item, index) => (
          <div
            key={index}
            className="relative group p-2 rounded-md bg-gray-100 text-sm"
          >
            {item}
            <button
              className="invisible group-hover:visible absolute -top-1 -right-3"
              onClick={() => props.removeItem(index)}
            >
              <XCircleIcon className="w-5 h-5 text-red-700" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
