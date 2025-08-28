import React from 'react';
import { Input } from './input';
import { Search } from 'lucide-react';

type SearchBarProps = {
  placeholder: string;
};

export default function SearchBar(searchBarProps?: SearchBarProps) {
  return (
    <div className="flex flex-1 items-center">
      <div className="relative max-w-md flex-1">
        <Search className="absolute top-1/2 left-3 -translate-y-1/2 transform" size={18} />
        <Input
          type="text"
          placeholder={searchBarProps?.placeholder}
          className="border-border h-12 w-full rounded-lg py-2 pr-4 pl-10 text-xl focus:ring focus:outline-hidden"
        />
      </div>
    </div>
  );
}
