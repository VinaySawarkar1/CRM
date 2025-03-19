import { useState } from "react";
import { Task } from "@shared/schema";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Edit, Trash, Check, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format, isAfter, isBefore, isToday } from "date-fns";

interface TaskTableProps {
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (id: number) => void;
  onStatusChange: (id: number, status: string) => void;
}

export default function TaskTable({ tasks, onEdit, onDelete, onStatusChange }: TaskTableProps) {
  const formatDate = (dateString: Date) => {
    const date = new Date(dateString);
    return format(date, "MMM dd, yyyy");
  };

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

  const getStatusBadgeClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in progress':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDueDateClass = (dueDate: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    
    if (isAfter(today, due)) {
      return "text-red-600 font-semibold";
    } else if (isToday(due)) {
      return "text-orange-600 font-semibold";
    } else {
      return "text-gray-800";
    }
  };

  return (
    <div className="rounded-md border overflow-hidden">
      <Table>
        <TableHeader className="bg-gray-50">
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Assigned To</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.length > 0 ? (
            tasks.map((task) => (
              <TableRow key={task.id} className={task.status === "completed" ? "bg-gray-50" : ""}>
                <TableCell className="font-medium">
                  <div className={task.status === "completed" ? "line-through text-gray-500" : ""}>{task.title}</div>
                  {task.description && (
                    <div className="text-xs text-gray-500 mt-1 truncate max-w-xs">{task.description}</div>
                  )}
                </TableCell>
                <TableCell>{task.assignedTo}</TableCell>
                <TableCell>
                  <Badge className={getPriorityBadgeClass(task.priority)}>
                    {task.priority}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge className={getStatusBadgeClass(task.status)}>
                    {task.status}
                  </Badge>
                </TableCell>
                <TableCell className={getDueDateClass(task.dueDate)}>
                  {formatDate(task.dueDate)}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {task.status !== "completed" && (
                        <DropdownMenuItem onClick={() => onStatusChange(task.id, "completed")}>
                          <Check className="mr-2 h-4 w-4 text-green-600" />
                          Mark Complete
                        </DropdownMenuItem>
                      )}
                      {task.status === "completed" && (
                        <DropdownMenuItem onClick={() => onStatusChange(task.id, "pending")}>
                          <Clock className="mr-2 h-4 w-4 text-yellow-600" />
                          Mark Pending
                        </DropdownMenuItem>
                      )}
                      {task.status === "pending" && (
                        <DropdownMenuItem onClick={() => onStatusChange(task.id, "in progress")}>
                          <Clock className="mr-2 h-4 w-4 text-blue-600" />
                          Mark In Progress
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem onClick={() => onEdit(task)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => onDelete(task.id)}
                      >
                        <Trash className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center">
                No tasks found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
