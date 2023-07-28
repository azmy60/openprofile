import { memo } from "react";
import { PDFIconProps } from "./icons";
import GithubIcon from "./icons/GithubIcon";
import YoutubeIcon from "./icons/YoutubeIcon";
import LinkIcon from "./icons/LinkIcon";

const IconLinkResolver: React.FC<
  PDFIconProps & { url: string; color?: string }
> = memo(
  function (props) {
    const { url, color, ...rest } = props;
    try {
      const hostname = new URL(url).hostname;
      if (hostname.endsWith("github.com"))
        return <GithubIcon {...rest} {...(color && { fill: color })} />;
      if (hostname.endsWith("youtube.com"))
        return <YoutubeIcon {...rest} {...(color && { fill: color })} />;
    } catch (e) {}
    return <LinkIcon {...rest} {...(color && { fill: color })} />;
  },
  (prev, next) => prev.url === next.url,
);

export default IconLinkResolver;
