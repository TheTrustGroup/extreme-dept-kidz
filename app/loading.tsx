import { BrandSpinner } from "@/components/ui/PageLoader";

export default function Loading(): JSX.Element {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <BrandSpinner />
    </div>
  );
}
