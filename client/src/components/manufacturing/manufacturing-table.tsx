import { useState } from "react";
import { ManufacturingJob } from "@shared/schema";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Edit, 
  Trash2, 
  Eye, 
  Factory, 
  Play,
  CheckCircle,
  Calendar,
  User,
  Settings
} from "lucide-react";
import { format } from "date-fns";

interface ManufacturingTableProps {
  jobs: ManufacturingJob[];
  isLoading: boolean;
  onEdit: (job: ManufacturingJob) => void;
  onDelete: (id: number) => void;
  onStartProduction: (id: number) => void;
  onCompleteJob: (id: number) => void;
}

export default function ManufacturingTable({
  jobs,
  isLoading,
  onEdit,
  onDelete,
  onStartProduction,
  onCompleteJob,
}: ManufacturingTableProps) {
  const [sortField, setSortField] = useState<keyof ManufacturingJob>("createdAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const handleSort = (field: keyof ManufacturingJob) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const sortedJobs = [...jobs].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];

    if (aValue === null || aValue === undefined) return 1;
    if (bValue === null || bValue === undefined) return -1;

    if (typeof aValue === "string" && typeof bValue === "string") {
      return sortDirection === "asc" 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }

    if (typeof aValue === "number" && typeof bValue === "number") {
      return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
    }

    if (aValue instanceof Date && bValue instanceof Date) {
      return sortDirection === "asc" 
        ? aValue.getTime() - bValue.getTime()
        : bValue.getTime() - aValue.getTime();
    }

    return 0;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case "in_progress":
        return <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>;
      case "completed":
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case "cancelled":
        return <Badge className="bg-red-100 text-red-800">Cancelled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "low":
        return <Badge className="bg-gray-100 text-gray-800">Low</Badge>;
      case "medium":
        return <Badge className="bg-yellow-100 text-yellow-800">Medium</Badge>;
      case "high":
        return <Badge className="bg-orange-100 text-orange-800">High</Badge>;
      case "urgent":
        return <Badge className="bg-red-100 text-red-800">Urgent</Badge>;
      default:
        return <Badge variant="secondary">{priority}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Job No.</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(5)].map((_, i) => (
              <TableRow key={i}>
                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                <TableCell><Skeleton className="h-8 w-16" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="bg-white rounded-lg border p-8 text-center">
        <Factory className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No manufacturing jobs</h3>
        <p className="mt-1 text-sm text-gray-500">
          Get started by creating your first manufacturing job.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead 
              className="cursor-pointer hover:bg-gray-50"
              onClick={() => handleSort("jobNumber")}
            >
              <div className="flex items-center gap-1">
                Job No.
                {sortField === "jobNumber" && (
                  <span className="text-xs">
                    {sortDirection === "asc" ? "↑" : "↓"}
                  </span>
                )}
              </div>
            </TableHead>
            <TableHead 
              className="cursor-pointer hover:bg-gray-50"
              onClick={() => handleSort("description")}
            >
              <div className="flex items-center gap-1">
                Description
                {sortField === "description" && (
                  <span className="text-xs">
                    {sortDirection === "asc" ? "↑" : "↓"}
                  </span>
                )}
              </div>
            </TableHead>
            <TableHead>Department</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Status</TableHead>
            <TableHead 
              className="cursor-pointer hover:bg-gray-50"
              onClick={() => handleSort("startDate")}
            >
              <div className="flex items-center gap-1">
                Start Date
                {sortField === "startDate" && (
                  <span className="text-xs">
                    {sortDirection === "asc" ? "↑" : "↓"}
                  </span>
                )}
              </div>
            </TableHead>
            <TableHead 
              className="cursor-pointer hover:bg-gray-50"
              onClick={() => handleSort("dueDate")}
            >
              <div className="flex items-center gap-1">
                Due Date
                {sortField === "dueDate" && (
                  <span className="text-xs">
                    {sortDirection === "asc" ? "↑" : "↓"}
                  </span>
                )}
              </div>
            </TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedJobs.map((job) => (
            <TableRow key={job.id} className="hover:bg-gray-50">
              <TableCell>
                <div className="font-medium text-purple-600">
                  {job.jobNumber}
                </div>
                <div className="text-xs text-gray-500">
                  {job.orderId ? `Order #${job.orderId}` : "Internal"}
                </div>
              </TableCell>
              <TableCell>
                <div className="max-w-xs truncate">
                  {job.description}
                </div>
                <div className="text-xs text-gray-500">
                  {job.quantity} units
                </div>
              </TableCell>
              <TableCell>
                <div className="text-sm">
                  {job.department || "Production"}
                </div>
              </TableCell>
              <TableCell>
                {getPriorityBadge(job.priority)}
              </TableCell>
              <TableCell>
                {getStatusBadge(job.status)}
              </TableCell>
              <TableCell>
                <div className="text-sm">
                  {format(new Date(job.startDate), "dd-MMM")}
                </div>
                <div className="text-xs text-gray-500">
                  {format(new Date(job.startDate), "HH:mm")}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3 text-gray-400" />
                  <div className="text-sm">
                    {format(new Date(job.dueDate), "dd-MMM")}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(job)}
                    className="h-8 w-8 p-0"
                    title="Edit"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  {job.status === "pending" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onStartProduction(job.id)}
                      className="h-8 w-8 p-0 text-green-600 hover:text-green-700"
                      title="Start Production"
                    >
                      <Play className="h-4 w-4" />
                    </Button>
                  )}
                  {job.status === "in_progress" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onCompleteJob(job.id)}
                      className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700"
                      title="Complete Job"
                    >
                      <CheckCircle className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(job.id)}
                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
} 