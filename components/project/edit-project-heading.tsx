import React from 'react';
import { Calendar } from 'lucide-react';
import { ProjectMemberData } from '@/types/db.types';
import Image from 'next/image';
import { Badge } from '../ui/badge';
import { capitalize } from 'lodash';
import { formatDate } from '../../lib/utils/format_date';

type MemberData = Pick<
  ProjectMemberData,
  'firstName' | 'lastName' | 'role' | 'primaryEmailAddress' | 'userImgLink'
>;

type EditProjectHeadingProps = {
  memberData: MemberData;
  createdAt: Date;
};

export default function EditProjectHeading({ memberData, createdAt }: EditProjectHeadingProps) {
  return (
    <>
      <section className="border-border bg-input/30 mb-4 flex flex-row justify-between rounded-sm border-1 p-4">
        <MemberData memberData={memberData} />
        <div>
          <div className="flex flex-row items-center justify-end gap-2">
            <p className="text-primary">Created At</p>
            <Calendar className="text-primary" size={20} />
          </div>
          <p className="text-muted-foreground truncate text-sm">{formatDate(createdAt)}</p>
        </div>
      </section>
    </>
  );
}

async function MemberData({ memberData }: { memberData: MemberData }) {
  return (
    <div className="flex flex-row items-center gap-2">
      <div className="flex items-center gap-3 px-3 py-2">
        {memberData.userImgLink && (
          <Image
            src={memberData.userImgLink}
            width={32}
            height={32}
            alt={`${memberData.firstName} ${memberData.lastName}`}
            className="rounded-full"
          />
        )}
        <div className="min-w-0 flex-1">
          <div className="flex flex-row items-center gap-2">
            <p className="truncate font-medium">
              {memberData.firstName} {memberData.lastName}
            </p>
            <Badge className="text-sm text-gray-500" variant={'outline'}>
              {capitalize(memberData.role)}
            </Badge>
          </div>
          <p className="text-muted-foreground truncate text-sm">{memberData.primaryEmailAddress}</p>
        </div>
      </div>
    </div>
  );
}
