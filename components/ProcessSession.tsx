import { FC } from "react";

export const ProcessSession: FC<{ session: string }> = ({ session }) => {
  return (
    <div className="w-full max-h-96 bg-slate-300 p-2 overflow-auto mb-8 rounded-md shadow-inner">
      <pre className="p-4">{session}</pre>
    </div>
  );
};
