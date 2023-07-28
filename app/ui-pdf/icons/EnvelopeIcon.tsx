import { Svg, Path } from "@react-pdf/renderer";
import { PDFIcon } from ".";
const EnvelopeIcon: PDFIcon = (props) => (
  <Svg
    viewBox="0 0 24 24"
    // @ts-expect-error
    strokeWidth={1.5}
    stroke="currentColor"
    {...props}
  >
    <Path
      // @ts-expect-error
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
    />
  </Svg>
);
export default EnvelopeIcon;
