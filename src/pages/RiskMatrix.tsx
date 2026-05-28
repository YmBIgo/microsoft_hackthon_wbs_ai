import { useState, type Dispatch, type SetStateAction } from "react";
import { Box, Button, MenuItem, Select, Snackbar } from "@mui/material";
import { AZURE_FUNCTION_URL } from "../const/url";
import { Link } from "react-router";

import AccessTimeIcon from '@mui/icons-material/AccessTime';
import TimelineIcon from '@mui/icons-material/Timeline';
import CancelIcon from '@mui/icons-material/Cancel';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import AccessTimeFilledIcon from '@mui/icons-material/AccessTimeFilled';
import WysiwygIcon from '@mui/icons-material/Wysiwyg';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';

type Props = {
  projectDescription: string;
  projectPurpose: string;
  projectRequirements: string;
  stakeholderRiskMatrixData: any;
  wbs: any;
  firstTask: any;
  setFirstTask: Dispatch<SetStateAction<any>>;
}

const RiskMatrix: React.FC<Props> = (props) => {
  const {
    projectDescription,
    projectPurpose,
    projectRequirements,
    stakeholderRiskMatrixData,
    wbs,
    firstTask,
    setFirstTask
  } = props;
  const [risks, setRisks] = useState<any>(stakeholderRiskMatrixData ?? []);
  const stakeholderRiskMatrix = Object.entries(risks.reduce((matrix: any, risk: any) => {
    function addToMatrix(stakeholderName: string, risk: any, matrix2: any, otherStakholder: string) {
      const newMatrix = { ...matrix2 };
      if (!newMatrix[stakeholderName]) {
        newMatrix[stakeholderName] = {};
        newMatrix[stakeholderName].risks = [];
        newMatrix[stakeholderName].averageDelayTime = 0;
        newMatrix[stakeholderName].averageLikelihoodScore = 0;
      }
      newMatrix[stakeholderName].risks = [...newMatrix[stakeholderName].risks, {
        ...risk,
        otherStakholder,
      }];
      const allDelayTime = newMatrix[stakeholderName].risks.map((risk: any) => risk.delayTime);
      newMatrix[stakeholderName].averageDelayTime = Math.floor(allDelayTime.reduce((a: number, b: number) => a + b, 0) / allDelayTime.length * 10) / 10;
      const allLikelihoodScore = newMatrix[stakeholderName].risks.map((risk: any) => risk.likelihoodScore);
      newMatrix[stakeholderName].averageLikelihoodScore = Math.floor(allLikelihoodScore.reduce((a: number, b: number) => a + b, 0) / allLikelihoodScore.length * 10) / 10;
      const allDelayAndLikelihoodScore = newMatrix[stakeholderName].risks.map((risk: any) => risk.delayTime * risk.likelihoodScore);
      newMatrix[stakeholderName].averageDelayAndLikelihoodScore = Math.floor(allDelayAndLikelihoodScore.reduce((a: number, b: number) => a + b, 0) / allDelayAndLikelihoodScore.length ) / 10;
      return newMatrix
    }
    let fixedMatrix = matrix;
    risk.risks.forEach((r: any) => {
      if (risk.stakeholder1 === risk.stakeholder2) {
        fixedMatrix = addToMatrix(risk.stakeholder1, r, fixedMatrix, risk.stakeholder1);
      } else {
        fixedMatrix = addToMatrix(risk.stakeholder1, r, fixedMatrix, risk.stakeholder2);
        fixedMatrix = addToMatrix(risk.stakeholder2, r, fixedMatrix, risk.stakeholder1);
      }
    });
    return fixedMatrix
  }, {}))
    .sort((a: any, b: any) => {
      if (a[1].averageDelayAndLikelihoodScore === b[1].averageDelayAndLikelihoodScore) {
        if (a[1].averageDelayTime === b[1].averageDelayTime) {
          return b[1].averageLikelihoodScore - a[1].averageLikelihoodScore
        }
        return b[1].averageDelayTime - a[1].averageDelayTime
      }
      return b[1].averageDelayAndLikelihoodScore - a[1].averageDelayAndLikelihoodScore
    });
  const downloadJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(risks));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `${wbs.project}_${firstTask.task}_risk_matrix.json`);
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  }
  const [currentStakeholder, setCurrentStakeholder] = useState<string>("");
  const [currentRisks, setCurrentRisks] = useState<any>(null);
  const [displayRisksCount, setDisplayRisksCount] = useState<number>(5);
  const [snackbarContent, setSnackbarContent] = useState<string>("");
  if (!stakeholderRiskMatrixData) {
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
      <Box sx={{
        textAlign: "left",
        padding: "10px"
      }}>
        <p><Link to="/wbs" style={{
          textDecoration: "none",
          color: "black"
        }}>
          <ArrowBackIosIcon sx={{ verticalAlign: "middle", marginRight: "5px" }} />
          WBSに戻る
        </Link></p>
        <p><Link to="/input" style={{
          textDecoration: "none",
          color: "black"
        }}>
        <ArrowBackIosIcon sx={{ verticalAlign: "middle", marginRight: "5px" }} />
          要件入力に戻る
        </Link></p>
        <p><Link to="/riskInput" style={{
          textDecoration: "none",
          color: "black"
        }}>
          <ArrowBackIosIcon sx={{ verticalAlign: "middle", marginRight: "5px" }} />
          ダウンロードしたJSONを可視化する
        </Link></p>
      </Box>
      <h3 style={{
        marginTop: "5px"
      }}>
      STEP3：
      <Select
        onChange={async(e) => {
          const currentTask = wbs.tasks.find((t: any) => t.task === e.target.value);
          const currentTaskIndex = wbs.tasks.findIndex((t: any) => t.task === e.target.value);
          const infoAddedWbs = {
            ...currentTask,
            timeStep: wbs.timeStep,
            project: wbs.project,
            stepIndex: currentTaskIndex,
          };
          setSnackbarContent("ステークホルダーとリスク分析を取得します...通常5分ほど時間がかかります...");
          try {
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
            setRisks(stakeholderRiskMatrix);
            setFirstTask(currentTask);
            setSnackbarContent("");
          } catch (error) {
            console.error(error);
            alert("リスク分析の取得に失敗しました。時間をおいて再度お試しください。");
          }
        }}
        defaultValue={firstTask?.task || "default task"}
        sx={{
          height: "50px",
          marginRight: "10px",
        }}
      >
        { wbs.tasks?.map((t: any) => (
          <MenuItem value={t.task}>{t.task}</MenuItem>
        )) }
      </Select>
      のステークホルダー一覧:
      <Button variant="contained" color="success"
        sx={{
          marginLeft: "20px",
        }}
        onClick={downloadJSON}
      >
        ダウンロードする
      </Button>
      </h3>
      <Box sx={{
        backgroundColor: "rgba(0, 225, 225, 0.15)",
        padding: "10px",
        borderRadius: "8px",
        marginBottom: "16px",
      }}>
        <p>上のセレクトボックスを選び直すことで、別のステップでの検索もできます（検索には5分ほど時間がかかります）。</p>

      </Box>
      <Box sx={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: "10px",
        padding: "5px 16px",
      }}>
        {stakeholderRiskMatrix.map(([stakeholderName, data]: any, index) => (
          <Box key={stakeholderName}
            sx={{
              border: currentStakeholder === stakeholderName ?
              "4px solid red"
              : "1px solid black",
              marginBottom: "16px",
              padding: "15px",
              backgroundColor: `rgba(255, 0, 0, ${(1 - index * 0.1) / 2 - 0.14})`,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              cursor: "pointer",
              borderRadius: "8px",
            }}
            onClick={() => {
              setCurrentRisks(data)
              setCurrentStakeholder(stakeholderName)
              setDisplayRisksCount(5);
            }}
          >
            <Box sx={{
              fontSize: "12px",
            }}>
              <h2 style={{
                fontSize: "16px",
                height: "40px",
              }}>{stakeholderName}</h2>
              <Box sx={{
                backgroundColor: `rgba(255, 0, 0, ${
                  index < 6 ?
                  (1 - index * 0.1) / 2 - 0.2
                  :
                  0.07
                })`,
                padding: "5px 10px",
                borderRadius: "10px",
                color: "black",
                marginBottom: "10px",
                width: "15vw",
                display: "flex",
                justifyContent: "space-between",
              }}>
                <Box>
                  <AccessTimeIcon sx={{
                    color: "red",
                    verticalAlign: "middle",
                    marginRight: "5px",
                  }} />
                  遅延期間:
                </Box>
                <Box sx={{
                  color: "red",
                  fontWeight: "bold",
                  fontSize: "18px",
                }}>{data.averageDelayTime}週</Box>
              </Box>
              <Box sx={{
                backgroundColor: `rgba(255, 0, 0, ${
                  index < 5 ?
                  (1 - index * 0.1) / 2 - 0.2
                  :
                  0.07
                })`,
                padding: "5px 10px",
                borderRadius: "10px",
                color: "black",
                marginBottom: "10px",
                width: "15vw",
                display: "flex",
                justifyContent: "space-between",
              }}>
                <Box>
                  <TimelineIcon sx={{
                    color: "red",
                    verticalAlign: "middle",
                    marginRight: "5px",
                  }} />
                  発生確率スコア:
                </Box>
                <Box sx={{
                  color: "red",
                  fontWeight: "bold",
                  fontSize: "18px",
                }}>{data.averageLikelihoodScore}</Box>
              </Box>
              <Box sx={{
                backgroundColor: `rgba(255, 0, 0, ${
                  index < 6 ?
                  (1 - index * 0.1) / 2 - 0.2
                  :
                  0.07
                })`,
                padding: "5px 10px",
                borderRadius: "10px",
                color: "black",
                marginBottom: "10px",
                width: "15vw",
                display: "flex",
                justifyContent: "space-between",
              }}>
                <Box>
                  <CancelIcon sx={{
                    color: "red",
                    verticalAlign: "middle",
                    marginRight: "5px",
                  }} />
                  スコア:
                </Box>
                <Box sx={{
                  color: "red",
                  fontWeight: "bold",
                  fontSize: "18px",
                }}>{data.averageDelayAndLikelihoodScore}</Box>
              </Box>
            </Box>
          </Box>
        ))}
      </Box>
      { currentStakeholder ? 
      <Box sx={{
        marginBottom: "16px",
      }}>
      <h3>「{currentStakeholder}」のリスク一覧（{currentRisks?.risks.length}件）</h3>
      <Box sx={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
        gap: "16px",
        padding: "5px 16px",
      }}>
        {currentRisks?.risks.
          sort((a: any, b: any) => {
            return b.delayTime * b.likelihoodScore - a.delayTime * a.likelihoodScore;
          })
          .slice(0, displayRisksCount)
          .map((risk: any, index: number) => (
            <Box key={index}
              sx={{
                textAlign: "left",
                fontSize: "12px",
                border: "1px solid #33333380",
                padding: "10px",
                borderRadius: "8px",
              }}
            >
              <Box>
                <p style={{
                  backgroundColor: "rgba(0, 0, 200, 0.1)",
                  borderRadius: "8px",
                  padding: "5px 10px",
                  marginBottom: "10px",
                }}>
                  <PeopleAltIcon sx={{
                    color: "blue",
                    verticalAlign: "middle",
                    marginRight: "5px",
                  }} />
                  関連ステークホルダー：
                  <br/>
                  <span style={{
                    color: "blue",
                    fontWeight: "bold",
                  }}>
                  {risk.otherStakholder}
                  </span>
                </p>
                <p style={{
                  backgroundColor: "rgba(0, 200, 0, 0.1)",
                  borderRadius: "8px",
                  padding: "5px 10px",
                  marginBottom: "10px",
                }}>
                  <AccessTimeFilledIcon sx={{
                    color: "green",
                    verticalAlign: "middle",
                    marginRight: "5px",
                  }} />
                  遅延時間:
                  <span style={{
                    color: "green",
                    marginLeft: "10px",
                    fontWeight: "bold",
                  }}>
                  {risk.delayTime}週
                  </span>
                </p>
                <p style={{
                  backgroundColor: "rgba(239, 239, 43, 0.2)",
                  borderRadius: "8px",
                  padding: "5px 10px",
                  marginBottom: "10px",
                }}>
                  <WysiwygIcon sx={{
                    color: "orange",
                    verticalAlign: "middle",
                    marginRight: "5px",
                  }} />
                  発生確率スコア:
                  <span style={{
                    color: "orange",
                    marginLeft: "10px",
                    fontWeight: "bold",
                  }}>
                  {risk.likelihoodScore}
                  </span>
                </p>
              </Box>
              <p>内容：{risk.description}</p>
              <hr/>
              <p>回避策：{risk.mitigation}</p>
            </Box>
          ))}
      </Box>
      <br/>
      <Box sx={{
        textAlign: "center",
      }}>
        <Button
          variant="contained" color="primary"
          onClick={() => {
            setDisplayRisksCount(displayRisksCount + 5);
          }}
          disabled={displayRisksCount >= currentRisks?.risks.length}
        >
          追加読み込み
        </Button>
      </Box>
      </Box>
      : null }
      <Snackbar
        open={!!snackbarContent}
        message={snackbarContent}
        autoHideDuration={10000}
      />
    </Box>
  )
}

export default RiskMatrix;
