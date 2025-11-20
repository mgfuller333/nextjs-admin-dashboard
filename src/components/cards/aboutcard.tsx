import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

export default function AboutCard() {
  return (
    <div className="max-w-xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Odrade AI</CardTitle>
     
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground/90 leading-normal prose"> 
          <p className="mb-3">Odrade teaches everyday people respond to environmental and economic impacts of city infrastructure—anywhere, anytime.</p>
          <p className="mb-3 font-semibold">
            <CheckCircleIcon className="inline-block mr-2 mb-1 text-green-500" />
            Connected Public City Planning Documents 
            
            </p>
          <p className="mb-3 font-semibold">
              <CheckCircleIcon className="inline-block mr-2 mb-1 text-green-500" />
            Connected to Live iot Sensor Database</p>
          <p className="mb-3 font-semibold">
              <CheckCircleIcon className="inline-block mr-2 mb-1 text-green-500" />
            Connected Live Social Media Updates</p>
  
        </CardContent>
      </Card>
    </div>
  )
}
