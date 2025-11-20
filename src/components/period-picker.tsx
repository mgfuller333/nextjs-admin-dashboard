"use client";

import { ChevronUpIcon } from "@/assets/icons";
import { cn } from "@/lib/utils";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Dropdown, DropdownContent, DropdownTrigger } from "./ui/dropdown";
import { useTransition } from "react"; // ← ADD THIS LINE

type PropsType<TItem> = {
  defaultValue?: TItem;
  items?: TItem[];
  sectionKey: string;
  minimal?: boolean;
};

const PARAM_KEY = "selected_time_frame";
const ALLOWED_KEYS = [
  // === BME688 Sensors 0–7 (8 total) ===
  // Sensor 0
  'iaq_0', 'iaqAcc_0', 'co2_0', 'bvoc_0', 'pres_0', 'gasR_0', 'temp_0', 'hum_0', 'com_gas0',
  // Sensor 1
  'iaq_1', 'iaqAcc_1', 'co2_1', 'bvoc_1', 'pres_1', 'gasR_1', 'temp_1', 'hum_1', 'com_gas1',
  // Sensor 2
  'iaq_2', 'iaqAcc_2', 'co2_2', 'bvoc_2', 'pres_2', 'gasR_2', 'temp_2', 'hum_2', 'com_gas2',
  // Sensor 3
  'iaq_3', 'iaqAcc_3', 'co2_3', 'bvoc_3', 'pres_3', 'gasR_3', 'temp_3', 'hum_3', 'com_gas3',
  // Sensor 4
  'iaq_4', 'iaqAcc_4', 'co2_4', 'bvoc_4', 'pres_4', 'gasR_4', 'temp_4', 'hum_4', 'com_gas4',
  // Sensor 5
  'iaq_5', 'iaqAcc_5', 'co2_5', 'bvoc_5', 'pres_5', 'gasR_5', 'temp_5', 'hum_5', 'com_gas5',
  // Sensor 6
  'iaq_6', 'iaqAcc_6', 'co2_6', 'bvoc_6', 'pres_6', 'gasR_6', 'temp_6', 'hum_6', 'com_gas6',
  // Sensor 7
  'iaq_7', 'iaqAcc_7', 'co2_7', 'bvoc_7', 'pres_7', 'gasR_7', 'temp_7', 'hum_7', 'com_gas7',

  // === Power & Battery ===
  'batV', 'batSV', 'batC', 'batP',
  'solV', 'solSV', 'solC', 'solP',

  // === Device Metadata ===
  'device', 'ts', 'bID', 'loc', 'alt', 'satCnt',

  // === Particulate Matter (PM) ===
  'pm10', 'pm2_5', 'pm1',
] as const;

type SensorKey = typeof ALLOWED_KEYS[number];

interface SensorPickerProps {
  defaultValue?: SensorKey[];
  sectionKey: string;
  className?: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ;


export function PeriodPicker<TItem extends string>({
  defaultValue,
  sectionKey,
  items,
  minimal,
}: PropsType<TItem>) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dropdown isOpen={isOpen} setIsOpen={setIsOpen}>
      <DropdownTrigger
        className={cn(
          "flex h-8 w-full items-center justify-between gap-x-1 rounded-md border border-[#E8E8E8] bg-white px-3 py-2 text-sm font-medium text-dark-5 outline-none ring-offset-white disabled:cursor-not-allowed disabled:opacity-50 data-[placeholder]:text-neutral-500 dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:ring-offset-neutral-950 dark:focus:ring-neutral-300 dark:data-[placeholder]:text-neutral-400 [&>span]:line-clamp-1 [&[data-state='open']>svg]:rotate-0",
          minimal &&
            "border-none bg-transparent p-0 text-dark dark:bg-transparent dark:text-white",
        )}
      >
        <span className="capitalize">{defaultValue || "Time Period"}</span>

        <ChevronUpIcon className="size-4 rotate-180 transition-transform" />
      </DropdownTrigger>

      <DropdownContent
        align="end"
        className="min-w-[7rem] overflow-hidden rounded-lg border border-[#E8E8E8] bg-white p-1 font-medium text-dark-5 shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 dark:border-dark-3 dark:bg-dark-2 dark:text-current"
      >
        <ul>
          {(items || ["monthly", "yearly"]).map((item) => (
            <li key={crypto.randomUUID()}>
              <button
                className="flex w-full select-none items-center truncate rounded-md px-3 py-2 text-sm capitalize outline-none hover:bg-[#F9FAFB] hover:text-dark-3 dark:hover:bg-[#FFFFFF1A] dark:hover:text-white"
                onClick={() => {
                  const queryString = createQueryString({
                    sectionKey,
                    value: item,
                    selectedTimeFrame: searchParams.get(PARAM_KEY),
                  });

                  router.push(pathname + queryString, {
                    scroll: false,
                  });

                  setIsOpen(false);
                }}
              >
                {item}
              </button>
            </li>
          ))}
        </ul>
      </DropdownContent>
    </Dropdown>
  );
}

export function SensorPicker({ sectionKey, defaultValue = ['solV', 'batV'], className }: SensorPickerProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Current URL state
  const urlSensors = searchParams.getAll(sectionKey) as SensorKey[];
  const currentSensors = urlSensors.length > 0 ? urlSensors : defaultValue;

  // Local draft state
  const [draft, setDraft] = useState<SensorKey[]>(currentSensors);
  const [isOpen, setIsOpen] = useState(false);
const [isPending, startTransition] = useTransition(); // ← NOW WORKS

 const apply = () => {
  const params = new URLSearchParams(searchParams);
  params.delete(sectionKey);
  draft.forEach(key => params.append(sectionKey, key));

  startTransition(() => {
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  });
  setIsOpen(false);
};

  const clear = () => {
    setDraft([]);
  };

  const toggle = (key: SensorKey) => {
    setDraft(prev => 
      prev.includes(key) 
        ? prev.filter(k => k !== key)
        : [...prev, key]
    );
  };

  const display = draft.length === 0 
    ? "Select sensors" 
    : draft.length === 1 
      ? draft[0] 
      : `${draft.length} selected`;

  return (
    <div className={cn("relative", className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex h-9 w-full items-center justify-between rounded-md border border-[#E8E8E8] bg-white px-3 py-2 text-sm font-medium text-dark-5 outline-none transition-colors hover:bg-gray-50 dark:border-dark-3 dark:bg-dark-2 dark:text-white"
        )}
      >
        <span className="truncate">{display}</span>
        <ChevronUpIcon className={cn("size-4 transition-transform", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <div className="absolute right-0 z-50 mt-1 w-64 rounded-lg border border-[#E8E8E8] bg-white shadow-lg dark:border-dark-3 dark:bg-dark-2">
          <div className="max-h-64 overflow-y-auto p-2">
            {ALLOWED_KEYS.map(key => (
              <button
                key={key}
                onClick={() => toggle(key)}
                className={cn(
                  "flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
                  draft.includes(key)
                    ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200"
                    : "hover:bg-gray-100 dark:hover:bg-[#FFFFFF1A]"
                )}
              >
                <div className={cn(
                  "size-4 rounded border",
                  draft.includes(key)
                    ? "border-blue-500 bg-blue-500"
                    : "border-gray-300 dark:border-gray-600"
                )}>
                  {draft.includes(key) && <span className="block h-full w-full text-white text-xs">✓</span>}
                </div>
                <span>{key}</span>
              </button>
            ))}
          </div>

          <div className="flex gap-2 border-t border-gray-200 p-3 dark:border-dark-3">
            <button
              onClick={clear}
              className="flex-1 rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-dark-3 dark:text-gray-300 dark:hover:bg-[#FFFFFF1A]"
            >
              Clear
            </button>
            <button
              onClick={apply}
              disabled={draft.length === 0}
              className={cn(
                "flex-1 rounded-md px-3 py-1.5 text-sm font-medium text-white transition-colors",
                draft.length === 0
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              )}
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
const createQueryString = (props: {
  sectionKey: string;
  value: string;
  selectedTimeFrame: string | null;
}) => {
  const paramsValue = `${props.sectionKey}:${props.value}`;

  if (!props.selectedTimeFrame) {
    return `?${PARAM_KEY}=${paramsValue}`;
  }

  const newSearchParams = props.selectedTimeFrame
    .split(",")
    .filter((value) => !value.includes(props.sectionKey))
    .join(",");

  if (!newSearchParams) {
    return `?${PARAM_KEY}=${paramsValue}`;
  }

  return `?${PARAM_KEY}=${newSearchParams},${paramsValue}`;
};