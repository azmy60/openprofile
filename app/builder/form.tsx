"use client";

import { useAtom } from "jotai";
import { produce } from "immer";
import {
  SectionForm,
  SectionType,
  buildChipSection,
  buildGroupedSection,
  buildSimpleSection,
} from "./sections";
import { SimpleBorderButton } from "../ui";
import { ProfileForm } from "./profile";
import { sectionsAtom } from "./state";

const Form: React.FC = () => {
  const [sections, setSections] = useAtom(sectionsAtom);

  function addSection(type: SectionType) {
    setSections(
      produce((draft) => {
        if (type === "simple") {
          draft.push(buildSimpleSection());
        } else if (type === "grouped") {
          draft.push(buildGroupedSection());
        } else {
          draft.push(buildChipSection());
        }
      })
    );
  }

  return (
    <div className="flex flex-col gap-12">
      <ProfileForm />
      {sections.map((section, index) => (
        <SectionForm key={index} index={index} section={section} />
      ))}
      <div className="border-t border-gray-100" />
      <div className="flex gap-2 items-center">
        <span className="text-lg font-bold mr-4">Add new section</span>
        <SimpleBorderButton onClick={() => addSection("simple")}>
          Simple
        </SimpleBorderButton>
        <SimpleBorderButton onClick={() => addSection("detailed")}>
          Grouped
        </SimpleBorderButton>
        <SimpleBorderButton onClick={() => addSection("chip")}>
          Chip
        </SimpleBorderButton>
      </div>
    </div>
  );
};

export default Form;
