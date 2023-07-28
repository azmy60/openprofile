import { twMerge } from "tailwind-merge";

const SimpleButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({
  className,
  ...props
}) => (
  <button
    className={twMerge(
      "inline-block rounded border border-indigo-600 bg-indigo-600 px-12 py-3 text-sm font-medium text-white hover:bg-transparent hover:text-indigo-600 focus:outline-none focus:ring active:text-indigo-500 disabled:bg-gray-200 disabled:border-gray-200",
      className,
    )}
    type="button"
    {...props}
  />
);

export default SimpleButton;
