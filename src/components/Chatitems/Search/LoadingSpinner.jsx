import React from "react";
import { Loader2 } from "lucide-react";

export const LoadingSpinner = () => {
  return (
    <div className="mt-6 flex justify-center">
      <Loader2 className="animate-spin h-8 w-8 text-orange-500" />
    </div>
  );
};