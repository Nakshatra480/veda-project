"use client";

import { BarChart3 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function AnalyticsPage() {
  return (
    <div className="max-w-3xl mx-auto py-12">
      <Card className="border border-gray-100 shadow-md rounded-2xl overflow-hidden bg-white">
        <CardContent className="p-8 md:p-12 flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-orange-50 flex items-center justify-center mb-6">
            <BarChart3 className="w-8 h-8 text-[#F97316]" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Analytics</h1>
          <p className="text-gray-500 max-w-md mb-8">
            Advanced analytics, reports, and insights on your generated question papers are currently under development.
          </p>
          <div className="w-full max-w-sm h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full w-2/3 bg-gradient-to-r from-orange-400 to-[#F97316] rounded-full" />
          </div>
          <span className="text-xs text-gray-400 mt-2 font-medium">Progress: 65%</span>
        </CardContent>
      </Card>
    </div>
  );
}
