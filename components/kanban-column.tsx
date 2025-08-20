import { MoreHorizontal } from 'lucide-react';

export default function KanbanColumn(columnInfo: { name: string; description: string }) {
  return (
    <div className="w-80 shrink-0">
      <div className="bg-platinum-800 dark:bg-outer_space-400 border-french_gray-300 dark:border-payne's_gray-400 rounded-lg border">
        <div className="border-french_gray-300 dark:border-payne's_gray-400 border-b p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-outer_space-500 dark:text-platinum-500 font-semibold">
              {columnInfo.name}
              <span className="bg-french_gray-300 dark:bg-payne's_gray-400 ml-2 rounded-full px-2 py-1 text-xs">
                {Math.floor(Math.random() * 5) + 1}
              </span>
            </h3>
            <button className="hover:bg-platinum-500 dark:hover:bg-payne's_gray-400 rounded p-1">
              <MoreHorizontal size={16} />
            </button>
          </div>
        </div>

        {/* task lists */}

        {/* <div className="min-h-[400px] space-y-3 p-4">
                {[1, 2, 3].map((taskIndex) => (
                  <div
                    key={taskIndex}
                    className="dark:bg-outer_space-300 border-french_gray-300 dark:border-payne's_gray-400 cursor-pointer rounded-lg border bg-white p-4 transition-shadow hover:shadow-md"
                  >
                    <h4 className="text-outer_space-500 dark:text-platinum-500 mb-2 text-sm font-medium">
                      Sample Task {taskIndex}
                    </h4>
                    <p className="text-payne's_gray-500 dark:text-french_gray-400 mb-3 text-xs">
                      This is a placeholder task description
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="bg-blue_munsell-100 text-blue_munsell-700 dark:bg-blue_munsell-900 dark:text-blue_munsell-300 rounded-full px-2 py-1 text-xs font-medium">
                        Medium
                      </span>
                      <div className="bg-blue_munsell-500 flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold text-white">
                        U
                      </div>
                    </div>
                  </div>
                ))}
              </div> */}
      </div>
    </div>
  );
}
