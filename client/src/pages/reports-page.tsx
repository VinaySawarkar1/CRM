import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/layout";
import PageHeader from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { BarChart, LineChart, PieChart } from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart as RechartsBarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart as RechartsLineChart,
  Pie,
  PieChart as RechartsPieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export default function ReportsPage() {
  const { toast } = useToast();
  const [reportPeriod, setReportPeriod] = useState("last30days");
  const [chartType, setChartType] = useState("bar");
  
  // Sample data for demonstration - would be replaced with real API data
  const { data: salesData, isLoading: isLoadingSales } = useQuery({
    queryKey: ['/api/reports/sales', reportPeriod],
    queryFn: async () => {
      try {
        // In a real app, this would fetch from a real endpoint
        // Simulating API response
        const now = new Date();
        const data = [];
        
        // Create sample data based on period
        if (reportPeriod === "last7days") {
          for (let i = 6; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            data.push({
              date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
              sales: Math.floor(Math.random() * 10000) + 5000,
              orders: Math.floor(Math.random() * 10) + 1,
            });
          }
        } else if (reportPeriod === "last30days") {
          for (let i = 0; i < 30; i += 3) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            data.push({
              date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
              sales: Math.floor(Math.random() * 30000) + 10000,
              orders: Math.floor(Math.random() * 30) + 5,
            });
          }
        } else if (reportPeriod === "lastQuarter") {
          const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
          const currentMonth = now.getMonth();
          
          for (let i = 2; i >= 0; i--) {
            const monthIndex = (currentMonth - i + 12) % 12;
            data.push({
              date: months[monthIndex],
              sales: Math.floor(Math.random() * 100000) + 50000,
              orders: Math.floor(Math.random() * 100) + 20,
            });
          }
        } else {
          // Last 12 months
          const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
          const currentMonth = now.getMonth();
          
          for (let i = 11; i >= 0; i--) {
            const monthIndex = (currentMonth - i + 12) % 12;
            data.push({
              date: months[monthIndex],
              sales: Math.floor(Math.random() * 200000) + 100000,
              orders: Math.floor(Math.random() * 200) + 50,
            });
          }
        }
        
        return data;
      } catch (error) {
        toast({
          title: "Error loading report data",
          description: error instanceof Error ? error.message : "Unknown error",
          variant: "destructive",
        });
        throw error;
      }
    }
  });
  
  const { data: leadStats, isLoading: isLoadingLeads } = useQuery({
    queryKey: ['/api/reports/leads', reportPeriod],
    queryFn: async () => {
      try {
        // Simulate lead conversion statistics
        return [
          { name: "New Leads", value: 35, color: "#0088FE" },
          { name: "In Progress", value: 25, color: "#00C49F" },
          { name: "Converted", value: 20, color: "#FFBB28" },
          { name: "Lost", value: 15, color: "#FF8042" },
          { name: "On Hold", value: 5, color: "#A4A4A4" },
        ];
      } catch (error) {
        toast({
          title: "Error loading lead statistics",
          description: error instanceof Error ? error.message : "Unknown error",
          variant: "destructive",
        });
        throw error;
      }
    }
  });
  
  const { data: categoryDistribution, isLoading: isLoadingCategories } = useQuery({
    queryKey: ['/api/reports/categories', reportPeriod],
    queryFn: async () => {
      try {
        // Simulate category distribution
        return [
          { name: "Industry", value: 30, color: "#800000" },
          { name: "Calibration Labs", value: 25, color: "#4B0000" },
          { name: "Vision Measuring Machine", value: 15, color: "#D4AF37" },
          { name: "Data Logger", value: 10, color: "#607D8B" },
          { name: "Calibration Software", value: 10, color: "#2E7D32" },
          { name: "Meatest", value: 5, color: "#C2185B" },
          { name: "Other", value: 5, color: "#5C6BC0" },
        ];
      } catch (error) {
        toast({
          title: "Error loading category distribution",
          description: error instanceof Error ? error.message : "Unknown error",
          variant: "destructive",
        });
        throw error;
      }
    }
  });
  
  const renderChart = () => {
    if (!salesData) return null;
    
    if (chartType === "bar") {
      return (
        <ResponsiveContainer width="100%" height={400}>
          <RechartsBarChart data={salesData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip formatter={(value) => ['₹' + value.toLocaleString(), 'Sales']} />
            <Legend />
            <Bar dataKey="sales" name="Sales (₹)" fill="#800000" />
          </RechartsBarChart>
        </ResponsiveContainer>
      );
    } else if (chartType === "line") {
      return (
        <ResponsiveContainer width="100%" height={400}>
          <RechartsLineChart data={salesData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip formatter={(value) => ['₹' + value.toLocaleString(), 'Sales']} />
            <Legend />
            <Line type="monotone" dataKey="sales" name="Sales (₹)" stroke="#800000" activeDot={{ r: 8 }} />
          </RechartsLineChart>
        </ResponsiveContainer>
      );
    } else {
      return (
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart data={salesData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <defs>
              <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#800000" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#800000" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip formatter={(value) => ['₹' + value.toLocaleString(), 'Sales']} />
            <Legend />
            <Area type="monotone" dataKey="sales" name="Sales (₹)" stroke="#800000" fillOpacity={1} fill="url(#colorSales)" />
          </AreaChart>
        </ResponsiveContainer>
      );
    }
  };
  
  return (
    <Layout>
      <PageHeader 
        title="Sales Reports & Analytics" 
        subtitle="Track performance metrics and gain insights into your business"
      />
      
      <div className="grid grid-cols-1 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle>Sales Performance</CardTitle>
              <CardDescription>Revenue generated over time</CardDescription>
            </div>
            <div className="flex space-x-2">
              <Select value={chartType} onValueChange={setChartType}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Chart Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bar">
                    <div className="flex items-center">
                      <BarChart className="mr-2 h-4 w-4" />
                      <span>Bar Chart</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="line">
                    <div className="flex items-center">
                      <LineChart className="mr-2 h-4 w-4" />
                      <span>Line Chart</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="area">
                    <div className="flex items-center">
                      <AreaChart className="mr-2 h-4 w-4" />
                      <span>Area Chart</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={reportPeriod} onValueChange={setReportPeriod}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Time Period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="last7days">Last 7 Days</SelectItem>
                  <SelectItem value="last30days">Last 30 Days</SelectItem>
                  <SelectItem value="lastQuarter">Last Quarter</SelectItem>
                  <SelectItem value="lastYear">Last Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {isLoadingSales ? (
              <div className="flex justify-center items-center h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#800000]"></div>
              </div>
            ) : (
              renderChart()
            )}
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Lead Conversion</CardTitle>
            <CardDescription>Breakdown of lead statuses</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingLeads ? (
              <div className="flex justify-center items-center h-[300px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#800000]"></div>
              </div>
            ) : (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={leadStats}
                      innerRadius={60}
                      outerRadius={110}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {leadStats?.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Lead Categories</CardTitle>
            <CardDescription>Distribution by industry type</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingCategories ? (
              <div className="flex justify-center items-center h-[300px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#800000]"></div>
              </div>
            ) : (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={categoryDistribution}
                      innerRadius={0}
                      outerRadius={110}
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {categoryDistribution?.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}