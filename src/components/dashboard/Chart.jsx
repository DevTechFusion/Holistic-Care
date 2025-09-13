// src/components/dashboard/Chart.jsx
import React, { useEffect, useState } from "react";

const Chart = ({ options }) => {
  const [CanvasJSChart, setCanvasJSChart] = useState(null);

  useEffect(() => {
    // Dynamically import the module only in the browser
    import("@canvasjs/react-charts").then((CanvasJSReact) => {
      setCanvasJSChart(() => CanvasJSReact.CanvasJSChart);
    });
  }, []);

  if (!CanvasJSChart) {
    return <div>Loading chart...</div>; // You can replace this with a spinner
  }

  return (
    <div style={{ width: "100%", maxWidth: "800px", margin: "0 auto" }}>
      <CanvasJSChart options={options} />
    </div>
  );
};

export default Chart;
