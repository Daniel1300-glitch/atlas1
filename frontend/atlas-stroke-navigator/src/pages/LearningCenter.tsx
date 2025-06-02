
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, Heart, Brain, AlertTriangle, Shield, Book, Users, Clock, Phone, Activity, Stethoscope, Target, TrendingUp } from "lucide-react";

const LearningCenter = () => {
  const resources = [
    {
      title: "CDC Stroke Information",
      description: "Comprehensive stroke information from the Centers for Disease Control and Prevention",
      url: "https://www.cdc.gov/stroke/index.htm",
      icon: Shield,
      color: "from-blue-500 to-cyan-500"
    },
    {
      title: "WHO Stroke Fact Sheet",
      description: "World Health Organization fact sheet on stroke statistics and prevention",
      url: "https://www.who.int/news-room/fact-sheets/detail/stroke",
      icon: Book,
      color: "from-green-500 to-emerald-500"
    },
    {
      title: "American Stroke Association",
      description: "Leading organization dedicated to stroke prevention and recovery",
      url: "https://www.stroke.org/",
      icon: Heart,
      color: "from-red-500 to-pink-500"
    },
    {
      title: "National Institute of Health - NINDS",
      description: "National Institute of Neurological Disorders and Stroke resources",
      url: "https://www.ninds.nih.gov/health-information/disorders/stroke",
      icon: Brain,
      color: "from-purple-500 to-violet-500"
    },
    {
      title: "Stroke Recovery Network",
      description: "Support and resources for stroke survivors and caregivers",
      url: "https://strokerecoverynetwork.org/",
      icon: Users,
      color: "from-orange-500 to-amber-500"
    },
    {
      title: "Be-FAST Stroke Assessment",
      description: "Learn the Be-FAST method for recognizing stroke symptoms",
      url: "https://www.heart.org/en/health-topics/stroke/recognizing-stroke/be-fast-stroke-recognition",
      icon: Clock,
      color: "from-indigo-500 to-blue-500"
    }
  ];

  const topics = [
    {
      title: "What is a Stroke?",
      content: "A stroke occurs when blood flow to a part of your brain is interrupted or reduced, preventing brain tissue from getting oxygen and nutrients. Brain cells begin to die in minutes. There are two main types: ischemic (blocked artery) and hemorrhagic (bleeding in the brain).",
      icon: Brain,
      color: "from-purple-500 to-violet-500"
    },
    {
      title: "Types of Stroke",
      content: "Ischemic strokes (87% of cases) occur when blood clots block arteries. Hemorrhagic strokes happen when blood vessels burst. Transient Ischemic Attacks (TIAs) are 'mini-strokes' that serve as warning signs.",
      icon: Activity,
      color: "from-blue-500 to-cyan-500"
    },
    {
      title: "Risk Factors",
      content: "Controllable factors include high blood pressure, diabetes, heart disease, smoking, obesity, and high cholesterol. Non-controllable factors include age (over 55), gender, race, and family history. Managing controllable factors significantly reduces risk.",
      icon: AlertTriangle,
      color: "from-orange-500 to-red-500"
    },
    {
      title: "Be-FAST Warning Signs",
      content: "B - Balance loss, E - Eye vision changes, F - Face drooping, A - Arm weakness, S - Speech difficulty, T - Time to call 911. Additional signs include sudden severe headache, confusion, or trouble walking.",
      icon: Clock,
      color: "from-red-500 to-pink-500"
    },
    {
      title: "Prevention Strategies",
      content: "Maintain healthy blood pressure, exercise regularly, eat a balanced diet, avoid smoking, limit alcohol, manage diabetes, maintain healthy weight, and take prescribed medications as directed by your doctor.",
      icon: Heart,
      color: "from-pink-500 to-rose-500"
    },
    {
      title: "Emergency Response",
      content: "Call 911 immediately if stroke is suspected. Note the time symptoms started. Don't drive yourself or wait. Time is critical - treatments are most effective within the first few hours of symptom onset.",
      icon: Phone,
      color: "from-red-600 to-orange-500"
    },
    {
      title: "Treatment Options",
      content: "Ischemic strokes may be treated with clot-busting drugs (tPA) or mechanical clot removal. Hemorrhagic strokes focus on controlling bleeding and reducing pressure. Rehabilitation helps recovery of lost functions.",
      icon: Stethoscope,
      color: "from-green-500 to-teal-500"
    },
    {
      title: "Recovery & Rehabilitation",
      content: "Recovery varies by individual and stroke severity. Physical, occupational, and speech therapy help regain abilities. Support groups, family involvement, and lifestyle changes are crucial for successful recovery.",
      icon: Target,
      color: "from-indigo-500 to-purple-500"
    },
    {
      title: "Statistics & Impact",
      content: "Stroke is the 5th leading cause of death and leading cause of disability in the US. Someone has a stroke every 40 seconds. With proper treatment and prevention, up to 80% of strokes can be prevented.",
      icon: TrendingUp,
      color: "from-amber-500 to-orange-500"
    }
  ];

  const emergencyInfo = {
    title: "Emergency Information",
    content: [
      "Call 911 immediately if you suspect a stroke",
      "Note the exact time symptoms began",
      "Don't give food, water, or medications",
      "Keep the person calm and lying down",
      "Be prepared to perform CPR if needed"
    ]
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-gray-950 dark:via-gray-900 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl mb-6 shadow-lg">
            <Brain className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            Learning Center
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
            Comprehensive resources to help you understand stroke prevention, recognition, treatment, and recovery
          </p>
        </div>

        {/* Emergency Information */}
        <div className="mb-12">
          <Card className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/30 dark:to-orange-950/30 border-red-200 dark:border-red-800/50 shadow-lg">
            <CardHeader>
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-red-600 to-orange-600 rounded-xl flex items-center justify-center mr-4">
                  <Phone className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-2xl text-red-700 dark:text-red-300">{emergencyInfo.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {emergencyInfo.content.map((item, index) => (
                  <li key={index} className="flex items-center text-red-700 dark:text-red-300">
                    <div className="w-2 h-2 bg-red-500 rounded-full mr-3 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* External Resources */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">Trusted Resources</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resources.map((resource, index) => (
              <Card key={index} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <CardHeader className="flex flex-row items-center space-y-0 pb-4">
                  <div className={`w-12 h-12 bg-gradient-to-r ${resource.color} rounded-xl flex items-center justify-center mr-4 shadow-lg`}>
                    <resource.icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg">{resource.title}</CardTitle>
                    <CardDescription className="mt-1 text-sm">{resource.description}</CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button 
                    asChild 
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                    onClick={() => window.open(resource.url, '_blank')}
                  >
                    <a href={resource.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center">
                      Visit Resource
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Educational Topics */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">Essential Knowledge</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topics.map((topic, index) => (
              <Card key={index} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center mb-4">
                    <div className={`w-12 h-12 bg-gradient-to-r ${topic.color} rounded-xl flex items-center justify-center mr-4 shadow-lg`}>
                      <topic.icon className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-xl">{topic.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    {topic.content}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Additional Information */}
        <div className="bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-950/50 dark:to-indigo-950/50 rounded-3xl p-8 border border-blue-200 dark:border-blue-800/50 shadow-lg">
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Important Disclaimer</h2>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            This educational content is provided for informational purposes only and should not replace professional medical advice, 
            diagnosis, or treatment. Always consult with qualified healthcare providers for medical concerns and before making 
            any healthcare decisions. In case of emergency, call 911 immediately.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LearningCenter;
