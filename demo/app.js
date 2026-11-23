import {
  buyOrUpgrade, exchangeVoucher, initialPropertyId, newGame, playerId,
  properties, propertyAction, rentAtLevel, settlement, teams, voucherPrice,
} from "./game.js";

const get = (id) => document.getElementById(id);
const number = new Intl.NumberFormat("zh-TW");
const money = (amount) => `$${number.format(amount)}`;
const signedMoney = (amount) => `${amount < 0 ? "−" : "+"}${money(Math.abs(amount))}`;
const teamNames = new Map(teams.map(({ id, name }) => [id, name]));
const actionButton = get("property-action");
const exchangeButton = get("exchange");
const resultNote = get("result-note");
const exchangeNote = get("exchange-note");

let game = newGame();
let selectedId = initialPropertyId;

const tiles = new Map(properties.map((property) => {
  const tile = document.createElement("button");
  const label = document.createElement("strong");
  const detail = document.createElement("span");
  tile.type = "button";
  tile.className = "tile";
  tile.style.gridRow = property.row;
  tile.style.gridColumn = property.column;
  tile.setAttribute("aria-controls", "property-details");
  label.textContent = property.name;
  tile.append(label, detail);
  tile.addEventListener("click", () => {
    selectedId = property.id;
    resultNote.textContent = "";
    render();
  });
  get("tiles").append(tile);
  return [property.id, { tile, detail }];
}));

function renderBoard() {
  for (const property of game.properties) {
    const { tile, detail } = tiles.get(property.id);
    tile.dataset.owner = property.owner === playerId ? "mine" : property.owner ? "other" : "available";
    tile.setAttribute("aria-pressed", String(property.id === selectedId));
    detail.textContent = property.owner ? `${property.level} 級` : money(property.price);
    const owner = teamNames.get(property.owner) ?? "待購";
    tile.setAttribute("aria-label", `${property.name}，${owner}，${detail.textContent}`);
  }
}

function renderProperty() {
  const property = game.properties.find(({ id }) => id === selectedId);
  const action = propertyAction(property, game.team.cash);
  const owner = teamNames.get(property.owner);
  const ownedByPlayer = property.owner === playerId;
  const rentLevel = property.level || 1;
  const showUpgradeCost = ownedByPlayer && action.cost !== undefined;

  get("property-zone").textContent = `${property.zone} · ${String(property.id).padStart(2, "0")}`;
  get("property-title").textContent = property.name;
  get("property-owner").textContent = owner ?? "可購買";
  get("property-owner").dataset.owner = tiles.get(property.id).tile.dataset.owner;
  get("property-description").textContent = owner
    ? `目前 ${property.level} 級，由${owner}經營。`
    : "尚未有小隊持有，購買後成為一級地產。";
  get("property-price-label").textContent = showUpgradeCost ? "升級成本" : "原始地價";
  get("property-price").textContent = money(showUpgradeCost ? property.upgrade : property.price);
  get("property-rent-label").textContent = owner ? "目前租金" : "一級租金";
  get("property-rent").textContent = money(rentAtLevel(property, rentLevel));
  actionButton.textContent = action.enabled
    ? `${action.label} · ${money(action.cost)}`
    : action.cost === undefined ? action.label : "現金不足";
  actionButton.disabled = !action.enabled;
}

function renderSettlement(player) {
  const values = {
    cash: money(player.cash),
    owned: `${player.owned} 筆`,
    resources: money(player.resources),
    total: money(player.total),
    propertyValue: money(player.propertyValue),
    vouchers: player.vouchers,
    coins: player.coins,
  };
  for (const value of document.querySelectorAll("[data-value]")) {
    value.textContent = values[value.dataset.value];
  }

  const rankings = [player, ...teams.slice(1).map((team) => settlement(team, game.properties))];
  rankings.sort((a, b) => b.total - a.total || a.id - b.id);
  const rows = rankings.map((team, index) => {
    const row = document.createElement("tr");
    row.classList.toggle("our-team", team.id === playerId);
    for (const value of [index + 1, team.name, money(team.total)]) {
      row.insertCell().textContent = value;
    }
    return row;
  });
  get("rankings").replaceChildren(...rows);
}

function renderLedger() {
  const entries = game.transactions.map(({ description, amount }) => {
    const entry = document.createElement("li");
    const title = document.createElement("span");
    const change = document.createElement("strong");
    title.textContent = description;
    change.textContent = signedMoney(amount);
    change.classList.toggle("credit", amount > 0);
    entry.append(title, change);
    return entry;
  });
  get("ledger").replaceChildren(...entries);
  get("ledger-empty").hidden = entries.length !== 0;
}

function render() {
  const player = settlement(game.team, game.properties);
  renderBoard();
  renderProperty();
  renderSettlement(player);
  renderLedger();
  exchangeButton.disabled = player.vouchers === 0;
  exchangeButton.textContent = exchangeButton.disabled
    ? "贖罪券已用完"
    : `兌換 1 張贖罪券 · +${money(voucherPrice)}`;
}

actionButton.addEventListener("click", () => {
  const nextGame = buyOrUpgrade(game, selectedId);
  if (nextGame === game) return;
  game = nextGame;
  render();
  const { description, amount } = game.transactions[0];
  resultNote.textContent = `${description}。${signedMoney(amount)}，現金剩餘 ${money(game.team.cash)}。`;
});

exchangeButton.addEventListener("click", () => {
  const nextGame = exchangeVoucher(game);
  if (nextGame === game) return;
  game = nextGame;
  render();
  exchangeNote.textContent = `已兌換 1 張贖罪券，現金增加 ${money(voucherPrice)}。現金餘額 ${money(game.team.cash)}。`;
});

get("reset").addEventListener("click", () => {
  game = newGame();
  selectedId = initialPropertyId;
  exchangeNote.textContent = "";
  render();
  resultNote.textContent = "已重設遊戲。";
});

render();
