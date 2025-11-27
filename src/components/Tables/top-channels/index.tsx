import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { getTopChannels } from "../fetch";
import { DeviceLocationsMap } from "@/components/Maps/deviceLocations";

export async function TopChannels({ 
  className, 
  dailyReadings 
}: { 
  className?: string; 
  dailyReadings?: any;
}) {
  const data = await getTopChannels(dailyReadings);

  console.log("dailyReadings",dailyReadings)

  type Location = {
    device: string;
    lat: number;
    lng: number;
  };

  const testLocations: Location[] = [
    {
      device: "Omnius 1",
      lat: 25.7493,
      lng: -80.3316,
    },
  ];

  return (
    <div
      className={cn(
        "grid rounded-[10px] bg-white px-7.5 pb-4 pt-7.5 shadow-1 dark:bg-gray-dark dark:shadow-card",
        className
      )}
    >
      <h2 className="mb-4 text-body-2xlg font-bold text-dark dark:text-white">
        Alerts
      </h2>

      <DeviceLocationsMap locations={testLocations} />

    <Table>
  <TableHeader>
    <TableRow className="border-none uppercase">
      {/* Source — wider, no wrap */}
      <TableHead className="w-[100px] min-w-[100px] text-left">
        Source
      </TableHead>
      <TableHead className="text-left">Status</TableHead>
      <TableHead className="text-left">Summary</TableHead>
      <TableHead className="text-left">Location</TableHead>
    </TableRow>
  </TableHeader>

  <TableBody>
    {data.map((channel, i) => (
      <TableRow
        key={channel.name + i}
        className="border-t border-border/50 hover:bg-muted/30 transition-colors"
      >
        {/* Source — prevent wrapping */}
        <TableCell className="py-4 align-middle">
          <div className="flex items-center gap-3">
            <div className="font-medium text-foreground whitespace-nowrap">
              {channel.name}
            </div>
          </div>
        </TableCell>

        {/* Status */}
        <TableCell className="py-4 align-middle">
          <span
            className={cn(
              "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium",
              channel.status === "ONLINE"
                ? "bg-green-500/15 text-green-600 dark:bg-green-500/20"
                : channel.status === "other"
                ? "bg-yellow-500/15 text-red-600 dark:bg-red-500/20"
                : "bg-red-500/15 text-red-600 dark:bg-red-500/20"
            )}
          >
            {channel.status}
          </span>
        </TableCell>

        {/* Summary */}
        <TableCell className="py-4 align-middle text-muted-foreground">
          {channel.summary}
        </TableCell>

        {/* Location */}
        <TableCell className="py-4 align-middle text-muted-foreground">
          {channel.location}
        </TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
    </div>
  );
}