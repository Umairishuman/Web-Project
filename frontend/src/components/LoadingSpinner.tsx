interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  fullscreen?: boolean;
  label?: string;
}

const sizeMap = { sm: 'h-5 w-5 border-2', md: 'h-8 w-8 border-[3px]', lg: 'h-12 w-12 border-[3px]' };

export const LoadingSpinner = ({ size = 'lg', fullscreen = true, label }: SpinnerProps) => {
  const spinner = (
    <div className="flex flex-col items-center gap-3">
      <div
        className={`${sizeMap[size]} animate-spin rounded-full border-darknavy-200 border-t-primary`}
        role="status"
        aria-label={label || 'Loading'}
      />
      {label && <p className="text-sm text-darknavy-500">{label}</p>}
    </div>
  );

  if (fullscreen) {
    return <div className="flex items-center justify-center min-h-[60vh]">{spinner}</div>;
  }
  return spinner;
};
