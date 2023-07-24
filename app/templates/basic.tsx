import { Document, Link, Page, Text, View } from "@react-pdf/renderer";
import { PDFEnvelopeIcon, PDFMapPinIcon, PDFPhoneIcon } from "../icons";
import { MarkdownView, IconLinkResolver } from "../pdf-ui";
import { useContentValue } from "../builder";

const Basic: React.FC = () => {
  const { name, email, tel, location, link, link2, link3, sections } =
    useContentValue();
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
                    <PDFMapPinIcon style={{ width: "12pt", height: "12pt" }} />
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
                    />
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
                    <PDFPhoneIcon style={{ width: "12pt", height: "12pt" }} />
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
                    />
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
                    <IconLinkResolver
                      url={link2}
                      style={{ width: "12pt", height: "12pt" }}
                    />
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
                    <IconLinkResolver
                      url={link3}
                      style={{ width: "12pt", height: "12pt" }}
                    />
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

export default Basic;
