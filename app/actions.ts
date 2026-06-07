'use server';

import { setTaskDone } from '@/lib/onboarding';
import { getTaskContent } from '@/lib/notion-content';

export async function toggleTaskAction(taskId: string, done: boolean) {
  return setTaskDone(taskId, done);
}

export async function getTaskContentAction(notionId: string) {
  return getTaskContent(notionId);
}
