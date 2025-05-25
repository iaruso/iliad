'use client';
import React, { createContext, useContext, useState, useCallback } from 'react';
import Joyride, { CallBackProps, Step } from 'react-joyride';
import { useTranslations } from 'next-intl';

interface JoyrideContextType {
  startTour: (tour: string) => void;
}

const JoyrideContext = createContext<JoyrideContextType>({ startTour: () => {} });

const TOURS: Record<string, Step[]> = {
  default: [
    { target: '[data-joyride="default"]', content: 'default.steps.default' },
    { target: '[data-joyride="globe"]', content: 'default.steps.globe' },
    { target: '[data-joyride="timeline"]', content: 'default.steps.timeline' },
    { target: '[data-joyride="data"]', content: 'default.steps.data' },
    { target: '[data-joyride="helper"]', content: 'default.steps.more' },
  ],
  globe: [
    { target: '[data-joyride="globe"]', content: 'globe.steps.default' },
    { target: '[data-joyride="globe-controls"]', content: 'globe.steps.controls' },
    { target: '[data-joyride="settings"]', content: 'globe.steps.settings' },
  ],
  timeline: [
    { target: '[data-joyride="timeline"]', content: 'timeline.steps.default' },
    { target: '[data-joyride="timeline-controls"]', content: 'timeline.steps.controls' },
    { target: '[data-joyride="timeline-bar"]', content: 'timeline.steps.moment' }
  ],
  dataAll: [
    { target: '[data-joyride="data"]', content: 'data.steps.default' },
    { target: '[data-joyride="data-table"]', content: 'data.steps.table' },
    { target: '[data-joyride="data-filters"]', content: 'data.steps.filters' },
    { target: '[data-joyride="data-add"]', content: 'data.steps.add' },
    { target: '[data-joyride="data-stats"]', content: 'data.steps.stats' },
    { target: '[data-joyride="data-row"]', content: 'data.steps.select' },
  ],
  dataOne: [
    { target: '[data-joyride="data"]', content: 'data.steps.default' },
    { target: '[data-joyride="data-metrics"]', content: 'data.steps.metrics' },
    { target: '[data-joyride="data-stats"]', content: 'data.steps.stats' },
    { target: '[data-joyride="data-raw"]', content: 'data.steps.raw' },
  ],
};

export const JoyrideProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const t = useTranslations('navbar.options.helper');
  const [run, setRun] = useState(false);
  const [steps, setSteps] = useState<Step[]>([]);

  const startTour = useCallback((tour: string) => {
    const tourSteps = TOURS[tour] || [];
    const translatedSteps = tourSteps.map((step, idx) => ({
      ...step,
      content: t("options." + step.content as string),
      disableBeacon: true,
      locale: {
        back: t('back'),
        close: t('close'),
        last: t('last'),
        next: t('next'),
        nextLabelWithProgress: t('nextProgress', {
          step: (idx + 1).toString(),
          steps: tourSteps.length.toString()
        }),
        skip: t('skip'),
      },
    }));
    setSteps(translatedSteps);
    setRun(true);
  }, [t]);

  const handleJoyrideCallback = (data: CallBackProps) => {
    if (data.status === 'finished' || data.status === 'skipped') {
      setRun(false);
    }
  };

  return (
    <JoyrideContext.Provider value={{ startTour }}>
      <Joyride
        steps={steps}
        run={run}
        showSkipButton
        showProgress
        callback={handleJoyrideCallback}
        continuous
        scrollOffset={0}
        styles={{
          options: {
            primaryColor: 'hsl(var(--accent))',
            overlayColor: 'rgba(var(--background-rgb), 0.9)',
            backgroundColor: 'hsl(var(--background))',
            textColor: 'hsl(var(--foreground))',
            spotlightShadow: 'none',
            zIndex: 9999,
            arrowColor: 'transparent',
          }
        }}
      />
      {children}
    </JoyrideContext.Provider>
  );
};

export const useJoyride = () => useContext(JoyrideContext);
