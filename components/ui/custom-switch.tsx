import { FC } from 'react';
import { Button } from '@/components/ui/button';

interface CustomSwitchProps {
  className?: string;
  checked: boolean;
  onChange: () => void;
  falseLabel: string;
  trueLabel: string;
}

const CustomSwitch: FC<CustomSwitchProps> = ({ className, checked, onChange, falseLabel, trueLabel  }) => {
  const buttonClass = 'border inline-flex items-center justify-center whitespace-nowrap rounded-md h-7 px-2 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow'
  console.log('checked', checked)
  return (
    <div className={`${className} h-8 rounded-md flex p-0.5 items-center text-sm bg-muted text-muted-foreground`}>
      <Button
        variant={'tab'}
        onClick={() => checked && onChange()}
        className={`${buttonClass} ${!checked ? 'text-foreground !bg-background pointer-events-none' : 'cursor-pointer'}`}
      >
        {falseLabel}
      </Button>
      <Button
        variant={'tab'}
        onClick={() => !checked && onChange()}
        className={`${buttonClass} ${checked ? 'text-foreground !bg-background pointer-events-none' : 'cursor-pointer'}`}
      >
        {trueLabel}
      </Button>
    </div>
  );
};

export default CustomSwitch;