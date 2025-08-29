type DefaultLabel = {
  labelName: string;
  color: string;
};

export const DEFAULT_LABELS: DefaultLabel[] = [
  {
    labelName: 'bug',
    color: '#EF4444', //red
  },
  {
    labelName: 'refactor',
    color: '#3B82F6', //blue
  },
  {
    labelName: 'feature',
    color: '#10B981', // green
  },
  {
    labelName: 'production',
    color: '#8B5CF6', // purple
  },
  {
    labelName: 'documentation',
    color: '#F59E0B', // amber
  },
] as const;

export const defaultLabelNames: Array<DefaultLabel['labelName']> = DEFAULT_LABELS.map(
  (l) => l.labelName,
);
