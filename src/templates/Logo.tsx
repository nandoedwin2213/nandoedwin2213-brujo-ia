import { AppConfig } from '@/utils/AppConfig';

export const Logo = (props: {
  isTextHidden?: boolean;
}) => (
  <div className="flex items-center text-xl font-semibold">
    <svg
      className="mr-1 size-8 stroke-current stroke-2"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M0 0h24v24H0z" stroke="none" />
      <path d="M12 3l2.2 5.5 5.8.5-4.4 3.8 1.3 5.7L12 15.6l-4.9 2.9 1.3-5.7L4 9l5.8-.5z" />
    </svg>
    {!props.isTextHidden && AppConfig.name}
  </div>
);
