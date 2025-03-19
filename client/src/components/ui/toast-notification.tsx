import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface NotificationProps {
  title?: string;
  message?: string;
  id?: string;
  duration?: number;
  onClose?: () => void;
}

export default function ToastNotification({
  title = "",
  message = "",
  id = "",
  duration = 5000,
  onClose
}: NotificationProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [notification, setNotification] = useState({
    title: title || "",
    message: message || "",
    id: id || "",
  });

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    // Only show the toast if there's a message
    if (notification.title || notification.message) {
      setIsVisible(true);

      // Automatically hide after duration
      timeout = setTimeout(() => {
        setIsVisible(false);
      }, duration);
    }

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [notification, duration]);

  // Function to handle dismiss
  const handleDismiss = () => {
    setIsVisible(false);
    if (onClose) onClose();
  };

  // Example method to show a new notification - this would be called from other components
  // In a real app, this would use context/state management to show notifications from anywhere
  const showNotification = (title: string, message: string, id: string = Math.random().toString()) => {
    setNotification({ title, message, id });
    setIsVisible(true);
  };

  // For demonstration, this example shows a lead notification
  // In production, we'd use a proper notification system that dispatches real notifications
  useEffect(() => {
    // For demonstration purposes - in a real app, this would be triggered by events
    // This is just for the UI demonstration
    const demoTimer = setTimeout(() => {
      showNotification(
        "New Lead Alert",
        "A new lead has been added from Industrial Solutions Inc."
      );
    }, 3000);

    return () => clearTimeout(demoTimer);
  }, []);

  if (!isVisible) return null;

  return (
    <div 
      className={cn(
        "fixed bottom-4 right-4 bg-white shadow-lg rounded-lg overflow-hidden z-50 flex transition-opacity",
        isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
      )}
      style={{ width: "350px" }}
    >
      <div className="w-2 bg-[#800000]"></div>
      <div className="px-4 py-3 w-full">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-sm font-medium text-gray-900">{notification.title}</h3>
            <p className="mt-1 text-xs text-gray-500">{notification.message}</p>
          </div>
          <button className="text-gray-400 hover:text-gray-500" onClick={handleDismiss}>
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-2 flex justify-end space-x-2">
          <button 
            className="text-xs text-[#800000] hover:text-[#4B0000] font-medium"
            onClick={handleDismiss}
          >
            View Details
          </button>
          <button 
            className="text-xs text-gray-500 hover:text-gray-700"
            onClick={handleDismiss}
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}
