import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Globe, Heart, ArrowRight } from "lucide-react";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Users className="text-white text-sm" />
              </div>
              <span className="ml-2 text-xl font-semibold text-gray-900 dark:text-white">VolunteerFlow</span>
            </div>
            <Button onClick={handleLogin} data-testid="button-login">
              Sign In
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Talent Acquisition
            <span className="text-primary block">Made Simple</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            Streamline your volunteer recruitment process from initial interest to successful onboarding. 
            Manage the complete 27-month journey across 6 sectors and multiple countries.
          </p>
          <Button size="lg" onClick={handleLogin} className="text-lg px-8 py-3" data-testid="button-get-started">
            Get Started <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>

        {/* Features Grid */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card>
            <CardHeader>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-4">
                <Users className="text-blue-600 dark:text-blue-400 w-6 h-6" />
              </div>
              <CardTitle>Lead Management</CardTitle>
              <CardDescription>
                Track volunteer interest and manage recruitment pipeline efficiently
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
                <li>• Capture and organize leads</li>
                <li>• Track application status</li>
                <li>• Automated workflow management</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mb-4">
                <Globe className="text-green-600 dark:text-green-400 w-6 h-6" />
              </div>
              <CardTitle>Global Positions</CardTitle>
              <CardDescription>
                Manage positions across 6 sectors and multiple countries
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
                <li>• 27-month standard placements</li>
                <li>• Multi-sector coordination</li>
                <li>• Country-specific requirements</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mb-4">
                <Heart className="text-purple-600 dark:text-purple-400 w-6 h-6" />
              </div>
              <CardTitle>Medical Screening</CardTitle>
              <CardDescription>
                Comprehensive health and background verification system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
                <li>• Medical clearance tracking</li>
                <li>• Vaccination management</li>
                <li>• Document verification</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Stats Section */}
        <div className="mt-20 bg-white/60 dark:bg-gray-800/60 rounded-2xl p-8 backdrop-blur-sm">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Streamlined Volunteer Management
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              From interest to deployment - manage the complete volunteer lifecycle
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">6</div>
              <div className="text-gray-600 dark:text-gray-300">Sectors</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">27</div>
              <div className="text-gray-600 dark:text-gray-300">Month Duration</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">100+</div>
              <div className="text-gray-600 dark:text-gray-300">Countries</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">∞</div>
              <div className="text-gray-600 dark:text-gray-300">Impact</div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="w-6 h-6 bg-primary rounded-lg flex items-center justify-center">
              <Users className="text-white text-xs" />
            </div>
            <span className="ml-2 text-lg font-semibold">VolunteerFlow</span>
          </div>
          <p className="text-gray-400">
            Empowering organizations to make a global impact through effective volunteer management.
          </p>
        </div>
      </footer>
    </div>
  );
}
