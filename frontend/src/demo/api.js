import { createDemoState } from "./data";
import { demoSocket } from "./socket";

let state = createDemoState();

export function resetDemo() {
  state = createDemoState();
}

export function getDemoTransactions() {
  return state.transactions;
}

function fail(status, message) {
  const error = new Error(message);
  error.response = { status, data: { message } };
  throw error;
}

function findById(items, id) {
  const item = items.find((entry) => entry.id === Number(id));
  if (!item) fail(404, "找不到項目");
  return item;
}

function track(team, description, change) {
  state.transactions = [
    { teamname: team.teamname, description, change },
    ...state.transactions,
  ].slice(0, 5);
}

function purchase({ teamId, landId, mode }) {
  const team = findById(state.teams, teamId);
  const land = findById(state.lands, landId);
  if (land.type !== "Building" || !["Buy", "Upgrade"].includes(mode)) {
    fail(400, "請選擇可交易的地產");
  }
  const isBuy = mode === "Buy";
  if (isBuy && land.owner !== 0) fail(409, "此地產已有持有人");
  if (!isBuy && land.owner !== team.id) fail(409, "只有持有人可以升級");
  if (!isBuy && land.level >= 3) fail(409, "地產已達最高等級");
  const price = isBuy ? land.price.buy : land.price.upgrade;
  if (team.money < price) fail(409, "現金不足");

  team.money -= price;
  land.owner = team.id;
  land.level += 1;
  track(team, isBuy ? `購入${land.name}` : `${land.name}升為 ${land.level} 級`, -price);
  return { money: team.money, land };
}

function changeResources({ teamId, resourceId, number, mode }, trade) {
  const team = findById(state.teams, teamId);
  const resource = findById(state.resources, resourceId);
  const quantity = Number(number);
  if (!Number.isFinite(quantity) || quantity <= 0 || ![0, 1].includes(mode)) {
    fail(400, "Invalid resource quantity");
  }
  const key = resource.id === 0 ? "love" : "eecoin";
  const change = mode === 1 ? quantity : -quantity;
  const cashChange = trade ? -change * resource.price : 0;
  if (team.resources[key] + change < 0) fail(409, "Not enough resources");
  if (cashChange < 0 && team.money + cashChange < 0) fail(409, "Not enough money");

  team.resources[key] += change;
  team.money += cashChange;
  const verb = trade ? (mode === 1 ? "買入" : "賣出") : (mode === 1 ? "增加" : "扣除");
  track(team, `${verb} ${quantity} ${resource.name}`, cashChange);
  return "Success";
}

function applyMoney({ id, dollar, gameBonus }, save) {
  const team = findById(state.teams, id);
  const amount = Number(dollar);
  const change = Number.isFinite(amount)
    ? Math.round(amount * (gameBonus && amount > 0 ? state.gameBonus : 1))
    : 0;
  const money = team.money + change;
  if (save) {
    team.money = money;
    track(team, "調整現金", change);
  }
  return { money };
}

function getAccounting() {
  return { count: state.latestResult?.count ?? 0, latestResult: state.latestResult };
}

function runAccounting() {
  const results = state.teams.map((team) => {
    const cash = Math.round(team.money);
    const resourceValue = team.resources.love * state.resources[0].price
      + team.resources.eecoin * state.resources[1].price;
    const propertyCounts = { level1: 0, level2: 0, level3: 0 };
    let propertyCost = 0;
    for (const land of state.lands.filter(({ owner }) => owner === team.id)) {
      propertyCounts[`level${land.level}`] += 1;
      propertyCost += land.price.buy + land.price.upgrade * (land.level - 1);
    }
    const propertyValue = Math.round(propertyCost / 2);
    return {
      teamId: team.id,
      teamname: team.teamname,
      bankruptcyCount: team.bankruptcyCount,
      cash,
      resourceValue,
      propertyValue,
      propertyCounts,
      total: cash + resourceValue + propertyValue,
    };
  });
  results.sort((a, b) => b.total - a.total || a.teamId - b.teamId);
  state.latestResult = { count: getAccounting().count + 1, results, createdAt: Date.now() };
  return state.latestResult;
}

function postBroadcast({ title, description, level }) {
  const message = { title, description, level, createdAt: Date.now() };
  state.broadcasts = [message, ...state.broadcasts].slice(0, 20);
  demoSocket.emit("broadcast", message);
  return message;
}

function setGameBonus({ value }) {
  const bonus = Number(value);
  if (!Number.isFinite(bonus) || bonus < 0.1 || bonus > 10) {
    fail(400, "Game bonus must be between 0.1 and 10");
  }
  state.gameBonus = bonus;
  return { value: bonus };
}

const requests = {
  "get team": () => state.teams,
  "get team/:id": (_, id) => findById(state.teams, id),
  "get land": () => state.lands,
  "get land/:id": (_, id) => findById(state.lands, id),
  "get resourceInfo": () => state.resources,
  "get resourcePrice": () => state.resources.map(({ price }) => price),
  "post resource": () => "Success",
  "post sellResource": (data) => changeResources(data, true),
  "post controlResource": (data) => changeResources(data, false),
  "get add": (data) => applyMoney(data, false),
  "post add": (data) => applyMoney(data, true),
  "post purchaseProperty": purchase,
  "get event": () => ({ id: 0, title: "營隊大富翁展示版", description: "使用範例資料，點右上角 Demo 體驗不同操作。" }),
  "get broadcast": () => state.broadcasts,
  "post broadcast": postBroadcast,
  "get accounting": getAccounting,
  "post accounting": runAccounting,
  "get gameBonus": () => ({ value: state.gameBonus }),
  "put gameBonus": setGameBonus,
};

export async function demoAdapter(config) {
  const [endpoint, id] = config.url.replace(/^\//, "").split("/");
  const handle = requests[`${config.method} ${endpoint}${id ? "/:id" : ""}`];
  if (!handle) fail(404, "此功能不在展示範圍內");

  const body = config.data ? JSON.parse(config.data) : config.params;
  const data = JSON.parse(JSON.stringify(handle(body, id)));
  return { data, status: 200, statusText: "OK", headers: {}, config };
}
