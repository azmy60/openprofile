import { Svg, Path } from "@react-pdf/renderer";
import { PDFIcon } from ".";
const MapPinIcon: PDFIcon = (props) => (
  <Svg
    viewBox="0 0 24 24"
    // Ignoring these ts errors until this PR
    // https://github.com/diegomura/react-pdf/pull/2363 get merged.
    // @ts-expect-error
    strokeWidth={1.5}
    stroke="currentColor"
    {...props}
  >
    <Path
      // @ts-expect-error
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
    />
    <Path
      // @ts-expect-error
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
    />
  </Svg>
);
export default MapPinIcon;
