import { Document, Image, Page, Text, View } from "@react-pdf/renderer";
import { pageSizeAtom, profileAtom, sectionsAtom } from "@builder/state";
import { useAtomValue } from "jotai";
import MapPinIcon from "@ui-pdf/icons/MapPinIcon";
import EnvelopeIcon from "@ui-pdf/icons/EnvelopeIcon";
import Link from "@ui-pdf/Link";
import PhoneIcon from "@ui-pdf/icons/PhoneIcon";
import IconLinkResolver from "@ui-pdf/IconLinkResolver";
import RichTextValueResolver from "@ui-pdf/RichTextValueResolver";
import { removeUrlProtocol } from "../helpers";

const PRIMARY = "#4f46e5";
const BORDER = "#dde5f7";

const Basic: React.FC = () => {
  const { name, jobTitle, email, tel, location, link, link2, link3, photo } =
    useAtomValue(profileAtom);
  const sections = useAtomValue(sectionsAtom);
  return (
    <Document
      producer="OpenProfile"
      title={`${name} Resume`}
      author={name}
      creator="OpenProfile"
      subject="Resume"
    >
      <Page
        size={useAtomValue(pageSizeAtom)}
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
              flexDirection: "row",
              marginBottom: 16,
            }}
          >
            <View
              style={{
                display: "flex",
                flexDirection: "column",
                flexGrow: 1,
              }}
            >
              <Text
                style={{
                  fontWeight: "bold",
                  fontSize: "21pt",
                  paddingBottom: "4pt",
                }}
              >
                {name}
              </Text>
              <Text
                style={{
                  fontWeight: "bold",
                  paddingBottom: "12pt",
                }}
              >
                {jobTitle}
              </Text>
              <View style={{ display: "flex", flexDirection: "row", gap: 24 }}>
                <View
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "6pt",
                  }}
                >
                  {!!location && (
                    <View
                      style={{
                        display: "flex",
                        flexDirection: "row",
                        gap: "4pt",
                      }}
                    >
                      <MapPinIcon
                        style={{ width: "12pt", height: "12pt" }}
                        // @ts-expect-error
                        stroke={PRIMARY}
                      />
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
                      <EnvelopeIcon
                        style={{ width: "12pt", height: "12pt" }}
                        // @ts-expect-error
                        stroke={PRIMARY}
                      />
                      <Link src={`mailto:${email}`}>{email}</Link>
                    </View>
                  )}
                </View>
                <View
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "6pt",
                  }}
                >
                  {!!tel && (
                    <View
                      style={{
                        display: "flex",
                        flexDirection: "row",
                        gap: "4pt",
                      }}
                    >
                      <PhoneIcon
                        style={{ width: "12pt", height: "12pt" }}
                        // @ts-expect-error
                        stroke={PRIMARY}
                      />
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
                      <IconLinkResolver
                        url={link}
                        style={{ width: "12pt", height: "12pt" }}
                        color={PRIMARY}
                      />
                      <Link src={link}>{removeUrlProtocol(link)}</Link>
                    </View>
                  )}
                </View>
                <View
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "6pt",
                  }}
                >
                  {!!link2 && (
                    <View
                      style={{
                        display: "flex",
                        flexDirection: "row",
                        gap: "4pt",
                      }}
                    >
                      <IconLinkResolver
                        url={link2}
                        style={{ width: "12pt", height: "12pt" }}
                        color={PRIMARY}
                      />
                      <Link src={link2}>{removeUrlProtocol(link2)}</Link>
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
                      <IconLinkResolver
                        url={link3}
                        style={{ width: "12pt", height: "12pt" }}
                        color={PRIMARY}
                      />
                      <Link src={link3}>{removeUrlProtocol(link3)}</Link>
                    </View>
                  )}
                </View>
              </View>
            </View>
            {photo && (
              <Image
                src={photo}
                style={{
                  width: "64pt",
                  height: "64pt",
                  objectFit: "cover",
                  borderRadius: "32pt",
                }}
              />
            )}
          </View>
          {sections.map((section, idx) => (
            <View
              key={`${section.id}-${idx}`}
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
              {section.type === "simple" ? (
                section.description && (
                  <RichTextValueResolver value={section.description} />
                )
              ) : section.type === "grouped" ? (
                section.groups.map((group, idx) => (
                  <View
                    key={`${group.id}-${idx}`}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      marginBottom: 8,
                      gap: 6,
                    }}
                  >
                    <Text style={{ fontWeight: "bold" }}>{group.title}</Text>
                    {group.description && (
                      <RichTextValueResolver value={group.description} />
                    )}
                  </View>
                ))
              ) : section.type === "chip" ? (
                <View
                  style={{
                    width: "100%",
                    display: "flex",
                    flexDirection: "row",
                    flexWrap: "wrap",
                    gap: "8pt",
                  }}
                >
                  {section.chips.map((chip) => (
                    <View
                      key={chip}
                      style={{
                        borderWidth: "1pt",
                        borderStyle: "solid",
                        borderColor: BORDER,
                        borderRadius: "4pt",
                        padding: "6pt",
                      }}
                    >
                      <Text>{chip}</Text>
                    </View>
                  ))}
                </View>
              ) : null}
            </View>
          ))}
        </View>
      </Page>
    </Document>
  );
};

export default Basic;
