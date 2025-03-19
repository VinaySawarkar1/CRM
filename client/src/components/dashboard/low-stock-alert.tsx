import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { Inventory } from "@shared/schema";
import { Link } from "wouter";

interface LowStockAlertProps {
  items: Inventory[];
  onRestock: () => void;
}

export default function LowStockAlert({ items, onRestock }: LowStockAlertProps) {
  const getStockBadgeClass = (quantity: number, threshold: number) => {
    if (quantity <= threshold / 2) {
      return 'bg-red-100 text-red-800';
    } else {
      return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <Card className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-4 py-5 border-b border-gray-200 bg-[#800000] sm:px-6">
        <h3 className="text-lg font-semibold text-white cinzel">Low Stock Alerts</h3>
      </div>
      <CardContent className="p-4">
        <ul className="divide-y divide-gray-200">
          {items.length > 0 ? (
            items.map((item) => (
              <li key={item.id} className="py-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{item.name}</p>
                    <p className="text-xs text-gray-500">SKU: {item.sku}</p>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStockBadgeClass(item.quantity, item.threshold)}`}>
                    {item.quantity} Left
                  </span>
                </div>
              </li>
            ))
          ) : (
            <li className="py-6 text-center text-gray-500">
              No low stock items. Inventory levels are good!
            </li>
          )}
        </ul>
        {items.length > 0 && (
          <div className="mt-4 flex justify-center">
            <Button
              onClick={onRestock}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#800000] hover:bg-[#4B0000] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#800000]"
            >
              <ShoppingCart className="mr-2 h-4 w-4" />
              Restock Inventory
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
