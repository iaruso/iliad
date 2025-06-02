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
    { target: '[data-joyride="default"]', content: 'default.steps.default', placement: 'center' },
    { target: '[data-joyride="globe"]', content: 'default.steps.globe', placement: 'right' },
    { target: '[data-joyride="timeline"]', content: 'default.steps.timeline', placement: 'top' },
    { target: '[data-joyride="data"]', content: 'default.steps.data', placement: 'left' },
    { target: '[data-joyride="helper"]', content: 'default.steps.more', placement: 'top' },
  ],
  globe: [
    { target: '[data-joyride="globe"]', content: 'globe.steps.default', placement: 'right' },
    { target: '[data-joyride="globe-controls"]', content: 'globe.steps.controls', placement: 'bottom' },
    { target: '[data-joyride="settings"]', content: 'globe.steps.settings', placement: 'top' },
  ],
  timeline: [
    { target: '[data-joyride="timeline"]', content: 'timeline.steps.default', placement: 'top' },
    { target: '[data-joyride="timeline-controls"]', content: 'timeline.steps.controls', placement: 'top' },
    { target: '[data-joyride="timeline-bar"]', content: 'timeline.steps.moment', placement: 'top' }
  ],
  dataAll: [
    { target: '[data-joyride="data"]', content: 'data.steps.default', placement: 'left' },
    { target: '[data-joyride="data-table"]', content: 'data.steps.table', placement: 'bottom' },
    { target: '[data-joyride="data-filters"]', content: 'data.steps.filters', placement: 'bottom' },
    { target: '[data-joyride="data-add"]', content: 'data.steps.add', placement: 'bottom' },
    { target: '[data-joyride="data-stats"]', content: 'data.steps.stats', placement: 'top' },
    { target: '[data-joyride="data-row"]', content: 'data.steps.select', placement: 'bottom' },
  ],
  dataOne: [
    { target: '[data-joyride="data"]', content: 'data.steps.default', placement: 'left' },
    { target: '[data-joyride="data-metrics"]', content: 'data.steps.metrics', placement: 'bottom' },
    { target: '[data-joyride="data-stats"]', content: 'data.steps.stats', placement: 'top' },
    { target: '[data-joyride="data-raw"]', content: 'data.steps.raw', placement: 'top' },
    { target: '[data-joyride="data-ocean-viewer"]', content: 'data.steps.oceanViewer', placement: 'top' },
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
      offset: 0,
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
      if (!document.cookie.split('; ').find(row => row.startsWith('tutorial='))) {
        const expires = new Date();
        expires.setFullYear(expires.getFullYear() + 1);
        document.cookie = `tutorial=true; expires=${expires.toUTCString()}; path=/`;
      }
    }
  };

  return (
    <JoyrideContext.Provider value={{ startTour }}>
      <Joyride
        disableScrolling
        disableScrollParentFix
        steps={steps}
        run={run}
        showSkipButton
        hideCloseButton
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
