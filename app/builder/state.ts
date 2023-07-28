import { atomWithStorage } from "jotai/utils";
import { Profile } from "./profile";
import {
  Section,
  buildChipSection,
  buildGroup,
  buildGroupedSection,
  buildSimpleSection,
} from "./sections";
import { focusAtom } from "jotai-optics";
import { StandardPageSize } from "@react-pdf/types";
import { createEventBus } from "../event-bus";

interface Resume {
  profile: Profile;
  sections: Section[];
}

const contentAtom = atomWithStorage<Resume>("openprofile-resume", {
  profile: {
    photo: "",
    name: "John Doe",
    jobTitle: "Software Engineer",
    location: "Cupertino, California",
    email: "example@email.com",
    tel: "(555) 123-4567",
    link: "https://example.com",
    link2: "",
    link3: "",
  },
  sections: [
    buildSimpleSection("Summary"),
    buildGroupedSection("Experience", [buildGroup("Junior Software Engineer")]),
    buildGroupedSection("Education", [
      buildGroup("Bachelor of Science in Computer Science"),
    ]),
    buildChipSection("Skills", ["Web Development", "Web Services", "Security"]),
  ],
});

export const profileAtom = focusAtom(contentAtom, (optic) =>
  optic.prop("profile"),
);

export const sectionsAtom = focusAtom(contentAtom, (optic) =>
  optic.prop("sections"),
);

interface PageSettings {
  size: StandardPageSize;
}

const pageSettingsAtom = atomWithStorage<PageSettings>(
  "openprofile-page-settings",
  {
    size: "LETTER",
  },
);

export const pageSizeAtom = focusAtom(pageSettingsAtom, (optic) =>
  optic.prop("size"),
);

export const eventBus = createEventBus<"reorder-section">();
