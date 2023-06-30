import {FC, useRef, useEffect} from "react";

type Props = {
    data: string | undefined,
    error: string | undefined,
  }

export const Output: FC<Props> = ({data, error}) => {
  const refBox = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const elBox = refBox.current;
    if (elBox) {
      elBox.scrollTop = elBox.scrollHeight;
    }
  }, [data])
  return (
    <div ref={refBox} className="flex-1 overflow-auto">
      <pre className="m-4 text-[1.2em] whitespace-pre-wrap">
      {data}
      </pre>
      <pre className="m-4 text-[1.4em] whitespace-pre-wrap text-red-600">{error}</pre>
    </div>
  );
}
