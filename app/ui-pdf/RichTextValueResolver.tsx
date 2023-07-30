import { Text, View } from "@react-pdf/renderer";
import type { RichTextValue } from "@ui/RichTextEditor";
import Link from "./Link";

const RichTextValueResolver: React.FC<{ value: RichTextValue }> = (props) => {
  const val = props.value;

  if (!val) return null;

  if (!Array.isArray(val) && val.type === "doc") {
    return (
      <View style={{ display: "flex", flexDirection: "column" }}>
        <RichTextValueResolver value={val.content} />
      </View>
    );
  }

  if (Array.isArray(val)) {
    return val.map((v, idx) => <RichTextValueResolver value={v} key={idx} />);
  }

  if (val.type === "paragraph") {
    return (
      <Text
        style={{
          minHeight: "12pt",
          paddingBottom: "8pt",
          lineHeight: 1.5,
        }}
      >
        <RichTextValueResolver value={val.content} />
      </Text>
    );
  }

  if (val.type === "text") {
    const markTypes = val.marks?.map((mark) => mark.type);

    const style: React.ComponentProps<typeof Link>["style"] = {
      fontWeight: markTypes?.includes("bold") ? "bold" : undefined,
      // fontStyle: marks?.includes("italic") ? "italic" : undefined,
      textDecoration: markTypes?.includes("strike")
        ? "line-through"
        : undefined,
    };

    if (markTypes?.includes("link")) {
      return (
        <Link
          src={val.marks!.find((mark) => mark.type === "link")?.attrs?.href}
          style={style}
        >
          {val.text}
        </Link>
      );
    }

    return <Text style={style}>{val.text}</Text>;
  }

  if (val.type === "bulletList") {
    return (
      <View
        style={{
          paddingBottom: "8pt",
        }}
      >
        {val.content?.map((item, idx) => (
          <View
            key={idx}
            style={{ display: "flex", flexDirection: "row", gap: "6pt" }}
          >
            <Text>•</Text>
            <View
              style={{ display: "flex", flexDirection: "column", gap: "-8pt" }}
            >
              <RichTextValueResolver value={item.content} />
            </View>
          </View>
        ))}
      </View>
    );
  }

  if (val.type === "orderedList") {
    return (
      <View
        style={{
          paddingBottom: "8pt",
        }}
      >
        {val.content?.map((item, idx) => (
          <Text key={idx}>
            {idx + 1}. <RichTextValueResolver value={item.content} />
          </Text>
        ))}
      </View>
    );
  }

  return null;
};

export default RichTextValueResolver;
