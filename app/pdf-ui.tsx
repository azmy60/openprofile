import ReactPDF, { Link, Text, View } from "@react-pdf/renderer";
import { marked } from "marked";
import { memo } from "react";
import {
  PDFGithubIcon,
  PDFGlobeAltIcon,
  PDFIconProps,
  PDFYoutubeIcon,
} from "./icons";

export const MarkdownView: React.FC<ReactPDF.ViewProps & { raw: string }> =
  memo(function (props) {
    const { raw, ...viewProps } = props;
    return (
      <View {...viewProps}>
        {marked.lexer(raw).map((token, idx) => (
          <MarkdownResolver key={idx} token={token} />
        ))}
      </View>
    );
  });

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
            <Text key={index}>ΓÇó {token2.text}</Text>
          ))}
        </View>
      );
    default:
      return <Text>{props.token.raw}</Text>;
  }
};

export const IconLinkResolver: React.FC<PDFIconProps & { url: string }> = memo(
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
