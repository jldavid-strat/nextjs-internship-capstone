import { getAllUserProject } from '@/lib/queries/project.queries';
import { formatDate } from '@/lib/utils/format_date';
import { User as DBUser, Project } from '@/types/db.types';
import { Calendar, MoreHorizontal, Users } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { capitalize } from 'lodash';
import { Badge } from './ui/badge';
import ProjectListNotFound from './project/project-list-not-found';

export default async function ProjectList({ userId }: { userId: DBUser['id'] }) {
  const { success, data } = await getAllUserProject(userId);
  if (!success || !data) return <ProjectListNotFound />;
  const projectList = data;

  return (
    <section className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {projectList?.map((project) => (
        <ProjectCard key={project.id} projectData={project} />
      ))}
    </section>
  );
}

type ProjectCardProps = {
  id: Project['id'];
  title: Project['title'];
  description: Project['description'];
  status: Project['status'];
  dueDate: Project['dueDate'];
};

function ProjectCard({ projectData }: { projectData: ProjectCardProps }) {
  return (
    <Card className="border-border border-1">
      <Link href={`/projects/${projectData.id}`}>
        <CardHeader>
          <div className="mb-4 flex items-start justify-between">
            <div className={`h-3 w-3 rounded-full ${'bg-green-400'}`} />
            <button className="hover:bg-platinum-500 rounded p-1">
              <MoreHorizontal size={16} />
            </button>
          </div>
          <CardTitle className="text-lg">{projectData.title}</CardTitle>
          {<CardDescription>{projectData.description}</CardDescription>}
        </CardHeader>

        <CardContent>
          <div className="mb-4 flex items-center justify-between text-sm">
            <div className="flex items-center">
              <Users size={16} className="mr-1" />
              {/* member count */}
              {/* {project.members} members */}
              14
            </div>
            <div className="flex items-center gap-2">
              {projectData?.dueDate ? formatDate(projectData.dueDate) : ''}
              {projectData?.dueDate && <Calendar size={16} className="mr-1" />}
            </div>
          </div>
          <div className="mb-4">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="text-muted-foreground font-medium">
                {/* {project.progress}% */}
                {/* derived value from completed tasks */}
                20%
              </span>
            </div>
            <div className="bg-french_gray-300 dark:bg-payne's_gray-400 h-2 w-full rounded-full">
              <div
                // className={`h-2 rounded-full transition-all duration-300 ${project.color}`}
                className={`h-2 rounded-full transition-all duration-300 ${'bg-green-300'}`}
                // style={{ width: `${project.progress}%` }}
                style={{ width: `20%` }}
              />
            </div>
          </div>
          <Badge className="rounded-full py-1 text-sm font-medium">
            {capitalize(projectData.status)}
          </Badge>
        </CardContent>
      </Link>
    </Card>
  );
}
