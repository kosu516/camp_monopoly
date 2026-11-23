import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button, Dialog, DialogActions, DialogContent, DialogTitle, Divider,
  List, ListItem, ListItemText, ListSubheader, Menu, MenuItem, Typography,
} from "@mui/material";
import RoleContext from "../components/useRole";
import { roleIdMap } from "../components/Login";
import { getDemoTransactions } from "./api";
import { defaultDemoRole, demoRoleForRoute } from "./mode";

const views = [
  { path: "/", label: "小隊首頁" },
  { path: "/addmoney", label: "NPC · 購地與升級" },
  { path: "/resources", label: "NPC · 資源交易" },
  { path: "/accounting", label: "管理員 · 期末結算" },
];
const number = new Intl.NumberFormat("zh-TW", { signDisplay: "exceptZero" });

export default function DemoControls() {
  const { setRole, setRoleId, onDemoReset } = useContext(RoleContext);
  const [anchor, setAnchor] = useState(null);
  const [transactions, setTransactions] = useState(null);
  const navigate = useNavigate();

  const close = () => setAnchor(null);

  const openView = (path) => {
    const role = demoRoleForRoute(path) || defaultDemoRole;
    setRole(role);
    setRoleId(roleIdMap[role]);
    close();
    navigate(path);
  };

  return (
    <>
      <Button
        color="inherit"
        aria-haspopup="menu"
        aria-expanded={Boolean(anchor)}
        onClick={(event) => setAnchor(event.currentTarget)}
      >
        Demo
      </Button>
      <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={close}>
        <ListSubheader>展示模式 · 範例資料</ListSubheader>
        {views.map(({ path, label }) => (
          <MenuItem key={path} onClick={() => openView(path)}>{label}</MenuItem>
        ))}
        <Divider />
        <MenuItem onClick={() => {
          setTransactions(getDemoTransactions());
          close();
        }}>交易紀錄</MenuItem>
        <MenuItem onClick={() => {
          close();
          navigate("/", { replace: true });
          onDemoReset();
        }}>重設範例資料</MenuItem>
        <MenuItem component="a" href="https://github.com/kosu516/camp_monopoly">
          GitHub 原始碼
        </MenuItem>
      </Menu>
      <Dialog open={transactions !== null} onClose={() => setTransactions(null)} fullWidth maxWidth="xs">
        <DialogTitle>最近五筆交易</DialogTitle>
        <DialogContent>
          {transactions?.length ? (
            <List disablePadding>
              {transactions.map(({ teamname, description, change }, index) => (
                <ListItem key={index} disableGutters>
                  <ListItemText primary={description} secondary={teamname} />
                  <Typography sx={{ ml: 2 }}>{number.format(change)}</Typography>
                </ListItem>
              ))}
            </List>
          ) : <Typography>目前沒有交易紀錄。</Typography>}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTransactions(null)}>關閉</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
