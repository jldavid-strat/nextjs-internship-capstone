'use client';

import { formatDate } from '@/lib/utils/format_date';
import { Project } from '@/types/db.types';
import { Calendar, Filter, Search, SearchX } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { ProjectDataNotFound } from './project-not-found';
import { Input } from '../ui/input';
import { useMemo, useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Button } from '../ui/button';
import { PROJECT_STATUS_VALUES } from '@/lib/db/schema/enums';
import ProjectCardDropdown from '../dropdowns/project-card-dropdown';

const STATUS_VALUES = ['all', ...PROJECT_STATUS_VALUES];

export default function ProjectList({ projectList }: { projectList: ProjectCardProps[] }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // filter projects based on search + status
  const filteredProjects = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    return projectList.filter((project) => {
      const matchesSearch =
        !query ||
        project.title.toLowerCase().includes(query) ||
        project.description?.toLowerCase().includes(query);

      const matchesStatus = statusFilter === 'all' || project.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [searchQuery, statusFilter, projectList]);

  return (
    <div className="flex flex-col gap-4">
      {/* Search and Filter Bar */}
      <div className="flex items-center gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-3 -translate-y-1/2 transform" size={18} />
          <Input
            type="text"
            placeholder="Search projects..."
            className="border-border h-12 w-full rounded-lg py-2 pr-4 pl-10 focus:ring focus:outline-hidden"
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Filter Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="bg-input inline-flex h-12 items-center rounded-lg px-4 py-2"
            >
              <Filter size={16} className="mr-2" />
              {statusFilter === 'all' ? 'Filter' : statusFilter}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {STATUS_VALUES.map((status) => (
              <DropdownMenuItem
                key={status}
                onClick={() => setStatusFilter(status)}
                className="capitalize"
              >
                {status}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {filteredProjects.length > 0 ? (
        <section className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((project) => (
            <ProjectCard key={project.id} projectData={project} />
          ))}
        </section>
      ) : (
        <section className="flex w-full">
          <ProjectDataNotFound
            className="h-30 w-full"
            message="Cannot find this project"
            icon={<SearchX size={40} className="text-muted-foreground" />}
          />
        </section>
      )}
    </div>
  );
}

type ProjectCardProps = {
  id: Project['id'];
  title: Project['title'];
  description: Project['description'];
  status: Project['status'];
  dueDate: Project['dueDate'];
  // in percentage
  progress: number;
};

function ProjectCard({ projectData }: { projectData: ProjectCardProps }) {
  return (
    <Card className="border-border border-1">
      <Link href={`/projects/${projectData.id}`}>
        <CardHeader>
          <div className="mb-4 flex items-start justify-between">
            <div className={`h-3 w-3 rounded-full ${'bg-green-400'}`} />
            <ProjectCardDropdown projectId={projectData.id} />
          </div>
          <CardTitle className="text-lg">{projectData.title}</CardTitle>
          {<CardDescription>{projectData.description}</CardDescription>}
        </CardHeader>

        <CardContent>
          {projectData?.dueDate && (
            <div className="mb-4 flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                {projectData?.dueDate && <Calendar size={16} className="mr-1" />}
                {projectData?.dueDate ? formatDate(projectData.dueDate) : ''}
              </div>
            </div>
          )}
          <div className="mb-4">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="text-muted-foreground font-medium">{projectData.progress}%</span>
            </div>
            <div className="bg-french_gray-300 dark:bg-payne's_gray-400 h-2 w-full rounded-full">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${'bg-green-300'}`}
                style={{ width: `${projectData.progress}%` }}
              />
            </div>
          </div>
          <Badge className="rounded-full py-1 text-sm font-medium capitalize">
            {projectData.status}
          </Badge>
        </CardContent>
      </Link>
    </Card>
  );
}
