// components/cards/aboutcard.tsx
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

export default function AboutCard() {
  return (
    <div className="max-w-xl mx-auto backdrop-blur-2xl">
      <Card className="border-border/50 bg-background/70 backdrop-blur-md shadow-xl">
        <CardHeader>
          <CardTitle className="text-black dark:text-white">Odrade AI</CardTitle>
        </CardHeader>
        <CardContent className="text-sm leading-normal prose prose-sm max-w-none">
          <p className="mb-4 text-black/90 dark:text-white/90">
            Odrade teaches anyone how to respond to environmental and economic impacts of infrastructure—anytime, anywhere.
          </p>
          <ul className="space-y-2.5">
            <li className="flex items-center font-medium text-black dark:text-white">
              <CheckCircleIcon className="mr-2.5 h-5 w-5 text-green-500 flex-shrink-0" />
              Connected Public City Planning Documents
            </li>
            <li className="flex items-center font-medium text-black dark:text-white">
              <CheckCircleIcon className="mr-2.5 h-5 w-5 text-green-500 flex-shrink-0" />
              Connected to Live IoT Sensor Database
            </li>
            <li className="flex items-center font-medium text-black dark:text-white">
              <CheckCircleIcon className="mr-2.5 h-5 w-5 text-green-500 flex-shrink-0" />
              Connected Live Social Media Updates
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}