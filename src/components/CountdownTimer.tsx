import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

interface CountdownTimerProps {
  targetDate: Date;
  label?: string;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const CountdownTimer = ({ targetDate, label = "Próximo partido" }: CountdownTimerProps) => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = targetDate.getTime() - new Date().getTime();

      if (difference > 0) {
        return {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        };
      }

      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    };

    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => setTimeLeft(calculateTimeLeft()), 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  const TimeBlock = ({ value, label }: { value: number; label: string }) => (
    <div className="flex flex-col items-center">
      <div className="bg-primary text-primary-foreground rounded-lg w-14 h-14 flex items-center justify-center shadow-sm">
        <span className="text-xl font-bold">{String(value).padStart(2, "0")}</span>
      </div>
      <span className="text-xs text-muted-foreground mt-1 uppercase tracking-wider">{label}</span>
    </div>
  );

  return (
    <div className="bg-secondary/50 rounded-xl p-4 border border-border">
      <div className="flex items-center gap-2 mb-3 justify-center">
        <Clock className="w-4 h-4 text-primary" />
        <span className="text-sm font-medium text-foreground">{label}</span>
      </div>
      <div className="flex items-center justify-center gap-2">
        <TimeBlock value={timeLeft.days} label="Días" />
        <span className="text-2xl font-bold text-muted-foreground mb-4">:</span>
        <TimeBlock value={timeLeft.hours} label="Hrs" />
        <span className="text-2xl font-bold text-muted-foreground mb-4">:</span>
        <TimeBlock value={timeLeft.minutes} label="Min" />
        <span className="text-2xl font-bold text-muted-foreground mb-4">:</span>
        <TimeBlock value={timeLeft.seconds} label="Seg" />
      </div>
    </div>
  );
};

export default CountdownTimer;
