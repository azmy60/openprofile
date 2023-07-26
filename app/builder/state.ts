import { atomWithStorage } from "jotai/utils";
import { Profile } from "./profile";
import { Section, buildChipSection, buildDetailedSection, buildSimpleSection } from "./sections";
import { useAtomValue } from "jotai";
import { focusAtom } from "jotai-optics";

interface Resume {
  profile: Profile;
  sections: Section[];
}

const contentAtom = atomWithStorage<Resume>("openprofile-resume", {
  profile: {
    photo: "",
    name: "John Doe",
    jobTitle: "Software Engineer",
    location: "Cupertino, California, United States",
    email: "example@email.com",
    tel: "(555) 123-4567",
    link: "https://example.com",
    link2: "",
    link3: "",
  },
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
    buildChipSection("Skills", [
      "Web Development",
      "Web Services",
      "Security",
      "Cloud Computing",
      "Mobile Development",
    ]),
  ],
});

export const useContentValue = () => useAtomValue(contentAtom);

export const profileAtom = focusAtom(contentAtom, (optic) =>
  optic.prop("profile")
);

export const sectionsAtom = focusAtom(contentAtom, (optic) =>
  optic.prop("sections")
);
