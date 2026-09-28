export const FeatureCard = (props: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) => (
  <div className="rounded-xl border border-border bg-background p-5">
    <div className="
      size-12 rounded-lg bg-linear-to-br from-rose-300 via-fuchsia-300
      to-violet-400 p-2
      [&_svg]:stroke-white [&_svg]:stroke-2
    "
    >
      {props.icon}
    </div>

    <div className="mt-2 text-lg font-bold">{props.title}</div>

    <div className="my-3 w-8 border-t border-violet-300" />

    <div className="mt-2 text-muted-foreground">{props.children}</div>
  </div>
);
