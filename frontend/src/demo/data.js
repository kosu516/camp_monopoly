const places = [
  ["遊戲格", "Game"],
  ["椰林大道"], ["台北故宮"], ["東京鐵塔"], ["遊戲格", "Game"],
  ["東非大裂谷"], ["蘇伊士運河"], ["埃及金字塔"], ["遊戲格", "Game"],
  ["電機系大監獄", "Jail"], ["機會命運", "Chance"], ["提示格", "Clue"],
  ["遊戲格", "Game"], ["袋鼠的家"], ["大堡礁"], ["雪梨歌劇院"],
  ["遊戲格", "Game"], ["比薩斜塔"], ["艾菲爾鐵塔"], ["大笨鐘"],
  ["遊戲格", "Game"], ["鬥牛競技場", "Arena"], ["機會命運", "Chance"],
  ["提示格", "Clue"], ["遊戲格", "Game"], ["拉斯維加斯"], ["尼加拉瀑布"],
  ["帝國大廈"], ["遊戲格", "Game"], ["機會命運", "Chance"], ["卡片商店", "Card"],
  ["轉運站", "Transport"], ["遊戲格", "Game"], ["阿他加馬高原"], ["馬丘比丘"],
  ["伊瓜蘇瀑布"], ["天空競技場", "Arena"], ["遊戲格", "Game"], ["企鵝的老巢"],
  ["總召的宿舍"], ["海豹的學校"], ["機會命運", "Chance"],
];

const startingOwners = { 4: 2, 14: 3, 18: 4, 26: 5, 34: 6, 39: 7 };

export function createDemoState() {
  return {
    lands: places.map(([name, type = "Building"], index) => {
      const id = index + 1;
      const owner = startingOwners[id] ?? 0;
      const buy = 1600 + (id % 9) * 400;
      return {
        id, name, type, owner, area: 1, level: owner ? 1 : 0,
        description: type === "Game" ? "認真聽規則！" : "",
        price: { buy, upgrade: buy / 2 },
        rent: [0.2, 0.6, 1.4].map((rate) => Math.round(buy * rate)),
        buffed: 0,
        hawkEye: -1,
      };
    }),
    teams: Array.from({ length: 10 }, (_, index) => ({
      id: index + 1,
      teamname: `第${String(index + 1).padStart(2, "0")}小隊`,
      money: 18000 - index * 450,
      resources: { love: 3 - index % 3, eecoin: 8 - index % 5 },
      bankruptcyCount: 0,
    })),
    resources: [
      { id: 0, name: "贖罪券", price: 600 },
      { id: 1, name: "EE幣", price: 200 },
    ],
    broadcasts: [],
    transactions: [],
    latestResult: null,
    gameBonus: 1,
  };
}
