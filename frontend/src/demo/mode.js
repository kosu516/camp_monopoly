export const isDemo = process.env.REACT_APP_DEMO === "true";
export const defaultDemoRole = "team01";

const npcRoutes = ["addmoney", "resources", "stage-display"];
const adminRoutes = ["accounting", "accounting-result", "broadcast", "gamebonus"];
const demoRoutes = new Set([
  "/", "notifications", "teams", "properties", "map", "resourcesview",
  ...npcRoutes, ...adminRoutes,
]);

const routeName = (route) => route.replace(/^\/(?=.)|\/$/g, "") || "/";
export const isDemoRoute = (route) => demoRoutes.has(routeName(route));

export function demoRoleForRoute(route) {
  const name = routeName(route);
  if (adminRoutes.includes(name)) return "admin";
  if (npcRoutes.includes(name)) return "NPC";
  return null;
}
