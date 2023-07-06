import { FC, useRef, useEffect } from "react";

type Props = {
  data: string;
  error: string;
};

export const Output: FC<Props> = ({ data, error }) => {
  const refBox = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const elBox = refBox.current;
    if (elBox) {
      elBox.scrollTop = elBox.scrollHeight;
    }
  }, [data]);

  return (
    <>
      <h2 className="text-xl lg:text-2xl p-4">Output</h2>
      <div
        ref={refBox}
        className="flex-1 !overflow-auto h-outputBox mb-14 bg-slate-300 relative"
      >
        <pre className="m-4 text-[1em] whitespace-pre-wrap break-words">
          {data && data}
        </pre>
        <pre className="m-4 text-[1.1em] whitespace-pre-wrap text-red-600">
          {error && error}
        </pre>
      </div>
    </>
  );
};
