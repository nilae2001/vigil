import { SignUp } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center">
      <SignUp />
    </div>
  );
}
