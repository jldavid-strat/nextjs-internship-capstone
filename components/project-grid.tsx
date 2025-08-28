'use client';

import { createProject } from '@/actions/project.actions';
import { useUser } from '@clerk/nextjs';
import React, { useActionState } from 'react';

const projects = [
  {
    id: '1',
    name: 'Website Redesign',
    description: 'Complete overhaul of company website with modern design and improved UX',
    progress: 75,
    members: 5,
    dueDate: '2024-02-15',
    status: 'In Progress',
    color: 'bg-blue_munsell-500',
  },
  {
    id: '2',
    name: 'Mobile App Development',
    description: 'iOS and Android app development for customer portal',
    progress: 45,
    members: 8,
    dueDate: '2024-03-20',
    status: 'In Progress',
    color: 'bg-green-500',
  },
  {
    id: '3',
    name: 'Marketing Campaign',
    description: 'Q1 marketing campaign planning and execution',
    progress: 90,
    members: 3,
    dueDate: '2024-01-30',
    status: 'Review',
    color: 'bg-purple-500',
  },
  {
    id: '4',
    name: 'Database Migration',
    description: 'Migrate legacy database to new cloud infrastructure',
    progress: 30,
    members: 4,
    dueDate: '2024-04-10',
    status: 'Planning',
    color: 'bg-orange-500',
  },
  {
    id: '5',
    name: 'Security Audit',
    description: 'Comprehensive security audit and vulnerability assessment',
    progress: 60,
    members: 2,
    dueDate: '2024-02-28',
    status: 'In Progress',
    color: 'bg-red-500',
  },
  {
    id: '6',
    name: 'API Documentation',
    description: 'Create comprehensive API documentation for developers',
    progress: 85,
    members: 3,
    dueDate: '2024-02-05',
    status: 'Review',
    color: 'bg-indigo-500',
  },
];

export function AddProjectForm() {
  const [state, createProjectAction, isPending] = useActionState(createProject, undefined);

  const currentClerkId = 'user_30G2JK1c23qECrgbwdKUyRF3LZi';
  return (
    <>
      <CurrentUserDataBox />
      <section className="mb-4 w-full bg-gray-300 p-6">
        <form action={createProjectAction}>
          <div className="flex w-1/2 flex-col gap-4">
            <input
              className="rounded-xl border border-black p-2"
              type="text"
              name="title"
              required
              placeholder="Project Title"
            />
            <input
              className="rounded-xl border border-black p-2"
              type="text"
              name="description"
              placeholder="Project Description"
            />
            <div className="mb-2 flex flex-col">
              <label htmlFor="due-date">Due Date</label>
              <div className="flex flex-row gap-2">
                <input className="rounded-xl border border-black p-2" type="date" name="due-date" />
                <input
                  className="rounded-xl border border-black p-2"
                  type="time"
                  name="due-date-time"
                />
              </div>
            </div>
            <input type="hidden" name="owner-id" value={currentClerkId} />
          </div>
          <p className="text-lg text-gray-800">{!state?.success ? state?.error : state.message}</p>

          <button
            type="submit"
            className={`w-fit rounded-xl bg-gray-500 p-2 text-white ${isPending ? 'hover:cursor-progress' : 'hover:cursor-pointer'}`}
          >
            {isPending ? 'Submitting' : 'Submit'}
          </button>
        </form>
      </section>
    </>
  );
}

function CurrentUserDataBox() {
  const { user, isLoaded, isSignedIn } = useUser();

  if (!isLoaded) return <div>Clerk Loading</div>;
  if (!isSignedIn) return <div>User not logged in</div>;
  const userData = {
    clerkId: user.id,
    firsName: user.firstName,
    lastName: user.lastName,
    email: user.emailAddresses[0].emailAddress,
    imgUrl: user.imageUrl,
    createdAt: user.createdAt,
  };

  return (
    <div className="border bg-gray-300 p-6">
      <h3 className="mb-4 p-2 text-2xl font-bold">Current User</h3>
      <pre className="font-auto overflow-auto whitespace-pre-wrap">
        {JSON.stringify(userData, null, 2)}
      </pre>
    </div>
  );
}

export function ProjectGrid({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">{children}</div>
    </>
  );
}
