import React from 'react';

type SubHeaderProps = {
  title: string;
  description: string;
  color: string;
  icon: React.ReactNode;
};
export default function SubHeader({ title, description, icon, color }: SubHeaderProps) {
  return (
    <header className={`my-4 flex flex-col gap-2 ${color}`}>
      <div className="flex flex-row items-center gap-2">
        {icon}
        <h2 className="text-md">{title}</h2>
      </div>
      <p className="text-muted-foreground text-sm">{description}</p>
    </header>
  );
}
