// src/components/ui/Button.tsx
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
}

export function Button({ children, loading, disabled, ...props }: ButtonProps) {
  return (
    <button
      {...props}
      disabled={loading || disabled}
      className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition ${
        props.className || ''
      }`}
    >
      {loading ? 'Loading...' : children}
    </button>
  );
}