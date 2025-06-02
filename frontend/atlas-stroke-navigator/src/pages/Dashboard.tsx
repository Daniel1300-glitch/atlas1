import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, TrendingUp, Target, BarChart3 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Metrics {
  accuracy: number;
  precision: number;
  recall: number;
  roc_auc: number;
}

// Try multiple backend URLs
const BACKEND_URLS = [
  'http://127.0.0.1:8000',
  'http://localhost:8000',
  'http://127.0.0.1:8080',
  'http://localhost:8080'
];

const Dashboard = () => {
  const { data: metrics, isLoading, error } = useQuery<Metrics>({
    queryKey: ['metrics'],
    queryFn: async () => {
      let lastError;
      
      for (const url of BACKEND_URLS) {
        try {
          console.log(`Trying to fetch metrics from: ${url}/metrics`);
          const response = await fetch(`${url}/metrics`);
          if (response.ok) {
            const data = await response.json();
            console.log('Successfully fetched metrics from:', url);
            return data;
          }
        } catch (err) {
          console.log(`Failed to connect to ${url}:`, err);
          lastError = err;
        }
      }
      
      throw new Error(`Failed to connect to any backend server. Last error: ${lastError}`);
    },
    retry: 1,
    retryDelay: 1000,
  });

  if (error) {
    console.log('Dashboard metrics fetch error:', error);
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">Model Performance Dashboard</h1>
        <Alert className="border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800">
          <AlertDescription className="text-red-800 dark:text-red-200">
            <div className="space-y-2">
              <p>Unable to connect to the model server. Please ensure:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>The backend is running: <code>python backend_app.py</code></li>
                <li>Backend is accessible at: <code>http://127.0.0.1:8000</code></li>
                <li>Check the browser console for detailed error messages</li>
              </ul>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // ... keep existing code (formatPercentage, metricCards, and rest of component)
  const formatPercentage = (value: number) => `${(value * 100).toFixed(1)}%`;

  const metricCards = [
    {
      title: "Accuracy",
      value: metrics?.accuracy,
      description: "Overall model accuracy",
      icon: Target,
      color: "from-green-500 to-emerald-500"
    },
    {
      title: "Precision",
      value: metrics?.precision,
      description: "Positive prediction accuracy",
      icon: TrendingUp,
      color: "from-blue-500 to-cyan-500"
    },
    {
      title: "Recall",
      value: metrics?.recall,
      description: "True positive detection rate",
      icon: Activity,
      color: "from-purple-500 to-violet-500"
    },
    {
      title: "ROC-AUC",
      value: metrics?.roc_auc,
      description: "Area under the ROC curve",
      icon: BarChart3,
      color: "from-orange-500 to-red-500"
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          Model Performance Dashboard
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Real-time metrics and performance indicators for the stroke prediction model
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
              <CardHeader>
                <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {metricCards.map((metric, index) => (
              <Card key={index} className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-purple-200 dark:border-purple-800 hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {metric.title}
                  </CardTitle>
                  <div className={`w-8 h-8 bg-gradient-to-r ${metric.color} rounded-lg flex items-center justify-center`}>
                    <metric.icon className="h-4 w-4 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {metric.value ? formatPercentage(metric.value) : 'N/A'}
                  </div>
                  <CardDescription className="text-xs">
                    {metric.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-purple-200 dark:border-purple-800">
            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Model Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">Performance Metrics</h3>
                <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                  <li><strong>Accuracy:</strong> Percentage of correct predictions</li>
                  <li><strong>Precision:</strong> Accuracy of positive predictions</li>
                  <li><strong>Recall:</strong> Ability to find all positive cases</li>
                  <li><strong>ROC-AUC:</strong> Overall discriminative ability</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">Model Features</h3>
                <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                  <li>• Machine Learning based prediction</li>
                  <li>• 20 one-hot encoded features</li>
                  <li>• Real-time risk assessment</li>
                  <li>• Validated on clinical data</li>
                </ul>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;