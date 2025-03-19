import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Calendar, User } from "lucide-react";
import { Task } from "@shared/schema";
import { Checkbox } from "@/components/ui/checkbox";
import { Link } from "wouter";

interface TasksListProps {
  tasks: Task[];
  onAddNew: () => void;
  onToggleComplete: (taskId: number, completed: boolean) => void;
}

export default function TasksList({ tasks, onAddNew, onToggleComplete }: TasksListProps) {
  const getPriorityBadgeClass = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'urgent':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-yellow-100 text-yellow-800';
      case 'medium':
        return 'bg-blue-100 text-blue-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: Date) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  return (
    <Card className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-4 py-5 border-b border-gray-200 bg-[#800000] sm:px-6 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-white cinzel">Upcoming Tasks</h3>
        <Button
          size="sm"
          variant="ghost"
          className="text-white hover:text-[#D4AF37] focus:outline-none"
          onClick={onAddNew}
        >
          <Plus className="h-5 w-5" />
        </Button>
      </div>
      <CardContent className="p-4">
        <ul className="divide-y divide-gray-200">
          {tasks.length > 0 ? (
            tasks.map((task) => (
              <li key={task.id} className="py-3 flex items-start">
                <div className="mr-4 flex-shrink-0 self-center">
                  <Checkbox
                    checked={task.status === "completed"}
                    onCheckedChange={(checked) => onToggleComplete(task.id, !!checked)}
                    className="h-5 w-5 text-[#800000] rounded border-gray-300 focus:ring-[#800000]"
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className={`text-sm font-medium ${
                      task.status === "completed" ? "text-gray-400 line-through" : "text-gray-900"
                    }`}>
                      {task.title}
                    </p>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityBadgeClass(
                        task.priority
                      )}`}
                    >
                      {task.priority}
                    </span>
                  </div>
                  <p className={`mt-1 text-sm ${
                    task.status === "completed" ? "text-gray-400" : "text-gray-500"
                  }`}>
                    {task.description}
                  </p>
                  <div className="mt-2 flex items-center">
                    <Calendar className="text-gray-400 text-sm mr-1 h-4 w-4" />
                    <span className="text-xs text-gray-500">Due {formatDate(task.dueDate)}</span>
                    <span className="mx-2 text-gray-300">|</span>
                    <User className="text-gray-400 text-sm mr-1 h-4 w-4" />
                    <span className="text-xs text-gray-500">Assigned to {task.assignedTo}</span>
                  </div>
                </div>
              </li>
            ))
          ) : (
            <li className="py-6 text-center text-gray-500">
              No tasks available. Create a new task to get started.
            </li>
          )}
        </ul>
        {tasks.length > 0 && (
          <div className="mt-4 flex justify-center">
            <Button
              variant="link"
              className="text-[#800000] hover:text-[#4B0000]"
              asChild
            >
              <Link href="/tasks">View All Tasks</Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
