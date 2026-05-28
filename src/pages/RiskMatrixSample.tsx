import { useState } from "react";
// 設備工事
import stakeholderRisks3 from "../const/1779884337217_stakeholderRisks.json";
// 基礎工事
import stakeholderRisks1 from "../const/1779882834108_stakeholderRisks.json";
// 躯体工事
import stakeholderRisks2 from "../const/1779883367555_stakeholderRisks.json";
import { Box, Button, MenuItem, Select } from "@mui/material";

function RiskMatrix() {
  const [risks, setRisks] = useState(stakeholderRisks2);
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
  const [currentStakeholder, setCurrentStakeholder] = useState<string>("");
  const [currentRisks, setCurrentRisks] = useState<any>(null);
  const [displayRisksCount, setDisplayRisksCount] = useState<number>(5);
  return (
    <Box>
      <h3>
      <Select
        onChange={(e) => {
          switch (e.target.value) {
            case "stakeholder1":
              setRisks(stakeholderRisks1);
              break;
            case "stakeholder2":
              setRisks(stakeholderRisks2);
              break;
            case "stakeholder3":
              setRisks(stakeholderRisks3);
              break;
            default:
              setRisks(stakeholderRisks1);
          }
        }}
        defaultValue="stakeholder2"
        sx={{
          height: "50px",
          marginRight: "10px",
        }}
      >
        <MenuItem value="stakeholder1">基礎工事</MenuItem>
        <MenuItem value="stakeholder2">躯体工事</MenuItem>
        <MenuItem value="stakeholder3">設備工事</MenuItem>
      </Select>
      のステークホルダー一覧:</h3>
      <Box sx={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: "10px",
        padding: "5px 16px",
      }}>
        {stakeholderRiskMatrix.map(([stakeholderName, data]: any, index) => (
          <Box key={stakeholderName}
            sx={{
              border: "1px solid black",
              marginBottom: "16px",
              padding: "15px",
              backgroundColor: `rgba(255, 0, 0, ${(1 - index * 0.1) / 2})`,
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
              fontSize: "12px"
            }}>
              <h2 style={{
                fontSize: "16px",
              }}>{stakeholderName}</h2>
              <p>平均遅延時間: {data.averageDelayTime}週</p>
              <p>平均発生確率スコア: {data.averageLikelihoodScore}</p>
              <p>平均遅延時間×発生確率スコア: {data.averageDelayAndLikelihoodScore}</p>
            </Box>
          </Box>
        ))}
      </Box>
      { currentStakeholder ? 
      <Box sx={{
        marginBottom: "16px",
      }}>
      <h3>「{currentStakeholder}」のリスク一覧:</h3>
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
              <p>
                関連ステークホルダー：
                {risk.otherStakholder}
              </p>
              <p>遅延時間: {risk.delayTime}週</p>
              <p>発生確率スコア: {risk.likelihoodScore}</p>
              <br />
              <p>内容：{risk.description}</p>
              <hr/>
              <p>回避策：{risk.mitigation}</p>
            </Box>
          ))}
      </Box>
      <br/>
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
      : null }
    </Box>
  )
}

export default RiskMatrix;
