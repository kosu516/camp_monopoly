import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button, Dialog, DialogActions, DialogContent, DialogTitle, Divider,
  List, ListItem, ListItemText, ListSubheader, Menu, MenuItem, Typography,
} from "@mui/material";
import RoleContext from "../components/useRole";
import { roleIdMap } from "../components/Login";
import { getDemoTransactions } from "./api";
import { demoModes } from "./mode";

const number = new Intl.NumberFormat("en-US", { signDisplay: "exceptZero" });

export default function DemoControls() {
  const { role, setRole, setRoleId, onDemoReset } = useContext(RoleContext);
  const [anchor, setAnchor] = useState(null);
  const [transactions, setTransactions] = useState(null);
  const navigate = useNavigate();

  const close = () => setAnchor(null);

  const openMode = ({ role: nextRole, home }) => {
    setRole(nextRole);
    setRoleId(roleIdMap[nextRole]);
    close();
    navigate(home);
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
        <ListSubheader>Demo Modes</ListSubheader>
        {demoModes.map((mode) => (
          <MenuItem
            key={mode.role}
            role="menuitemradio"
            aria-checked={role === mode.role}
            selected={role === mode.role}
            onClick={() => openMode(mode)}
          >
            {mode.label}
          </MenuItem>
        ))}
        <Divider />
        <MenuItem onClick={() => {
          setTransactions(getDemoTransactions());
          close();
        }}>Transaction History</MenuItem>
        <MenuItem onClick={() => {
          close();
          navigate("/", { replace: true });
          onDemoReset();
        }}>Reset Sample Data</MenuItem>
        <MenuItem component="a" href="https://github.com/kosu516/camp_monopoly">
          Source on GitHub
        </MenuItem>
      </Menu>
      <Dialog open={transactions !== null} onClose={() => setTransactions(null)} fullWidth maxWidth="xs">
        <DialogTitle>Recent Transactions</DialogTitle>
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
          ) : <Typography>No transactions yet.</Typography>}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTransactions(null)}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
