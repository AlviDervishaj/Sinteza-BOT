import * as React from "react";
import * as ToastR from "@radix-ui/react-toast";
import { formatDate, oneWeekAway } from "../../../utils/utils";
import { Process } from "../../../utils/Process";

export const Toast = ({
  removePreviousProcess,
  process,
}: {
  process: Process;
  removePreviousProcess: (process: Process) => void;
}) => {
  const [open, setOpen] = React.useState(false);
  const eventDateRef = React.useRef(new Date());
  const timerRef = React.useRef(0);

  React.useEffect(() => {
    return () => clearTimeout(timerRef.current);
  }, []);

  return (
    <ToastR.Provider swipeDirection="right">
      <button
        className="inline-flex items-center justify-center rounded font-medium text-[15px] px-[15px] leading-[35px] h-[35px] bg-white text-violet11 shadow-[0_2px_10px] shadow-blackA7 outline-none hover:bg-mauve3 focus:shadow-[0_0_0_2px] focus:shadow-black"
        onClick={() => {
          setOpen(false);
          window.clearTimeout(timerRef.current);
          timerRef.current = window.setTimeout(() => {
            eventDateRef.current = oneWeekAway();
            setOpen(true);
          }, 100);
        }}
      >
        Remove Bot
      </button>

      <ToastR.Root
        className="bg-slate-800 rounded-md shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] p-[15px] flex flex-col items-start content-center justify-between space-y-4 data-[state=open]:animate-slideIn data-[state=closed]:animate-hide data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=cancel]:translate-x-0 data-[swipe=cancel]:transition-[transform_200ms_ease-out] data-[swipe=end]:animate-swipeOut"
        open={open}
        onOpenChange={setOpen}
      >
        <ToastR.Title className="mb-[5px] font-medium text-slate-100 text-[15px]">
          Do you want to remove bot for {process.username} at {process.device} ?
        </ToastR.Title>
        <ToastR.Description asChild>
          <time
            className="m-0 text-slate-200 font-bold tracking-wider text-[13px] leading-[1.3]"
            dateTime={new Date().toISOString()}
          >
            {formatDate(new Date())}
          </time>
        </ToastR.Description>
        <ToastR.Action asChild altText="Remove Process">
          <button
            onClick={() => {
              removePreviousProcess(process);
            }}
            className="w-fit h-fit px-3 py-1 border-2 border-slate-100 hover:bg-slate-100 hover:text-slate-800 text-white font-semibold rounded-md"
          >
            Remove
          </button>
        </ToastR.Action>
      </ToastR.Root>
      <ToastR.Viewport className="[--viewport-padding:_25px] fixed bottom-0 right-0 flex flex-col p-[var(--viewport-padding)] gap-[10px] w-[390px] max-w-[100vw] m-0 list-none z-[2147483647] outline-none" />
    </ToastR.Provider>
  );
};
