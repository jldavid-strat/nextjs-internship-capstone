import AddProjectMemberForm from '@/components/forms/add-project-member-form';
import { getProjectMembers } from '@/lib/queries/project_member.queries';
import { Project } from '@/types/db.types';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default async function ProjectMembersPage({
  params,
}: {
  params: Promise<{ id: Project['id'] }>;
}) {
  const { id: projectId } = await params;

  const result = await getProjectMembers(projectId);

  if (!result.success || !result.data) return <div>Project Members Not Found. SADGE</div>;

  const projectMembers = result.data;
  return (
    <div className="space-y-6">
      {/* Project Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            href="/projects"
            className="hover:bg-platinum-500 dark:hover:bg-payne's_gray-400 rounded-lg p-2 transition-colors"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-outer_space-500 dark:text-platinum-500 text-3xl font-bold">
              Project Members
            </h1>
          </div>
        </div>
      </div>
      <section>
        <h2 className="text-2xl">Add Members</h2>
        <AddProjectMemberForm
          userId="9ef268db-5853-4aec-a081-650c2300103a"
          projectId="44db40ee-8ef1-4ac5-b727-d51dbda95c65"
        />
      </section>

      {/* show members */}
      <div className="w-full bg-gray-400 p-4">
        <div className="flex justify-between">
          <h3 className="text-xl font-bold">Project Members</h3>
        </div>
        <ul className="flex flex-col gap-2">
          {projectMembers.map((member, index) => (
            <li key={index}>
              <p>Name: {`${member.firstName} ${member.lastName}`}</p>
              <p>Email: {member.email}</p>
              <p>Role: {member.role}</p>
              <p>Joined At: {member.joinedAt?.toLocaleDateString()}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
