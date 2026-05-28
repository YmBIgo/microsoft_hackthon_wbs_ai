import { Box, Button, Snackbar } from "@mui/material"
import { generateUUID } from "../const/uuid";
import { Gantt, Willow } from "@svar-ui/react-gantt";
import "@svar-ui/react-gantt/all.css"; //import styles
import { Link, useNavigate } from "react-router";
import { AZURE_FUNCTION_URL } from "../const/url";
import { useState, type Dispatch, type SetStateAction } from "react";

import TaskIcon from '@mui/icons-material/Task';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import FlagIcon from '@mui/icons-material/Flag';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';

type Props = {
  projectDescription: string;
  projectPurpose: string;
  projectRequirements: string;
  wbs: any;
  setFirstRisk: Dispatch<SetStateAction<any>>;
  firstRisk: any;
  setFirstTask: Dispatch<SetStateAction<any>>;
}

const Wbs: React.FC<Props> = ({
  projectDescription,
  projectPurpose,
  projectRequirements,
  wbs,
  setFirstRisk,
  firstRisk,
  setFirstTask
}) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [snackbarContent, setSnackbarContent] = useState<string>("");
  const timeStep = wbs?.timeStep === "日" ? 1 : wbs?.timeStep === "週" ? 7 : wbs?.timeStep === "月" ? 30 : 1;
  const svarWbs = wbs?.tasks.map((item: any) => {
    const currentTime = new Date().getTime();
    const startDate = currentTime + item.startTime * timeStep * 24 * 60 * 60 * 1000;
    const endDate = currentTime + item.endTime * timeStep * 24 * 60 * 60 * 1000;
    return {
      id: generateUUID(),
      text: item.task,
      start: startDate,
      end: endDate,
      duration: (endDate - startDate) / (1000 * 60 * 60 * 24),  
      type: "task",
    }
  }) ?? [];
  const scales = timeStep !== 1 ? (
  wbs?.tasks.slice(-1)?.[0].endTime > 100 ?
    [
      { unit: "year", step: 1, format: "%Y" },
      { unit: "month", step: 3, format: "%M %Y" },
    ]
  :
    [
      { unit: "month", step: 1, format: "%M %Y" },
      { unit: "week", step: 1, format: "%w" },
    ]
  )
  : [
      { unit: "week", step: 1, format: "%w" },
      { unit: "day", step: 1, format: "%j" },
    ];
  const submit = async(task: any, index: number) => {
    const infoAddedWbs = {
      ...task,
      timeStep: wbs.timeStep,
      project: wbs.project,
      stepIndex: index,
    };
    setIsLoading(true);
    setSnackbarContent("ステークホルダーとリスク分析を取得します...通常5分ほど時間がかかります...");
    try {
      console.log("Getting stakeholders ...")
      const response = await fetch(`https://${AZURE_FUNCTION_URL}/wbs-openai`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          projectDescription: `プロジェクトの概要:${projectDescription}\nプロジェクトの目的:${projectPurpose}\nプロジェクトの要件:${projectRequirements}`,
          step: infoAddedWbs,
          path: "/chatStakeholders"
        })
      });
      const stakeholders = await response.json();
      console.log("Stakeholders:", stakeholders);
      console.log("Getting risk analysis ...")
      const response2 = await fetch(`https://${AZURE_FUNCTION_URL}/wbs-openai`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          projectDescription: `プロジェクトの概要:${projectDescription}\nプロジェクトの目的:${projectPurpose}\nプロジェクトの要件:${projectRequirements}`,
          step: infoAddedWbs,
          stakeholders,
          path: "/estimateStakeholdersRisks"
        })
      });
      const stakeholderRiskMatrix = await response2.json();
      setFirstRisk(stakeholderRiskMatrix);
      setFirstTask(task);
      navigate("/risk")
    } catch (error) {
      console.error(error);
      alert("リスク分析の取得に失敗しました。時間をおいて再度お試しください。");
    } finally {
      setIsLoading(false);
      setSnackbarContent("");
    }
  }
  if (!wbs) {
    return (
      <Box sx={{
        padding: "16px",
        textAlign: "left",
        backgroundColor: "white",
        borderRadius: "8px",
      }}>
        <h3>要件を入力してください</h3>
        <Link to="/input" style={{
          textDecoration: "none",
        }}>
          <Button variant="contained">要件入力画面へ</Button>
        </Link>
      </Box>
    )
  }
  return (
    <Box sx={{
      padding: "16px",
      textAlign: "left",
      backgroundColor: "white",
      borderRadius: "8px",
    }}>
      <p><Link to="/input" style={{
          textDecoration: "none",
          color: "black"
      }}>
        <ArrowBackIosIcon sx={{ verticalAlign: "middle", marginRight: "5px" }} />
        要件入力に戻る
      </Link></p>
      { firstRisk &&
        <p><Link to="/risk" style={{
          textDecoration: "none",
          color: "black"
        }}>
          <ArrowBackIosIcon sx={{ verticalAlign: "middle", marginRight: "5px" }} />
          直近のリスク分析結果へ
        </Link></p>
      }
      <p><Link to="/riskInput" style={{
        textDecoration: "none",
        color: "black"
      }}>
        <ArrowBackIosIcon sx={{ verticalAlign: "middle", marginRight: "5px" }} />
        ダウンロードしたJSONを可視化する
      </Link></p>
      <h3>STEP2：{projectDescription.slice(0, 50)}...</h3>
      <Box sx={{
        backgroundColor: "#666666",
        color: "white",
        padding: "16px",
        borderRadius: "8px",
        marginBottom: "16px",
      }}>
        <p>目的：{projectPurpose.slice(0, 50)}...</p>
        <p>要件：{projectRequirements.slice(0, 50)}...</p>
      </Box>
      <Box>
        <Box sx={{
          border: "1px solid #33333380",
        }}>
          <Willow>
            <Gantt
              tasks={svarWbs}
              scales={scales}
            />
          </Willow>
        </Box>
        <br/>
        <Box>
          <h3>タスク一覧</h3>
          <Box sx={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "16px",
          }}>
          { wbs.tasks.map((t: any, index: number) => {
            return (
              <Box key={t.task}
                sx={{
                  textAlign: "left",
                  fontSize: "14px",
                  border: "1px solid #33333380",
                  padding: "10px",
                  borderRadius: "8px",
                  marginBottom: "8px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <Box>
                <Box>
                  <p style={{
                    backgroundColor: "rgba(0, 0, 200, 0.1)",
                    borderRadius: "8px",
                    padding: "5px 10px",
                    marginBottom: "10px",
                    color: "blue",
                    fontWeight: "bold",
                  }}>
                    <TaskIcon sx={{ verticalAlign: "middle", marginRight: "5px" }} />
                    タスク: {t.task}
                  </p>
                  <p style={{
                    backgroundColor: "rgba(0, 200, 0, 0.1)",
                    borderRadius: "8px",
                    padding: "5px 10px",
                    marginBottom: "10px",
                    color: "green",
                    fontWeight: "bold",
                  }}>
                    <PlayArrowIcon sx={{ verticalAlign: "middle", marginRight: "5px" }} />
                    開始: {t.startTime} {wbs.timeStep}後
                  </p>
                  <p style={{
                    backgroundColor: "rgba(239, 239, 43, 0.2)",
                    borderRadius: "8px",
                    padding: "5px 10px",
                    marginBottom: "10px",
                    color: "orange",
                    fontWeight: "bold",
                  }}>
                    <FlagIcon sx={{ verticalAlign: "middle", marginRight: "5px" }} />
                    終了: {t.endTime} {wbs.timeStep}後
                  </p>
                </Box>
                <p>概要: {t.description}</p>
                <br/>
                </Box>
                <Button
                  color="error"
                  variant="contained"
                  onClick={() => {
                    submit(t, index);
                  }}
                  disabled={isLoading}
                  size="small"
                >
                  リスク分析をする
                </Button>
              </Box>
            )
          }) }
          </Box>
        </Box>
      </Box>
      <Snackbar
        open={!!snackbarContent}
        message={snackbarContent}
        autoHideDuration={10000}
      />
    </Box>
  )
}

export default Wbs;