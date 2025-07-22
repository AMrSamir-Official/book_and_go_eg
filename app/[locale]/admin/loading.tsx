import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-white text-black dark:bg-black dark:text-white transition-colors duration-300">
      <div className="flex flex-col items-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground dark:text-gray-400">
          Loading, please wait...
        </p>
      </div>
    </div>
  );
}
