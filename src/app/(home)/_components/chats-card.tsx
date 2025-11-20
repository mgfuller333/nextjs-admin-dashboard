import { DotIcon } from "@/assets/icons";
import { formatMessageTime } from "@/lib/format-message-time";
import { cn } from "@/lib/utils";
import Link from "next/link";

import type { ReactNode } from "react";
import { 
  LocalPolice, 
  LocalFireDepartment, 
  WaterDrop, 
  SupportAgent, 
  School, 
  Park, 
  Home 
} from "@mui/icons-material";
import { generateActionInsight } from "@/app/actions";

interface InsightObj {
  insightName: string;
  insightCategory: string;
  insightSummary: string;
}

interface ChatItem {
  inisghtObj: InsightObj;
}

type KPIProps = {
  weekly: Partial<Record<string, { x: string; y: number }[]>>;
  latest: Partial<Record<string, { x: string; y: number }>>;
};

function getIcon(profileKey: string): ReactNode {
  switch (profileKey) {
    case "police":
      return <LocalPolice sx={{ color: "#1E40AF", fontSize: 28 }} />;
    case "fire":
      return <LocalFireDepartment sx={{ color: "#DC2626", fontSize: 28 }} />;
    case "water":
      return <WaterDrop sx={{ color: "#0EA5E9", fontSize: 28 }} />;
    case "it":
      return <SupportAgent sx={{ color: "#7C3AED", fontSize: 28 }} />;
    case "university":
      return <School sx={{ color: "#F59E0B", fontSize: 28 }} />;
    case "park":
      return <Park sx={{ color: "#10B981", fontSize: 28 }} />;
    case "neighborhood":
      return <Home sx={{ color: "#6366F1", fontSize: 28 }} />;
    default:
      return null; // Or fallback icon
  }
}

export async function ChatsCard({ weekly, latest }: KPIProps) {
  const data: ChatItem[] = await generateActionInsight(weekly, latest);

  return (
    <div className="col-span-12 rounded-[10px] bg-white py-6 shadow-1 dark:bg-gray-dark dark:shadow-card xl:col-span-4">
      <h2 className="mb-5.5 px-7.5 text-body-2xlg font-bold text-dark dark:text-white">
        Action Insight
      </h2>

      <ul className="space-y-1">
        {data.map((chat, index) => {
          const { insightName, insightCategory, insightSummary } = chat.inisghtObj;

          return (
            <li key={index}>
              <Link
                href="/"
                className="flex items-start gap-4.5 px-7.5 py-4 outline-none transition-colors hover:bg-gray-2 focus-visible:bg-gray-2 dark:hover:bg-dark-2 dark:focus-visible:bg-dark-2"
              >
                {/* Optional: Icon or avatar */}
                <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />

                <div className="flex-grow">
                  {/* Title */}
                  <h3 className="font-semibold text-dark dark:text-white line-clamp-1">
                    {insightName}
                  </h3>

                  {/* Category + Summary */}
                  <div className="mt-1.5 space-y-1.5 text-sm">
                    {/* Category badge */}
                    <span className="inline-block rounded-full bg-primary/10 px-2.5 py-0.5 text-primary dark:bg-primary/20">
                      {insightCategory}
                    </span>

                    {/* Summary: 4–5 lines, truncates gracefully */}
                    <p className="line-clamp-4 text-dark-6 dark:text-dark-5 leading-relaxed">
                      {insightSummary}
                    </p>
                  </div>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}