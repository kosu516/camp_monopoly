export const playerId = 1;
export const voucherPrice = 600;
const coinPrice = 200;
const maxLevel = 3;

export const teams = [
  { id: playerId, name: "第一小隊", cash: 18000, vouchers: 3, coins: 8 },
  { id: 2, name: "第二小隊", cash: 14500, vouchers: 1, coins: 5 },
  { id: 3, name: "第三小隊", cash: 14800, vouchers: 0, coins: 4 },
];

export const properties = [
  { id: 1, name: "校門廣場", zone: "北區", row: 1, column: 1, price: 1800, upgrade: 900, owner: 0 },
  { id: 2, name: "總圖書館", zone: "北區", row: 1, column: 2, price: 2400, upgrade: 1200, owner: 0 },
  { id: 3, name: "椰林步道", zone: "北區", row: 1, column: 3, price: 2000, upgrade: 1000, owner: 0 },
  { id: 4, name: "電機一館", zone: "北區", row: 1, column: 4, price: 3200, upgrade: 1600, owner: 2 },
  { id: 5, name: "創客工坊", zone: "東區", row: 2, column: 4, price: 2800, upgrade: 1400, owner: 0 },
  { id: 6, name: "實驗教室", zone: "東區", row: 3, column: 4, price: 2200, upgrade: 1100, owner: 0 },
  { id: 7, name: "活動中心", zone: "東區", row: 4, column: 4, price: 3000, upgrade: 1500, owner: 3 },
  { id: 8, name: "校園書店", zone: "南區", row: 4, column: 3, price: 1600, upgrade: 800, owner: 0 },
  { id: 9, name: "湖畔木棧", zone: "南區", row: 4, column: 2, price: 2000, upgrade: 1000, owner: 0 },
  { id: 10, name: "南側草地", zone: "南區", row: 4, column: 1, price: 1400, upgrade: 700, owner: 0 },
  { id: 11, name: "社團教室", zone: "西區", row: 3, column: 1, price: 2100, upgrade: 1050, owner: 2 },
  { id: 12, name: "學生餐廳", zone: "西區", row: 2, column: 1, price: 2600, upgrade: 1300, owner: 0 },
];

export const initialPropertyId = 2;

export function newGame() {
  return {
    team: { ...teams[0] },
    properties: properties.map((property) => ({
      ...property,
      level: property.owner ? 1 : 0,
    })),
    transactions: [],
  };
}

export function propertyAction(property, cash) {
  if (property.owner && property.owner !== playerId) {
    return { label: "其他小隊持有", enabled: false };
  }
  if (property.level >= maxLevel) {
    return { label: "已達最高等級", enabled: false };
  }

  const isUpgrade = property.owner === playerId;
  const cost = isUpgrade ? property.upgrade : property.price;
  return {
    label: isUpgrade ? "升級地產" : "購買地產",
    enabled: cash >= cost,
    cost,
  };
}

export function rentAtLevel(property, level) {
  return Math.round(property.price * [0.2, 0.6, 1.4][level - 1]);
}

export function buyOrUpgrade(game, propertyId) {
  const property = game.properties.find(({ id }) => id === propertyId);
  if (!property) return game;
  const { enabled, cost } = propertyAction(property, game.team.cash);
  if (!enabled) return game;

  const level = property.level + 1;
  const description = level === 1 ? `購入${property.name}` : `${property.name}升為 ${level} 級`;
  return {
    team: { ...game.team, cash: game.team.cash - cost },
    properties: game.properties.map((item) => (
      item.id === propertyId ? { ...item, owner: playerId, level } : item
    )),
    transactions: [{ description, amount: -cost }, ...game.transactions].slice(0, 5),
  };
}

export function exchangeVoucher(game) {
  if (game.team.vouchers === 0) return game;
  return {
    ...game,
    team: {
      ...game.team,
      vouchers: game.team.vouchers - 1,
      cash: game.team.cash + voucherPrice,
    },
    transactions: [
      { description: "兌換 1 張贖罪券", amount: voucherPrice },
      ...game.transactions,
    ].slice(0, 5),
  };
}

export function settlement(team, lands) {
  const owned = lands.filter(({ owner }) => owner === team.id);
  // The camp's final accounting values land at half the acquisition and upgrade cost.
  const propertyValue = Math.round(owned.reduce((sum, property) => (
    sum + (property.price + property.upgrade * (property.level - 1)) * 0.5
  ), 0));
  const resources = team.vouchers * voucherPrice + team.coins * coinPrice;
  return {
    ...team,
    owned: owned.length,
    resources,
    propertyValue,
    total: team.cash + resources + propertyValue,
  };
}
