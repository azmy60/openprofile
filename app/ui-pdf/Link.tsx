import ReactPDF, { Link as ReactPDFLink } from "@react-pdf/renderer";

const Link: React.FC<React.PropsWithChildren<ReactPDF.LinkProps>> = ({
  style,
  ...props
}) => (
  <ReactPDFLink
    {...props}
    style={{ color: "#000000", textDecoration: "none", ...style }}
  />
);

export default Link;
