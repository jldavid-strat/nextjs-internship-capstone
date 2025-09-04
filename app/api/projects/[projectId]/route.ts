import { getKanbanColumnsByProjectId } from '@/lib/queries/kanban_column.queries';
import { Project } from '@/types/db.types';
import { NextResponse } from 'next/server';

export async function GET(request: Request, { params }: { params: { projectId: Project['id'] } }) {
  const { projectId } = await params;

  const { success, data } = await getKanbanColumnsByProjectId(projectId);

  if (!success || !data) {
    return NextResponse.json({ error: 'Unable to retrieve task list' }, { status: 500 });
  }

  return NextResponse.json(data);
}
