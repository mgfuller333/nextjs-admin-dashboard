import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function TopChannelsSkeleton() {
  return (
    <div className=" bg-white px-7.5 pb-4 pt-1 shadow-1 dark:bg-gray-dark dark:shadow-card">
      <h2 className="mb-1 text-body-2xlg font-bold text-dark dark:text-white">
        ALERTS
      </h2>

      <Table>
        <TableHeader>
          <TableRow className="border-none uppercase [&>th]:text-center">
            <TableHead className="!text-left">SOURCE</TableHead>
            <TableHead>STATUS</TableHead>
            <TableHead className="!text-right">SUMMARY</TableHead>
            <TableHead>LOCATION</TableHead>
            
          </TableRow>
        </TableHeader>

        <TableBody>
          {Array.from({ length: 5 }).map((_, i) => (
            <TableRow key={i}>
              <TableCell colSpan={100}>
                <Skeleton className="h-8" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
