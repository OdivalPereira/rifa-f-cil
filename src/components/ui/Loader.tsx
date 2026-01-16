import { Loader2 } from "lucide-react";

export const Loader = () => {
  return (
    <div className="h-screen w-full flex items-center justify-center">
      <Loader2 className="animate-spin w-10 h-10 text-gold" />
    </div>
  );
};
