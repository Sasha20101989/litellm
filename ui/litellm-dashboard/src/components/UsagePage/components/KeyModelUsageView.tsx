import { BarChart } from "@/components/shared/charts";
import { MoneyCell } from "@/components/shared/table_cells";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatNumberWithCommas } from "@/utils/dataUtils";
import { Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { TopModelData } from "../types";

interface KeyModelUsageViewProps {
  topModels: TopModelData[];
}

const VISIBLE_ROWS = 5;
// antd Table with size="small" has a row height of ~39px
const ANTD_SMALL_TABLE_ROW_HEIGHT = 39;

const KeyModelUsageView: React.FC<KeyModelUsageViewProps> = ({ topModels }) => {
  const { t } = useTranslation("usage");
  const [viewMode, setViewMode] = useState<"chart" | "table">("table");
  const columns: ColumnsType<TopModelData> = [
    {
      title: t("common.model"),
      dataIndex: "model",
      key: "model",
      render: (value) => value || "-",
    },
    {
      title: t("common.spendUsd"),
      dataIndex: "spend",
      key: "spend",
      render: (value) => <MoneyCell value={value} decimals={2} />,
    },
    {
      title: t("common.successful"),
      dataIndex: "successful_requests",
      key: "successful_requests",
      render: (value) => <span className="text-green-600">{value?.toLocaleString() || 0}</span>,
    },
    {
      title: t("common.failed"),
      dataIndex: "failed_requests",
      key: "failed_requests",
      render: (value) => <span className="text-red-600">{value?.toLocaleString() || 0}</span>,
    },
    {
      title: t("common.tokens"),
      dataIndex: "tokens",
      key: "tokens",
      render: (value) => value?.toLocaleString() || 0,
    },
  ];

  if (topModels.length === 0) {
    return null;
  }

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="text-base font-semibold">{t("activity.modelUsage")}</CardTitle>
        <CardAction>
          <div className="flex space-x-2">
            <button
              onClick={() => setViewMode("table")}
              className={`px-3 py-1 text-sm rounded-md ${viewMode === "table" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-700"}`}
            >
              {t("common.tableView")}
            </button>
            <button
              onClick={() => setViewMode("chart")}
              className={`px-3 py-1 text-sm rounded-md ${viewMode === "chart" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-700"}`}
            >
              {t("common.chartView")}
            </button>
          </div>
        </CardAction>
      </CardHeader>
      <CardContent>
        {viewMode === "chart" ? (
          <div className="max-h-[234px] overflow-y-auto">
            <BarChart
              style={{ height: topModels.length * 40 }}
              data={topModels.map((m) => ({ key: m.model, spend: m.spend }))}
              index="key"
              categories={["spend"]}
              colors={["cyan"]}
              valueFormatter={(value) => `$${formatNumberWithCommas(value, 2)}`}
              layout="vertical"
              yAxisWidth={180}
              tickGap={5}
              showLegend={false}
            />
          </div>
        ) : (
          <Table
            columns={columns}
            dataSource={topModels}
            rowKey="model"
            size="small"
            pagination={false}
            scroll={topModels.length > VISIBLE_ROWS ? { y: VISIBLE_ROWS * ANTD_SMALL_TABLE_ROW_HEIGHT } : undefined}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default KeyModelUsageView;
