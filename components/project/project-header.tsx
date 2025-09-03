import { ArrowLeft, Calendar, Clock, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import ProjectHeaderButtons from '../buttons/project-header-button';
import Link from 'next/link';
import { formatDate } from '@/lib/utils/format_date';
import { Project } from '@/types/db.types';

interface ProjectHeaderProps {
  project: {
    title: string;
    description?: string;
    status: string;
    dueDate: string;
    createdAt: Date;
    memberCount?: number;
    completedTasks?: number;
    totalTasks?: number;
    owner?: {
      firstName: string;
      lastName: string;
      userImgLink?: string;
    };
    recentMembers?: Array<{
      userId: string;
      firstName: string;
      lastName: string;
      userImgLink?: string;
    }>;
  };
  projectId: Project['id'];
}

const statusConfig = {
  active: { color: 'bg-primary/10 border-primary text-primary', label: 'Active' },
  completed: { color: 'bg-green-400/10 border-green-400 text-green-400', label: 'Completed' },
};

export default function ProjectHeader({ project, projectId }: ProjectHeaderProps) {
  const status =
    statusConfig[project.status as keyof typeof statusConfig] || statusConfig['active'];
  const progressPercentage = project.totalTasks
    ? Math.round(((project.completedTasks || 0) / project.totalTasks) * 100)
    : 0;

  return (
    <div className="bg-background border-border border-b">
      <div className="container px-6 py-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4">
            <Link
              href="/projects"
              className="hover:bg-accent mt-1 rounded-lg p-2 transition-all duration-200 hover:scale-105"
            >
              <ArrowLeft size={20} className="text-muted-foreground hover:text-foreground" />
            </Link>

            <div className="space-y-3">
              {/* Title and Badges */}
              <div className="flex items-center space-x-3">
                <h1 className="text-primary text-3xl font-bold">{project.title}</h1>
                <div className="flex items-center space-x-2">
                  <Badge className={status.color}>{status.label}</Badge>
                </div>
              </div>

              {/* Description */}
              {project.description && (
                <p className="text-muted-foreground max-w-2xl leading-relaxed">
                  {project.description}
                </p>
              )}

              {/* Metadata Row */}
              <div className="text-muted-foreground flex items-center space-x-6 text-sm">
                {/* Due Date */}
                {project.dueDate && (
                  <div className="flex items-center space-x-2">
                    <Calendar size={16} />
                    <span>Due {formatDate(project.dueDate)}</span>
                  </div>
                )}

                {project.createdAt && (
                  <div className="flex items-center space-x-2">
                    <Clock size={16} />
                    <span>Created {formatDate(project.createdAt)}</span>
                  </div>
                )}

                {/* Member Count */}
                {project.memberCount && (
                  <div className="flex items-center space-x-2">
                    <Users size={16} />
                    <span>
                      {project.memberCount} member{project.memberCount !== 1 ? 's' : ''}
                    </span>
                  </div>
                )}

                {/* Progress */}
                {project.totalTasks && (
                  <div className="flex items-center space-x-2">
                    <div className="h-2 w-16 overflow-hidden rounded-full bg-gray-200">
                      <div
                        className="h-full bg-blue-500 transition-all duration-300"
                        style={{ width: `${progressPercentage}%` }}
                      />
                    </div>
                    <span>
                      {project.completedTasks || 0}/{project.totalTasks} tasks
                    </span>
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-3">
                  {project.recentMembers && project.recentMembers.length > 0 && (
                    <>
                      <div className="bg-border h-4 w-px" />
                      <span className="text-muted-foreground text-sm">Team:</span>
                      <div className="flex items-center -space-x-2">
                        {project.recentMembers.slice(0, 3).map((member) => (
                          <Avatar
                            key={member.userId}
                            className="border-background h-7 w-7 border-2"
                          >
                            <AvatarImage src={member.userImgLink} alt={member.lastName} />
                            <AvatarFallback className="text-xs">
                              {member.firstName.charAt(0)}
                              {member.lastName.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                        ))}
                        {project.recentMembers.length > 3 && (
                          <div className="bg-muted border-background flex h-7 w-7 items-center justify-center rounded-full border-2">
                            <span className="text-muted-foreground text-xs font-medium">
                              +{project.recentMembers.length - 3}
                            </span>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
          <section className="flex flex-col gap-2">
            {project.owner && (
              <div className="flex items-center space-x-3">
                <span className="text-muted-foreground text-sm">Owner:</span>
                <div className="flex items-center space-x-2">
                  <Avatar className="border-background h-8 w-8 border-2">
                    <AvatarImage
                      src={project.owner.userImgLink}
                      alt={`${project.owner.firstName} ${project.owner.lastName}`}
                    />
                    <AvatarFallback className="text-xs font-medium">
                      {project.owner.firstName.charAt(0)}
                      {project.owner.lastName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">
                    {`${project.owner.firstName} ${project.owner.lastName}`}
                  </span>
                </div>
              </div>
            )}
            {/* Project Header Buttons */}
            <ProjectHeaderButtons projectId={projectId} />
          </section>
        </div>
      </div>
    </div>
  );
}
