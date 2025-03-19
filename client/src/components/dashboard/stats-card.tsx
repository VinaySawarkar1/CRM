import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Users, ShoppingCart, Package, CheckSquare } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: number;
  change?: {
    value: number;
    type: 'increase' | 'decrease' | 'warning';
    text?: string;
  };
  icon: 'leads' | 'orders' | 'inventory' | 'tasks';
  viewAllLink: string;
}

export default function StatsCard({ title, value, change, icon, viewAllLink }: StatsCardProps) {
  const icons = {
    leads: Users,
    orders: ShoppingCart,
    inventory: Package,
    tasks: CheckSquare
  };
  
  const Icon = icons[icon];
  
  return (
    <Card className="overflow-hidden shadow rounded-lg border-t-4 border-[#800000]">
      <CardContent className="p-0">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-[#A52A2A] rounded-md p-3">
              <Icon className="h-5 w-5 text-white" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
                <dd className="flex items-baseline">
                  <div className="text-2xl font-semibold text-gray-900">{value}</div>
                  
                  {change && (
                    <div 
                      className={cn(
                        "ml-2 flex items-baseline text-sm font-semibold",
                        change.type === 'increase' && "text-green-600",
                        change.type === 'decrease' && "text-red-600",
                        change.type === 'warning' && "text-yellow-600",
                      )}
                    >
                      {change.type === 'increase' && (
                        <svg className="self-center flex-shrink-0 h-4 w-4 text-green-500" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                          <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
                        </svg>
                      )}
                      
                      {change.type === 'decrease' && (
                        <svg className="self-center flex-shrink-0 h-4 w-4 text-red-500" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                          <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                        </svg>
                      )}
                      
                      {change.type === 'warning' && (
                        <svg className="self-center flex-shrink-0 h-4 w-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path>
                        </svg>
                      )}
                      
                      <span className="sr-only">
                        {change.type === 'increase' 
                          ? 'Increased by' 
                          : change.type === 'decrease'
                            ? 'Decreased by'
                            : 'Warning'
                        }
                      </span>
                      {change.text || `${change.value}%`}
                    </div>
                  )}
                </dd>
              </dl>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-50 px-4 py-3 sm:px-6">
          <div className="text-sm">
            <a href={viewAllLink} className="font-medium text-[#800000] hover:text-[#4B0000]">View all</a>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
