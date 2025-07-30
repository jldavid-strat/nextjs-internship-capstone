import { pgEnum } from 'drizzle-orm/pg-core';
import * as enums from '@/lib/constants/enums';

export const projectStatusEnum = pgEnum('project_status', enums.PROJECT_STATUS_VALUES);

export const taskStatusEnum = pgEnum('task_status', [
  'in_progress',
  'planning',
  'review',
  'done',
]);

export const taskPriorityEnum = pgEnum('task_priority', enums.TASK_PRIORITY_VALUES);

export const memberRoleEnum = pgEnum('member_role_name', enums.MEMBER_ROLE_VALUES);

export const jobPositionNameEnum = pgEnum('job_position_name', enums.JOB_POSITION_VALUES);
