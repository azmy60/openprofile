const FormControl: React.FC<{
  id: string;
  label?: string;
  containerProps?: JSX.IntrinsicElements["div"];
  children: React.ReactNode;
}> = (props) => (
  <div {...props.containerProps}>
    <label
      htmlFor={props.id}
      className="peer block text-xs font-medium text-gray-700 [&:not(:empty)]:mb-2"
    >
      {props.label}
    </label>
    {props.children}
  </div>
);

export default FormControl;
