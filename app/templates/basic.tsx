import { Document, Image, Page, Text, View } from "@react-pdf/renderer";
import { PDFEnvelopeIcon, PDFMapPinIcon, PDFPhoneIcon } from "../icons";
import { MarkdownView, IconLinkResolver, Link } from "../pdf-ui";
import { useContentValue } from "../builder";

const PRIMARY = "#4f46e5";
const BORDER = "#dde5f7";

const Basic: React.FC = () => {
  const {
    name,
    jobTitle,
    email,
    tel,
    location,
    link,
    link2,
    link3,
    sections,
    photo,
  } = useContentValue();
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
                      <PDFMapPinIcon
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
                      <PDFEnvelopeIcon
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
                      <PDFPhoneIcon
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
                      <Link src={link}>{link}</Link>
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
                      <Link src={link2}>{link2}</Link>
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
                      <Link src={link3}>{link3}</Link>
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
              {section.type === "simple" ? (
                section.description && (
                  <MarkdownView raw={section.description} />
                )
              ) : section.type === "detailed" ? (
                section.groups.map((group, groupIndex) => (
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
                  {section.chips.map((chip, index) => (
                    <View
                      key={index}
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
