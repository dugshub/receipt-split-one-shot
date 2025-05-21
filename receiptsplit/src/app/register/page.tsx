import { RegisterForm } from "@/components/auth/register-form";

export const metadata = {
  title: "Register - SplitReceipt",
  description: "Create a new SplitReceipt account",
};

export default function RegisterPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-blue-50 to-white max-w-7xl mx-auto">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-primary">SplitReceipt</h1>
          <p className="mt-2 text-gray-600">
            Create an account to start splitting expenses
          </p>
        </div>
        <RegisterForm />
      </div>
    </div>
  );
}