"use client";

import { ColumnDef } from "@tanstack/react-table";
import { useTranslations } from "next-intl";

const useOilSpillsTableColumns = () => {
  const t = useTranslations("globe.table.header");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const oilSpillsColumns: ColumnDef<any>[] = [
    {
      accessorKey: "_id",
      header: t("id"),
      cell: ({ row }) => (
        <div className="uppercase">
          O{row.getValue("_id")?.toString().slice(-6).padStart(6, "0")}
        </div>
      ),
    },
    {
      accessorKey: "latitude",
      header: t("latitude"),
      cell: ({ row }) => {
        return (
          <div>
            {row.original.coordinates[1].toFixed(5) || "-"}
          </div>
        );
      },
    },
    {
      accessorKey: "longitude",
      header: t("longitude"),
      cell: ({ row }) => {
        return (
          <div>
            {row.original.coordinates[0].toFixed(5) || "-"}
          </div>
        );
      },
    },
    {
      accessorKey: "area",
      header: t("area"),
      cell: ({ row }) => {
        return (
          <div>
            {row.original.area.toFixed(2) || "-"} km<sup>2</sup>
          </div>
        );
      },
    }
  ];
  return { oilSpillsColumns };
};

export default useOilSpillsTableColumns;
