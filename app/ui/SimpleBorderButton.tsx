import { twMerge } from "tailwind-merge";

const SimpleBorderButton: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    color?: "primary" | "danger";
  }
> = ({ className, ...props }) => (
  <button
    className={twMerge(
      "inline-block rounded border border-indigo-600 px-12 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-600 hover:text-white focus:outline-none focus:ring active:bg-indigo-500",
      props.color === "danger" &&
        "border-red-500 text-red-500 hover:bg-red-500 hover:text-white active:bg-red-500 active:text-white",
      className,
    )}
    type="button"
    {...props}
  />
);

export default SimpleBorderButton;
