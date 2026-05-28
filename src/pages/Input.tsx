import { Box, Button, TextField } from "@mui/material"
import { useState, type Dispatch, type SetStateAction } from "react";
import { AZURE_FUNCTION_URL } from "../const/url";
import { Link, useNavigate } from "react-router";

import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';

type Props = {
  projectDescription: string;
  setProjectDescription: Dispatch<SetStateAction<string>>;
  projectPurpose: string;
  setProjectPurpose: Dispatch<SetStateAction<string>>;
  projectRequirements: string;
  setRequirements: Dispatch<SetStateAction<string>>;
  setWbs: Dispatch<SetStateAction<any>>;
}

const Input: React.FC<Props> = ({
  projectDescription,
  setProjectDescription,
  projectPurpose,
  setProjectPurpose,
  projectRequirements,
  setRequirements,
  setWbs
}) => {
  const [idLoading, setIdLoading] = useState<boolean>(false);
  const navigate = useNavigate();
  const submit = async() => {
    if (!projectDescription || !projectPurpose || !projectRequirements) {
      alert("プロジェクトの概要、目的、要件を入力してください");
      return;
    }
    setIdLoading(true);
    const projectText = `プロジェクトの概要:${projectDescription}\nプロジェクトの目的:${projectPurpose}\nプロジェクトの要件:${projectRequirements}`;
    try {
      const response = await fetch(`https://${AZURE_FUNCTION_URL}/wbs-openai`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          projectDescription: projectText,
          path: "/chatWbs"
        })
      });
      const data = await response.json();
      setWbs(data);
      navigate("/wbs");
    } catch (error) {
      console.error(error);
      alert("WBSの取得に失敗しました。時間をおいて再度お試しください。");
    } finally {
      setIdLoading(false);
    }
  }
  return (
    <Box sx={{
      padding: "16px",
      textAlign: "left",
      backgroundColor: "white",
      borderRadius: "8px",
    }}>
      <p><Link to="/riskInput" style={{
        textDecoration: "none",
        color: "black"
      }}>
        <ArrowBackIosIcon sx={{ verticalAlign: "middle", marginRight: "5px" }} />
        ダウンロードしたJSONを可視化する
      </Link></p>
      <h3>STEP1：WBSを作成する</h3>
      <TextField
        label="プロジェクトの概要"
        multiline rows={2} fullWidth
        value={projectDescription}
        onChange={(e) => {
          setProjectDescription(e.target.value);
        }}
      />
      <TextField
        label="プロジェクトの目的"
        multiline rows={3} fullWidth
        value={projectPurpose}
        onChange={(e) => {
          setProjectPurpose(e.target.value);
        }}
        sx={{
          marginTop: "16px",
        }}
      />
      <TextField
        label="プロジェクトの要件"
        multiline rows={8} fullWidth
        value={projectRequirements}
        onChange={(e) => {
          setRequirements(e.target.value);
        }}
        sx={{
          marginTop: "16px",
        }}
      />
      <br/>
      <Button
        variant="contained"
        onClick={submit}
        disabled={idLoading}
        sx={{
          marginTop: "16px",
        }}
      >
        {idLoading ? "WBSを生成中..." : "WBSを生成"}
      </Button>
    </Box>
  )
}

export default Input;