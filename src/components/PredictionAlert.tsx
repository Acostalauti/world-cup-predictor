import { AlertCircle, Eye, EyeOff } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface PredictionAlertProps {
  type: "hidden" | "closed" | "info";
  message?: string;
}

const PredictionAlert = ({ type, message }: PredictionAlertProps) => {
  const configs = {
    hidden: {
      icon: EyeOff,
      defaultMessage: "Las predicciones de otros jugadores se revelarán cuando termine la jornada.",
      className: "border-info/30 bg-info/5 text-info",
    },
    closed: {
      icon: AlertCircle,
      defaultMessage: "Las predicciones están cerradas para este partido.",
      className: "border-warning/30 bg-warning/5 text-warning",
    },
    info: {
      icon: Eye,
      defaultMessage: message || "",
      className: "border-primary/30 bg-primary/5 text-primary",
    },
  };

  const config = configs[type];
  const Icon = config.icon;

  return (
    <Alert className={config.className}>
      <Icon className="h-4 w-4" />
      <AlertDescription className="text-sm">
        {message || config.defaultMessage}
      </AlertDescription>
    </Alert>
  );
};

export default PredictionAlert;
