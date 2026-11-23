export const isDemo = process.env.REACT_APP_DEMO === "true";
export const defaultDemoRole = "team01";

export const demoModes = [
  { role: defaultDemoRole, label: "Team Member", home: "/", routes: [] },
  { role: "NPC", label: "NPC", home: "/addmoney", routes: ["addmoney", "resources", "stage-display"] },
  { role: "admin", label: "Accountant", home: "/accounting", routes: ["accounting", "accounting-result"] },
];

const sharedRoutes = new Set([
  "/", "notifications", "teams", "properties", "map", "resourcesview",
]);

const routeName = (route) => route.replace(/^\/(?=.)|\/$/g, "") || "/";
export const isDemoRoute = (route) => sharedRoutes.has(routeName(route)) || Boolean(demoRoleForRoute(route));

export function demoRoleForRoute(route) {
  const name = routeName(route);
  return demoModes.find(({ routes }) => routes.includes(name))?.role ?? null;
}
