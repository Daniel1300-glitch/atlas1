import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Heart, AlertTriangle, CheckCircle, Activity, Brain } from "lucide-react";
import { toast } from "sonner";

interface FormData {
  age: string;
  glucose_level: string;
  bmi: string;
  hypertension: string;
  heart_disease: string;
  gender: string;
  smoking_status: string;
  work_type: string;
  ever_married: string;
  residence_type: string;
}

interface PredictionResponse {
  stroke_prediction: number;
  stroke_risk_score: number;
}

// Try multiple backend URLs including Lovable preview
const BACKEND_URLS = [
  'http://127.0.0.1:8000',
  'http://localhost:8000',
  'http://127.0.0.1:8080',
  'http://localhost:8080'
];

const Assessment = () => {
  const [formData, setFormData] = useState<FormData>({
    age: '',
    glucose_level: '',
    bmi: '',
    hypertension: '',
    heart_disease: '',
    gender: '',
    smoking_status: '',
    work_type: '',
    ever_married: '',
    residence_type: ''
  });

  const [result, setResult] = useState<{ score: number; risk: string; prediction: number } | null>(null);

  // Fetch available features from backend
  const { data: features, isLoading: featuresLoading, error: featuresError } = useQuery<string[]>({
    queryKey: ['features'],
    queryFn: async () => {
      let lastError;
      
      for (const url of BACKEND_URLS) {
        try {
          console.log(`Trying to fetch features from: ${url}/features`);
          const response = await fetch(`${url}/features`, {
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
            },
          });
          if (response.ok) {
            const data = await response.json();
            console.log('Successfully fetched features from:', url, data);
            return data;
          } else {
            console.log(`Response not ok from ${url}:`, response.status, response.statusText);
          }
        } catch (err) {
          console.log(`Failed to connect to ${url}:`, err);
          lastError = err;
        }
      }
      
      throw new Error(`Failed to connect to any backend server. Last error: ${lastError}`);
    },
    retry: 2,
    retryDelay: 1000,
  });

  // Prediction mutation
  const predictionMutation = useMutation<PredictionResponse, Error, any>({
    mutationFn: async (predictionData) => {
      let lastError;
      
      for (const url of BACKEND_URLS) {
        try {
          console.log(`Trying to predict from: ${url}/predict`);
          console.log('Sending prediction data:', JSON.stringify(predictionData, null, 2));
          
          const response = await fetch(`${url}/predict`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
            body: JSON.stringify(predictionData),
          });
          
          if (response.ok) {
            const data = await response.json();
            console.log('Successfully got prediction from:', url, data);
            return data;
          } else {
            const errorText = await response.text();
            console.log(`Prediction failed from ${url}:`, response.status, response.statusText, errorText);
            lastError = new Error(`HTTP ${response.status}: ${errorText}`);
          }
        } catch (err) {
          console.log(`Failed to connect to ${url}:`, err);
          lastError = err;
        }
      }
      
      throw lastError || new Error('Failed to connect to any backend server');
    },
    onSuccess: (data) => {
      const score = data.stroke_risk_score;
      const prediction = data.stroke_prediction;
      let risk = 'Low Risk';
      if (score >= 0.66) risk = 'High Risk';
      else if (score >= 0.33) risk = 'Moderate Risk';
      
      setResult({ score, risk, prediction });
      toast.success('Risk assessment completed successfully!');
    },
    onError: (error) => {
      console.error('Prediction error:', error);
      toast.error(`Failed to calculate stroke risk: ${error.message}`);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    const requiredFields = ['age', 'glucose_level', 'bmi', 'hypertension', 'heart_disease', 'gender', 'smoking_status', 'work_type', 'ever_married', 'residence_type'];
    const missingFields = requiredFields.filter(field => !formData[field as keyof FormData]);
    
    if (missingFields.length > 0) {
      toast.error(`Please fill in all required fields: ${missingFields.join(', ')}`);
      return;
    }

    // Calculate has_medical_risk
    const has_medical_risk = (formData.hypertension === '1' || formData.heart_disease === '1') ? 1 : 0;

    // Create the prediction data with EXACT field names expected by backend
    const predictionData: Record<string, number> = {
      // Numeric fields
      age: parseFloat(formData.age),
      avg_glucose_level: parseFloat(formData.glucose_level),
      bmi: parseFloat(formData.bmi),
      hypertension: parseInt(formData.hypertension),
      heart_disease: parseInt(formData.heart_disease),
      has_medical_risk: has_medical_risk,
      
      // Initialize all categorical fields to 0
      gender_Male: 0,
      gender_Female: 0,
      ever_married_Yes: 0,
      ever_married_No: 0,
      work_type_Self_employed: 0,
      work_type_Private: 0,
      work_type_Govt_job: 0,
      work_type_children: 0,
      Residence_type_Urban: 0,
      Residence_type_Rural: 0,
      smoking_status_formerly_smoked: 0,
      smoking_status_smokes: 0,
      smoking_status_never_smoked: 0,
      smoking_status_Unknown: 0
    };

    // Set the appropriate categorical field to 1 based on form data
    // Gender
    if (formData.gender === 'Male') {
      predictionData['gender_Male'] = 1;
    } else if (formData.gender === 'Female') {
      predictionData['gender_Female'] = 1;
    }

    // Ever married
    if (formData.ever_married === 'Yes') {
      predictionData['ever_married_Yes'] = 1;
    } else if (formData.ever_married === 'No') {
      predictionData['ever_married_No'] = 1;
    }

    // Work type - handle Self-employed with hyphen
    if (formData.work_type === 'Self-employed') {
      predictionData['work_type_Self_employed'] = 1;
    } else if (formData.work_type === 'Private') {
      predictionData['work_type_Private'] = 1;
    } else if (formData.work_type === 'Govt_job') {
      predictionData['work_type_Govt_job'] = 1;
    } else if (formData.work_type === 'children') {
      predictionData['work_type_children'] = 1;
    }

    // Residence type
    if (formData.residence_type === 'Urban') {
      predictionData['Residence_type_Urban'] = 1;
    } else if (formData.residence_type === 'Rural') {
      predictionData['Residence_type_Rural'] = 1;
    }

    // Smoking status - use exact field names with spaces and underscores as expected by backend
    if (formData.smoking_status === 'formerly smoked') {
      predictionData['smoking_status_formerly_smoked'] = 1;
    } else if (formData.smoking_status === 'smokes') {
      predictionData['smoking_status_smokes'] = 1;
    } else if (formData.smoking_status === 'never smoked') {
      predictionData['smoking_status_never_smoked'] = 1;
    } else if (formData.smoking_status === 'Unknown') {
      predictionData['smoking_status_Unknown'] = 1;
    }

    console.log('Form data:', formData);
    console.log('Sending prediction data:', predictionData);
    
    // Create the data with aliases for backend
    const backendData = {
      age: predictionData.age,
      hypertension: predictionData.hypertension,
      heart_disease: predictionData.heart_disease,
      avg_glucose_level: predictionData.avg_glucose_level,
      bmi: predictionData.bmi,
      has_medical_risk: predictionData.has_medical_risk,
      gender_Male: predictionData.gender_Male,
      gender_Female: predictionData.gender_Female,
      ever_married_Yes: predictionData.ever_married_Yes,
      ever_married_No: predictionData.ever_married_No,
      "work_type_Self-employed": predictionData.work_type_Self_employed, // Use hyphen for backend
      work_type_Private: predictionData.work_type_Private,
      work_type_Govt_job: predictionData.work_type_Govt_job,
      work_type_children: predictionData.work_type_children,
      Residence_type_Urban: predictionData.Residence_type_Urban,
      Residence_type_Rural: predictionData.Residence_type_Rural,
      "smoking_status_formerly smoked": predictionData.smoking_status_formerly_smoked, // Use space for backend
      smoking_status_smokes: predictionData.smoking_status_smokes,
      "smoking_status_never smoked": predictionData.smoking_status_never_smoked, // Use space for backend
      smoking_status_Unknown: predictionData.smoking_status_Unknown
    };

    console.log('Final backend data with aliases:', backendData);
    predictionMutation.mutate(backendData);
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Low Risk': return 'text-green-600 dark:text-green-400';
      case 'Moderate Risk': return 'text-yellow-600 dark:text-yellow-400';
      case 'High Risk': return 'text-red-600 dark:text-red-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getRiskIcon = (risk: string) => {
    switch (risk) {
      case 'Low Risk': return CheckCircle;
      case 'Moderate Risk': return AlertTriangle;
      case 'High Risk': return Heart;
      default: return AlertTriangle;
    }
  };

  if (featuresError) {
    console.log('Features fetch error:', featuresError);
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">Stroke Risk Assessment</h1>
        <Alert className="border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800">
          <AlertDescription className="text-red-800 dark:text-red-200">
            <div className="space-y-2">
              <p>Unable to connect to the model server. Please ensure:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>The backend is running: <code>python backend_app.py</code></li>
                <li>Backend is accessible at: <code>http://127.0.0.1:8000</code></li>
                <li>Check the browser console for detailed error messages</li>
              </ul>
              <p className="mt-4"><strong>Error details:</strong> {featuresError.message}</p>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl mb-6 shadow-lg">
            <Brain className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            Stroke Risk Assessment
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
            Complete this comprehensive assessment to evaluate your stroke risk using our advanced AI-powered model
          </p>
        </div>

        {featuresLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full mb-4">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400" />
              </div>
              <p className="text-lg text-gray-600 dark:text-gray-400">Loading assessment form...</p>
            </div>
          </div>
        ) : featuresError ? (
          <Card className="max-w-2xl mx-auto border-red-200 bg-red-50/50 dark:bg-red-900/10 dark:border-red-800">
            <CardContent className="p-8">
              <div className="flex items-center space-x-3 mb-4">
                <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
                <h3 className="text-lg font-semibold text-red-800 dark:text-red-200">Connection Error</h3>
              </div>
              <p className="text-red-700 dark:text-red-300">
                Unable to connect to the model server. Please ensure the backend is running on http://127.0.0.1:8000
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Assessment Form */}
            <div className="xl:col-span-2">
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader className="pb-8">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                      <Activity className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl text-gray-900 dark:text-white">Health Information</CardTitle>
                      <CardDescription className="text-gray-600 dark:text-gray-400">
                        Please provide accurate information for the best assessment
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pb-8">
                  <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Personal Information Section */}
                    <div className="space-y-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
                        Personal Information
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="age" className="text-sm font-medium text-gray-700 dark:text-gray-300">Age</Label>
                          <Input
                            id="age"
                            type="number"
                            value={formData.age}
                            onChange={(e) => handleInputChange('age', e.target.value)}
                            placeholder="Enter your age"
                            min="0"
                            max="120"
                            className="h-12 border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Gender</Label>
                          <Select value={formData.gender} onValueChange={(value) => handleInputChange('gender', value)}>
                            <SelectTrigger className="h-12 border-gray-200 dark:border-gray-600 focus:border-blue-500">
                              <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Male">Male</SelectItem>
                              <SelectItem value="Female">Female</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Marital Status</Label>
                          <Select value={formData.ever_married} onValueChange={(value) => handleInputChange('ever_married', value)}>
                            <SelectTrigger className="h-12 border-gray-200 dark:border-gray-600 focus:border-blue-500">
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Yes">Married</SelectItem>
                              <SelectItem value="No">Never Married</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Residence Type</Label>
                          <Select value={formData.residence_type} onValueChange={(value) => handleInputChange('residence_type', value)}>
                            <SelectTrigger className="h-12 border-gray-200 dark:border-gray-600 focus:border-blue-500">
                              <SelectValue placeholder="Select residence type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Urban">Urban</SelectItem>
                              <SelectItem value="Rural">Rural</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Work Type</Label>
                          <Select value={formData.work_type} onValueChange={(value) => handleInputChange('work_type', value)}>
                            <SelectTrigger className="h-12 border-gray-200 dark:border-gray-600 focus:border-blue-500">
                              <SelectValue placeholder="Select work type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Govt_job">Government job</SelectItem>
                              <SelectItem value="Private">Private</SelectItem>
                              <SelectItem value="Self-employed">Self-employed</SelectItem>
                              <SelectItem value="children">Children/Never worked</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    {/* Health Metrics Section */}
                    <div className="space-y-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
                        Health Metrics
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="glucose" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Average Glucose Level (mg/dL)
                          </Label>
                          <Input
                            id="glucose"
                            type="number"
                            value={formData.glucose_level}
                            onChange={(e) => handleInputChange('glucose_level', e.target.value)}
                            placeholder="Enter glucose level"
                            min="0"
                            step="0.1"
                            className="h-12 border-gray-200 dark:border-gray-600 focus:border-blue-500"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="bmi" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            BMI (Body Mass Index)
                          </Label>
                          <Input
                            id="bmi"
                            type="number"
                            value={formData.bmi}
                            onChange={(e) => handleInputChange('bmi', e.target.value)}
                            placeholder="Enter your BMI"
                            min="0"
                            step="0.1"
                            className="h-12 border-gray-200 dark:border-gray-600 focus:border-blue-500"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    {/* Medical History Section */}
                    <div className="space-y-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
                        Medical History
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                          <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Do you have hypertension (high blood pressure)?
                          </Label>
                          <RadioGroup 
                            value={formData.hypertension} 
                            onValueChange={(value) => handleInputChange('hypertension', value)}
                            className="flex space-x-6"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="1" id="hyp-yes" />
                              <Label htmlFor="hyp-yes" className="text-gray-700 dark:text-gray-300">Yes</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="0" id="hyp-no" />
                              <Label htmlFor="hyp-no" className="text-gray-700 dark:text-gray-300">No</Label>
                            </div>
                          </RadioGroup>
                        </div>

                        <div className="space-y-4">
                          <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Do you have heart disease?
                          </Label>
                          <RadioGroup 
                            value={formData.heart_disease} 
                            onValueChange={(value) => handleInputChange('heart_disease', value)}
                            className="flex space-x-6"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="1" id="heart-yes" />
                              <Label htmlFor="heart-yes" className="text-gray-700 dark:text-gray-300">Yes</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="0" id="heart-no" />
                              <Label htmlFor="heart-no" className="text-gray-700 dark:text-gray-300">No</Label>
                            </div>
                          </RadioGroup>
                        </div>
                      </div>
                    </div>

                    {/* Lifestyle Section */}
                    <div className="space-y-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
                        Lifestyle Information
                      </h3>

                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Smoking History</Label>
                        <Select value={formData.smoking_status} onValueChange={(value) => handleInputChange('smoking_status', value)}>
                          <SelectTrigger className="h-12 border-gray-200 dark:border-gray-600 focus:border-blue-500">
                            <SelectValue placeholder="Select smoking status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="never smoked">Never smoked</SelectItem>
                            <SelectItem value="formerly smoked">Former smoker</SelectItem>
                            <SelectItem value="smokes">Current smoker</SelectItem>
                            <SelectItem value="Unknown">Unknown</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="pt-6">
                      <Button 
                        type="submit" 
                        className="w-full h-14 text-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg"
                        disabled={predictionMutation.isPending}
                      >
                        {predictionMutation.isPending ? (
                          <>
                            <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                            Calculating Risk...
                          </>
                        ) : (
                          'Calculate Stroke Risk'
                        )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {result && (
                <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl">
                  <CardHeader className="pb-6">
                    <CardTitle className="text-xl text-gray-900 dark:text-white flex items-center">
                      <Heart className="mr-2 h-5 w-5 text-red-500" />
                      Assessment Results
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-center space-y-6">
                    <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl">
                      <div className="text-3xl font-bold mb-3 text-gray-900 dark:text-white">
                        {result.score.toFixed(3)}
                      </div>
                      <div className={`text-xl font-semibold flex items-center justify-center ${getRiskColor(result.risk)}`}>
                        {(() => {
                          const Icon = getRiskIcon(result.risk);
                          return <Icon className="mr-2 h-6 w-6" />;
                        })()}
                        {result.risk}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                        Prediction: {result.prediction === 1 ? 'High Risk' : 'Low Risk'}
                      </div>
                    </div>
                    
                    <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                      <p className="font-medium text-gray-800 dark:text-gray-200">Score Interpretation:</p>
                      <div className="space-y-1 text-left">
                        <p>• Score &lt; 0.33 → Low Risk</p>
                        <p>• Score 0.33–0.66 → Moderate Risk</p>
                        <p>• Score &gt; 0.66 → High Risk</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Information Card */}
              <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg text-blue-900 dark:text-blue-100 flex items-center">
                    <Brain className="mr-2 h-5 w-5" />
                    Important Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-4 text-blue-800 dark:text-blue-200">
                  <p>
                    This assessment uses a machine learning model trained on clinical data to estimate stroke risk.
                  </p>
                  <p>
                    <strong>Disclaimer:</strong> This tool is for educational purposes only and should not replace professional medical advice.
                  </p>
                  <p>
                    If you have concerns about your stroke risk, please consult with a healthcare professional.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Assessment;