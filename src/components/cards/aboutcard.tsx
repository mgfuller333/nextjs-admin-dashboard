// components/cards/aboutcard.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

export default function AboutCard() {
  return (
    <div className="max-w-xl mx-auto">
      <Card className="bg-white/90 dark:bg-black/80 backdrop-blur-xl border-black/10 dark:border-white/10 shadow-2xl">
       
        <CardContent className="text-sm leading-relaxed py-2 space-y-2">
          <p className="text-black dark:text-white/90">
            Odrade teaches anyone how to respond to environmental and economic impacts of infrastructure—anytime, anywhere.
          </p>

          <ul className="space-y-3 pt-1">
            <li className="flex items-center font-medium text-black dark:text-white">
              <CheckCircleIcon className="mr-3 h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0" />
              Connected Public City Planning Documents
            </li>
            <li className="flex items-center font-medium text-foreground">
              <CheckCircleIcon className="mr-3 h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0" />
              Connected to Live IoT Sensor Database
            </li>
            <li className="flex items-center font-medium text-foreground">
              <CheckCircleIcon className="mr-3 h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0" />
              Connected Live Social Media Updates
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}