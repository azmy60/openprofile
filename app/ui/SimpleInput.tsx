import { ChangeEvent, useId } from "react";
import { twMerge } from "tailwind-merge";
import FormControl from "./FormControl";

const SimpleInput: React.FC<{
  name?: string;
  label?: string;
  type?: React.HTMLProps<HTMLInputElement>["type"];
  inputProps?: React.HTMLProps<HTMLInputElement>;
  value?: React.HTMLProps<HTMLInputElement>["value"];
  onChange?: (e: ChangeEvent<HTMLInputElement>, value: string) => void;
  FormControlProps: Partial<React.ComponentProps<typeof FormControl>>;
}> = (props) => {
  const id = useId();
  return (
    <FormControl label={props.label || ""} {...props.FormControlProps} id={id}>
      <input
        id={id}
        name={props.name}
        type={props.type || "text"}
        className={twMerge(
          "w-full rounded-md border-none bg-gray-100 py-2.5 sm:text-sm",
          props.inputProps?.className,
        )}
        value={props.value}
        onChange={(e) => props.onChange?.(e, e.currentTarget.value)}
        {...props.inputProps}
      />
    </FormControl>
  );
};

export default SimpleInput;
