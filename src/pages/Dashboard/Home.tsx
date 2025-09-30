import EcommerceMetrics from "./EcommerceMetrics";
import StatisticsChart from "./StatisticsChart";

export default function Home() {
  return (
    <>
      <div className="space-y-1">
        <EcommerceMetrics />
        <StatisticsChart />
      </div>
    </>
  );
}
