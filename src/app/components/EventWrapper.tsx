import React, { PropsWithChildren } from "react";

interface Props extends PropsWithChildren {
  isEvent: boolean;
}

const EventWrapper = ({ children, isEvent }: Props) => {
  return (
    <div className={!isEvent ? `h-full flex items-center justify-center` : ""}>
      {children}
    </div>
  );
};

export default EventWrapper;
