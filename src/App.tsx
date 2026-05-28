import { Box } from "@mui/material";
import { Route, Routes } from "react-router";
// import RiskMatrixSample from "./pages/RiskMatrixSample";
import { useState } from "react";
import Input from "./pages/Input";
import Wbs from "./pages/Wbs";
import RiskMatrix from "./pages/RiskMatrix";
import RiskMatrixInput from "./pages/RiskMatrixInput";

function App() {
  const [projectDescription, setProjectDescription] = useState<string>("");
  const [projectPurpose, setProjectPurpose] = useState<string>("");
  const [projectRequirements, setProjectRequirements] = useState<string>("");
  const [wbs, setWbs] = useState<any>(null);
  const [firstRisk, setFirstRisk] = useState<any>(null);
  const [firstTask, setFirstTask] = useState<any>(null);
  return (
    <Box sx={{
      backgroundColor: "#e5e5e5",
      padding: "16px",
    }}>
      <Routes>
        {/* <Route path="/riskAnalysis" element={
          <RiskMatrixSample
          />
        } /> */}
        <Route path="/input" element={
          <Input
            projectDescription={projectDescription}
            setProjectDescription={setProjectDescription}
            projectPurpose={projectPurpose}
            setProjectPurpose={setProjectPurpose}
            projectRequirements={projectRequirements}
            setRequirements={setProjectRequirements}
            setWbs={setWbs}
          />
        }/>
        <Route path="/wbs" element={
          <Wbs
            projectDescription={projectDescription}
            projectPurpose={projectPurpose}
            projectRequirements={projectRequirements}
            wbs={wbs}
            setFirstRisk={setFirstRisk}
            setFirstTask={setFirstTask}
            firstRisk={firstRisk}
          />
        }/>
        <Route path="/risk" element={
          <RiskMatrix
            projectDescription={projectDescription}
            projectPurpose={projectPurpose}
            projectRequirements={projectRequirements}
            stakeholderRiskMatrixData={firstRisk}
            wbs={wbs}
            firstTask={firstTask}
            setFirstTask={setFirstTask}
          />
        }/>
        <Route path="/riskInput" element={
          <RiskMatrixInput />
        }/>
      </Routes>
    </Box>
  )
}

export default App
