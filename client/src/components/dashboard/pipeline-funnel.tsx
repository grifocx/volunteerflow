import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface PipelineStage {
  stage: string;
  count: number;
  percentage: number;
}

interface PipelineFunnelProps {
  pipelineStages: PipelineStage[];
}

export default function PipelineFunnel({ pipelineStages }: PipelineFunnelProps) {
  const stageColors = [
    "bg-primary",
    "bg-blue-400", 
    "bg-yellow-400",
    "bg-secondary",
    "bg-green-600"
  ];

  const formatStageName = (stage: string) => {
    return stage.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <Card>
      <CardHeader className="border-b border-gray-200 dark:border-gray-700">
        <CardTitle>Recruitment Pipeline</CardTitle>
        <CardDescription>Current volunteer progression through stages</CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          {pipelineStages.map((stage, index) => (
            <div key={stage.stage} className="pipeline-stage">
              <div className="flex items-center">
                <div 
                  className={`w-3 h-3 rounded-full ${stageColors[index % stageColors.length]}`}
                ></div>
                <span className="ml-3 font-medium text-gray-900 dark:text-gray-100" data-testid={`stage-name-${stage.stage}`}>
                  {formatStageName(stage.stage)}
                </span>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-2xl font-semibold text-gray-900 dark:text-gray-100" data-testid={`stage-count-${stage.stage}`}>
                  {stage.count}
                </span>
                <div className="w-32 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${stageColors[index % stageColors.length]}`}
                    style={{ width: `${stage.percentage}%` }}
                    data-testid={`stage-progress-${stage.stage}`}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
