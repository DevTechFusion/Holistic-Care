// src/components/dashboard/Chart.jsx
import CanvasJSReact from "@canvasjs/react-charts";

const CanvasJSChart = CanvasJSReact.CanvasJSChart;

const Chart = ({ options }) => {

  return (
    <div>
      <CanvasJSChart options={options} />
    </div>
  );
};

export default Chart;