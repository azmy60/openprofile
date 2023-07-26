"use client";

import { useAtom } from "jotai";
import { produce } from "immer";
import { SectionForm, buildDetailedSection } from "./sections";
import { SimpleBorderButton } from "../ui";
import { ProfileForm } from "./profile";
import { sectionsAtom } from "./state";

const Form: React.FC = () => {
  const [sections, setSections] = useAtom(sectionsAtom);

  function addSection() {
    setSections(
      produce((draft) => {
        draft.push(buildDetailedSection());
      })
    );
  }

  return (
    <>
      <ProfileForm />
      {sections.map((section, index) => (
        <SectionForm key={index} index={index} section={section} />
      ))}
      <div className="border-t border-gray-100" />
      <SimpleBorderButton onClick={addSection}>
        Add New Section
      </SimpleBorderButton>
    </>
  );
};

export default Form;
