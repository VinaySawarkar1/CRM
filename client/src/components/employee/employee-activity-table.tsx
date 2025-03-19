import { EmployeeActivity } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Edit, Trash2, FileText } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface EmployeeActivityTableProps {
  activities: EmployeeActivity[];
  onEdit: (activity: EmployeeActivity) => void;
  onDelete: (id: number) => void;
}

export default function EmployeeActivityTable({ activities, onEdit, onDelete }: EmployeeActivityTableProps) {
  const formatDate = (dateString: Date) => {
    return format(new Date(dateString), "PP");
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Employee</TableHead>
            <TableHead className="hidden md:table-cell">Activities</TableHead>
            <TableHead>Issues</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {activities.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                No activity records found
              </TableCell>
            </TableRow>
          ) : (
            activities.map((activity) => (
              <TableRow key={activity.id}>
                <TableCell>{formatDate(activity.date)}</TableCell>
                <TableCell className="font-medium">{activity.employeeName}</TableCell>
                <TableCell className="hidden md:table-cell max-w-[300px] truncate">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 px-2">
                        <FileText className="h-4 w-4 mr-1" />
                        <span className="hidden sm:inline">View</span>
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl">
                      <DialogHeader>
                        <DialogTitle>Activity Details</DialogTitle>
                        <DialogDescription>Activity performed by {activity.employeeName} on {formatDate(activity.date)}</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 mt-4">
                        <div>
                          <h4 className="text-sm font-medium mb-1">Activities Performed:</h4>
                          <div className="text-sm bg-muted p-3 rounded whitespace-pre-wrap">{activity.activitiesPerformed}</div>
                        </div>
                        {activity.issues && (
                          <div>
                            <h4 className="text-sm font-medium mb-1">Issues:</h4>
                            <div className="text-sm bg-muted p-3 rounded whitespace-pre-wrap">{activity.issues}</div>
                          </div>
                        )}
                        {activity.notes && (
                          <div>
                            <h4 className="text-sm font-medium mb-1">Notes:</h4>
                            <div className="text-sm bg-muted p-3 rounded whitespace-pre-wrap">{activity.notes}</div>
                          </div>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                  {activity.activitiesPerformed.length > 60 
                    ? `${activity.activitiesPerformed.substring(0, 60)}...` 
                    : activity.activitiesPerformed}
                </TableCell>
                <TableCell>
                  {activity.issues 
                    ? (
                      <span className="text-red-500 text-sm">
                        {activity.issues.length > 30 
                          ? `${activity.issues.substring(0, 30)}...` 
                          : activity.issues}
                      </span>
                    ) 
                    : (
                      <span className="text-green-500 text-sm">None reported</span>
                    )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => onEdit(activity)}>
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => onDelete(activity.id)}>
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}