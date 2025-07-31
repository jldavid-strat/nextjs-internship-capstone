import {
  JobPosition,
  MemberRole,
  ProjectStatus,
  TaskPriority,
  TaskStatus,
} from '../constants/enums';

type Enums = MemberRole | ProjectStatus | JobPosition | TaskPriority | TaskStatus;
type DataValueType = string | Date | number | Enums;
type Data = Record<string, DataValueType>;

type ChangeRecord = {
  oldValue: DataValueType | undefined;
  newValue: DataValueType | undefined;
};

type Changes = Record<string, ChangeRecord>;

// retrieved from: https://dev.to/digitaldrreamer/how-to-compare-diff-two-objects-2ocd
export default function getDataDiff(original: Data, current: Data): Changes | null {
  const changes: Changes = {};

  // Check current object's properties
  for (const [key, value] of Object.entries(current)) {
    if (!(key in original)) {
      changes[key] = {
        oldValue: undefined,
        newValue: value,
      };
      continue;
    }

    const originalValue = original[key];
    const currentValue = value;

    // Handle different types of comparisons
    if (
      originalValue !== currentValue &&
      String(originalValue) !== String(currentValue)
    ) {
      changes[key] = {
        oldValue: originalValue,
        newValue: currentValue,
      };
    }
  }

  // Check for removed properties
  for (const key of Object.keys(original)) {
    if (!(key in current)) {
      changes[key] = {
        oldValue: original[key],
        newValue: undefined,
      };
    }
  }

  return Object.keys(changes).length === 0 ? null : changes;
}
