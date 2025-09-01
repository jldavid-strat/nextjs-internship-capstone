import { Project } from '@/types/db.types';
import ProjectSubHeader from './project-subheader';
import { ProjectLabelDataTable, ProjectLabelTableData } from '../data-table/project-label-table';
import { SearchX, TagsIcon } from 'lucide-react';
import { ProjectDataNotFound } from './project-not-found';
import AddProjectLabelForm from '../forms/add-project-label-modal-form';

type ProjectLabelSection = {
  projectId: Project['id'];
  projectLabels: ProjectLabelTableData[];
  canMutate: boolean;
};

export default function ProjectLabelSection({
  projectLabels,
  projectId,
  canMutate,
}: ProjectLabelSection) {
  return (
    <>
      <div className="flex w-full flex-row items-center justify-between">
        <ProjectSubHeader
          title={'Project Labels'}
          description={'Selection of labels that can be used to attach on tasks'}
          icon={<TagsIcon size={20} />}
          color="text-primary"
        />
        <AddProjectLabelForm projectId={projectId} />
      </div>
      <div className="rounded-sm">
        {projectLabels?.length === 0 ? (
          <ProjectDataNotFound
            message="No labels found for this project"
            icon={<SearchX size={40} className="text-muted-foreground" />}
          />
        ) : (
          <ProjectLabelDataTable data={projectLabels} canMutate={canMutate} />
        )}
      </div>
    </>
  );
}
