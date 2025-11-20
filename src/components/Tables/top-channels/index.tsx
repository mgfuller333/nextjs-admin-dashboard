

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { compactFormat, standardFormat } from "@/lib/format-number";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { getTopChannels } from "../fetch";
import { DeviceLocationsMap } from "@/components/Maps/deviceLocations";

export async function TopChannels({ className, dailyReadings }: { className?: string, dailyReadings?: any }) {
  
  
  const data = await getTopChannels(dailyReadings);

  type Location = {
  device: string;
  lat: number;
  lng: number;
};

  const testLocations: Location[] = [
  {
    device: "Omnius 1",
    lat: 25.7215,
    lng: -80.2684,
  },
 
];

  return (
    <div
      className={cn(
        "grid rounded-[10px] bg-white px-7.5 pb-4 pt-7.5 shadow-1 dark:bg-gray-dark dark:shadow-card",
        className,
      )}
    >
      <h2 className="mb-4 text-body-2xlg font-bold text-dark dark:text-white">
        Alerts
      </h2>
<DeviceLocationsMap locations={testLocations} />
      <Table>
        <TableHeader>
          <TableRow className="border-none uppercase [&>th]:text-center">
            <TableHead className="min-w-[120px] !text-left">Source</TableHead>
          
            <TableHead className="min-w-[120px] !text-left">Status</TableHead>
            <TableHead className="min-w-[120px] !text-left">Summary</TableHead>
            <TableHead className="min-w-[120px] !text-left">Location</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {data.map((channel, i) => (
            <TableRow
              className="text-left text-base font-medium text-dark dark:text-white"
              key={channel.name + i}
            >
              <TableCell className="flex min-w-fit items-center gap-3">
                
                <div className="">{channel.name}</div>
              </TableCell>
  <TableCell>{channel.status}</TableCell>
              <TableCell>{channel.summary}</TableCell>

              <TableCell className="!text-left">
                {(channel.location)}
              </TableCell>

        
         
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
