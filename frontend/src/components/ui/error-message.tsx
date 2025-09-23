import { AlertCircle } from 'lucide-react';

interface ErrorMessageProps {
  error: Error | { message: string };
  title?: string;
}

export function ErrorMessage({ error, title = 'Something went wrong' }: ErrorMessageProps) {
  return (
    <div className="flex items-center justify-center min-h-[200px]">
      <div className="card p-6 max-w-md w-full text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 text-sm">{error.message}</p>
      </div>
    </div>
  );
}
