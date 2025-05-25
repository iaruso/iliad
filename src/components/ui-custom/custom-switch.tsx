import { FC } from 'react';
import { Button } from '@/components/ui-custom/button';

interface CustomSwitchProps {
  className?: string;
  value: 'false' | 'true' | 'extra';
  onChange: (value: 'false' | 'true' | 'extra') => void;
  falseLabel: string;
  trueLabel: string;
  extraLabel?: string;
}

const CustomSwitch: FC<CustomSwitchProps> = ({
  className,
  value,
  onChange,
  falseLabel,
  trueLabel,
  extraLabel,
}) => {
  const buttonClass =
    'border inline-flex items-center justify-center whitespace-nowrap rounded-md !text-xs h-7 px-2 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow';

  return (
    <div
      className={`${className} h-8 rounded-md flex p-0.5 gap-0 items-center bg-muted text-muted-foreground`}
    >
      <Button
        variant={'tab'}
        onClick={() => value !== 'false' && onChange('false')}
        className={`${buttonClass} ${value === 'false' ? 'text-foreground !bg-background pointer-events-none' : 'cursor-pointer'}`}
      >
        {falseLabel}
      </Button>
      {extraLabel && (
        <Button
          variant={'tab'}
          onClick={() => value !== 'extra' && onChange('extra')}
          className={`${buttonClass} ${value === 'extra' ? 'text-foreground !bg-background pointer-events-none' : 'cursor-pointer'}`}
        >
          {extraLabel}
        </Button>
      )}
      <Button
        variant={'tab'}
        onClick={() => value !== 'true' && onChange('true')}
        className={`${buttonClass} ${value === 'true' ? 'text-foreground !bg-background pointer-events-none' : 'cursor-pointer'}`}
      >
        {trueLabel}
      </Button>
    </div>
  );
};

export default CustomSwitch;