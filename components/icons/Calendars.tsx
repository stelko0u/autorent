import * as React from "react";
import type { SVGProps } from "react";
const SvgCalendars = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 512 512"
    width="1em"
    height="1em"
    {...props}
  >
    <path
      fill="currentColor"
      d="M192 24c0-13.3 10.7-24 24-24s24 10.7 24 24v40h128V24c0-13.3 10.7-24 24-24s24 10.7 24 24v40h32c35.3 0 64 28.7 64 64v224c0 35.3-28.7 64-64 64H160c-35.3 0-64-28.7-64-64V128c0-35.3 28.7-64 64-64h32zm256 88H160c-8.8 0-16 7.2-16 16v48h320v-48c0-8.8-7.2-16-16-16M144 352c0 8.8 7.2 16 16 16h288c8.8 0 16-7.2 16-16V224H144zM48 184v264c0 8.8 7.2 16 16 16h328c13.3 0 24 10.7 24 24s-10.7 24-24 24H64c-35.3 0-64-28.7-64-64V184c0-13.3 10.7-24 24-24s24 10.7 24 24"
    />
  </svg>
);
export default SvgCalendars;
