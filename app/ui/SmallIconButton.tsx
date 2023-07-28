import { twMerge } from "tailwind-merge";

const SmallIconButton: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement>
> = ({ className, ...props }) => (
  <button
    className={twMerge(
      "relative inline-block p-1.5 text-gray-400 disabled:before:hidden before:absolute before:left-1/2 before:top-1/2 before:-z-10 before:-translate-x-1/2 before:-translate-y-1/2 before:rounded-full hover:before:bg-gray-100 before:p-3 before:content-[''] enabled:hover:text-gray-600 focus:outline-none focus:ring",
      className,
    )}
    type="button"
    {...props}
  />
);

export default SmallIconButton;
