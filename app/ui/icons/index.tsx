export type NativeIconProps = React.PropsWithoutRef<
  React.SVGProps<SVGSVGElement>
> & { title?: string; titleId?: string } & React.RefAttributes<SVGSVGElement>;

export type NativeIcon = React.FC<NativeIconProps>;
